import { PrismaClient } from '@prisma/client';
import { compareArticles } from '../services/comparatorService.js';
import { uploadToIPFS } from '../services/ipfs.js';

const prisma = new PrismaClient();

// ─── Helper ──────────────────────────────────────────────────────────────────

const getUserDisplayName = async (walletAddress) => {
  try {
    if (!walletAddress || walletAddress.startsWith('anon_')) return 'Anonymous';

    const user = await prisma.user.findUnique({ where: { walletAddress } });

    if (user?.displayName) return user.displayName;

    return `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`;
  } catch {
    return 'Anonymous';
  }
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/comparisons/generate
 * Scrapes both articles and runs AI comparison.
 * Result is persisted to DB automatically (cached for 7 days).
 * Returns { cached: bool, comparison: <record> }.
 */
export const generateComparison = async (req, res, next) => {
  try {
    const { urlOne, urlTwo } = req.body;

    if (!urlOne || !urlTwo) {
      return res.status(400).json({ error: 'Both article URLs (urlOne, urlTwo) are required' });
    }

    // Validate URL format
    try {
      new URL(urlOne);
      new URL(urlTwo);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    if (urlOne === urlTwo) {
      return res.status(400).json({ error: 'Please provide two different URLs' });
    }

    // ── Cache check (order-independent, 7-day TTL) ────────────────────────
    const [sortedOne, sortedTwo] = [urlOne, urlTwo].sort();

    const existing = await prisma.comparison.findFirst({
      where: {
        OR: [
          { articleOneUrl: sortedOne, articleTwoUrl: sortedTwo },
          { articleOneUrl: sortedTwo, articleTwoUrl: sortedOne },
        ],
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });

    if (existing) {
      console.log('✅ Returning cached comparison:', existing.id);
      return res.json({ cached: true, comparison: existing });
    }

    // ── Generate new comparison ───────────────────────────────────────────
    console.log('🔬 Running new comparison...');
    const { articleOne, articleTwo, report } = await compareArticles(urlOne, urlTwo);

    const comparison = await prisma.comparison.create({
      data: {
        articleOneUrl: urlOne,
        articleTwoUrl: urlTwo,
        articleOneTitle: articleOne.title || 'Untitled',
        articleTwoTitle: articleTwo.title || 'Untitled',
        articleOneMeta: {
          title: articleOne.title,
          author: articleOne.author,
          publisher: articleOne.publisher,
          date: articleOne.date,
          image: articleOne.image,
          description: articleOne.description,
        },
        articleTwoMeta: {
          title: articleTwo.title,
          author: articleTwo.author,
          publisher: articleTwo.publisher,
          date: articleTwo.date,
          image: articleTwo.image,
          description: articleTwo.description,
        },
        report,
        verdict: report.verdict?.shortVerdict || 'Comparison complete',
        onChain: false,
        upvotes: 0,
        upvotedBy: [],
      },
    });

    console.log(`✅ Comparison saved to DB: ${comparison.id}`);
    res.json({ cached: false, comparison });
  } catch (error) {
    console.error('Generate comparison error:', error.message);
    next(error);
  }
};

/**
 * GET /api/comparisons/:id
 * Returns a single comparison by MongoDB ObjectId.
 */
export const getComparisonById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comparison = await prisma.comparison.findUnique({ where: { id } });

    if (!comparison) {
      return res.status(404).json({ error: 'Comparison not found' });
    }

    res.json(comparison);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/comparisons?page=1&limit=12
 * Returns paginated list of all comparisons (newest first).
 */
export const getAllComparisons = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page ?? '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit ?? '12', 10)));
    const skip = (page - 1) * limit;

    const [comparisons, total] = await Promise.all([
      prisma.comparison.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.comparison.count(),
    ]);

    res.json({
      comparisons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/comparisons/upload-ipfs
 * Pins the comparison data to IPFS and stores the hash in the DB record.
 * Returns { ipfsHash, comparisonId }.
 */
export const uploadComparisonToIPFS = async (req, res, next) => {
  try {
    const { comparisonId } = req.body;

    if (!comparisonId) {
      return res.status(400).json({ error: 'comparisonId is required' });
    }

    const comparison = await prisma.comparison.findUnique({ where: { id: comparisonId } });

    if (!comparison) {
      return res.status(404).json({ error: 'Comparison not found' });
    }

    const ipfsData = {
      articleOneUrl: comparison.articleOneUrl,
      articleTwoUrl: comparison.articleTwoUrl,
      articleOneTitle: comparison.articleOneTitle,
      articleTwoTitle: comparison.articleTwoTitle,
      verdict: comparison.verdict,
      report: comparison.report,
      createdAt: comparison.createdAt,
    };

    const ipfsHash = await uploadToIPFS(ipfsData);

    // Persist the hash (the frontend will use it for the blockchain tx)
    await prisma.comparison.update({
      where: { id: comparisonId },
      data: { ipfsHash },
    });

    console.log(`📤 Comparison ${comparisonId} uploaded to IPFS: ${ipfsHash}`);
    res.json({ ipfsHash, comparisonId });
  } catch (error) {
    console.error('Upload comparison to IPFS error:', error);
    next(error);
  }
};

/**
 * POST /api/comparisons/mark-onchain
 * After the blockchain tx is confirmed, finalise the DB record with
 * blockchainId, curator info, and the IPFS hash.
 */
export const markComparisonOnChain = async (req, res, next) => {
  try {
    const { comparisonId, blockchainId, curator, ipfsHash } = req.body;

    if (!comparisonId || !blockchainId || !curator || !ipfsHash) {
      return res.status(400).json({
        error: 'comparisonId, blockchainId, curator and ipfsHash are all required',
      });
    }

    const curatorName = await getUserDisplayName(curator);

    const updated = await prisma.comparison.update({
      where: { id: comparisonId },
      data: {
        onChain: true,
        blockchainId: parseInt(blockchainId, 10),
        curator,
        curatorName,
        ipfsHash,
      },
    });

    console.log(`⛓ Comparison ${comparisonId} marked on-chain with id ${blockchainId}`);
    res.json(updated);
  } catch (error) {
    console.error('Mark comparison on-chain error:', error);
    next(error);
  }
};

/**
 * POST /api/comparisons/upvote
 * Records a DB-level upvote on a comparison.
 */
export const upvoteComparison = async (req, res, next) => {
  try {
    const { comparisonId, userId } = req.body;

    if (!comparisonId || !userId) {
      return res.status(400).json({ error: 'comparisonId and userId are required' });
    }

    const comparison = await prisma.comparison.findUnique({ where: { id: comparisonId } });

    if (!comparison) {
      return res.status(404).json({ error: 'Comparison not found' });
    }

    const upvotedByArray = Array.isArray(comparison.upvotedBy) ? comparison.upvotedBy : [];

    const hasUpvoted = upvotedByArray.some((v) =>
      typeof v === 'string' ? v === userId : v.address === userId,
    );

    if (hasUpvoted) {
      return res.status(400).json({ error: 'Already upvoted this comparison' });
    }

    const displayName = await getUserDisplayName(userId);

    const updated = await prisma.comparison.update({
      where: { id: comparisonId },
      data: {
        upvotes: { increment: 1 },
        upvotedBy: {
          push: { address: userId, name: displayName, timestamp: new Date().toISOString() },
        },
      },
    });

    res.json({ success: true, upvotes: updated.upvotes });
  } catch (error) {
    console.error('Upvote comparison error:', error);
    next(error);
  }
};

/**
 * DELETE /api/comparisons/:id
 * Removes a comparison. Blocked if the comparison is already on-chain.
 */
export const deleteComparison = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comparison = await prisma.comparison.findUnique({ where: { id } });

    if (!comparison) {
      return res.status(404).json({ error: 'Comparison not found' });
    }

    if (comparison.onChain) {
      return res.status(400).json({ error: 'Cannot delete an on-chain comparison' });
    }

    await prisma.comparison.delete({ where: { id } });

    res.json({ message: 'Comparison deleted successfully' });
  } catch (error) {
    next(error);
  }
};