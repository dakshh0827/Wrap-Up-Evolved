import { PrismaClient } from '@prisma/client';
import { compareArticles } from '../services/comparatorService.js';
import { uploadToIPFS } from '../services/ipfs.js';

const prisma = new PrismaClient();

const getUserDisplayName = async (walletAddress) => {
  try {
    if (!walletAddress || walletAddress.startsWith('anon_')) return 'Anonymous';
    const user = await prisma.user.findUnique({ where: { walletAddress } });
    return user?.displayName || `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`;
  } catch {
    return 'Anonymous';
  }
};

/**
 * Generate a comparison report for two article URLs
 */
export const generateComparison = async (req, res, next) => {
  try {
    const { urlOne, urlTwo } = req.body;

    if (!urlOne || !urlTwo) {
      return res.status(400).json({ error: 'Both article URLs are required' });
    }

    // Validate URLs
    try {
      new URL(urlOne);
      new URL(urlTwo);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    if (urlOne === urlTwo) {
      return res.status(400).json({ error: 'Please provide two different URLs' });
    }

    // Check for existing comparison (cache by URL pair, order-independent)
    const [sortedOne, sortedTwo] = [urlOne, urlTwo].sort();
    const existing = await prisma.comparison.findFirst({
      where: {
        OR: [
          { articleOneUrl: sortedOne, articleTwoUrl: sortedTwo },
          { articleOneUrl: sortedTwo, articleTwoUrl: sortedOne },
        ],
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // 7-day cache
      },
    });

    if (existing) {
      console.log('✅ Returning cached comparison');
      return res.json({ cached: true, comparison: existing });
    }

    console.log('🔬 Running new comparison...');
    const { articleOne, articleTwo, report } = await compareArticles(urlOne, urlTwo);

    // Save to DB
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

    console.log(`✅ Comparison saved: ${comparison.id}`);
    res.json({ cached: false, comparison });
  } catch (error) {
    console.error('Generate comparison error:', error.message);
    next(error);
  }
};

/**
 * Get comparison by ID
 */
export const getComparisonById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comparison = await prisma.comparison.findUnique({ where: { id } });
    if (!comparison) return res.status(404).json({ error: 'Comparison not found' });
    res.json(comparison);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all comparisons (paginated)
 */
export const getAllComparisons = async (req, res, next) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [comparisons, total] = await Promise.all([
      prisma.comparison.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.comparison.count(),
    ]);

    res.json({
      comparisons,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload comparison to IPFS
 */
export const uploadComparisonToIPFS = async (req, res, next) => {
  try {
    const { comparisonId } = req.body;
    if (!comparisonId) return res.status(400).json({ error: 'Comparison ID required' });

    const comparison = await prisma.comparison.findUnique({ where: { id: comparisonId } });
    if (!comparison) return res.status(404).json({ error: 'Comparison not found' });

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

    await prisma.comparison.update({
      where: { id: comparisonId },
      data: { ipfsHash },
    });

    console.log(`📤 Comparison ${comparisonId} uploaded to IPFS: ${ipfsHash}`);
    res.json({ ipfsHash, comparisonId });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark comparison as on-chain
 */
export const markComparisonOnChain = async (req, res, next) => {
  try {
    const { comparisonId, blockchainId, curator, ipfsHash } = req.body;

    if (!comparisonId || !blockchainId || !curator || !ipfsHash) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const curatorName = await getUserDisplayName(curator);

    const updated = await prisma.comparison.update({
      where: { id: comparisonId },
      data: { onChain: true, blockchainId: parseInt(blockchainId), curator, curatorName, ipfsHash },
    });

    console.log(`⛓ Comparison marked on-chain: ${comparisonId}`);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Upvote comparison
 */
export const upvoteComparison = async (req, res, next) => {
  try {
    const { comparisonId, userId } = req.body;
    if (!comparisonId || !userId) return res.status(400).json({ error: 'Missing required fields' });

    const comparison = await prisma.comparison.findUnique({ where: { id: comparisonId } });
    if (!comparison) return res.status(404).json({ error: 'Comparison not found' });

    const upvotedByArray = Array.isArray(comparison.upvotedBy) ? comparison.upvotedBy : [];
    const hasUpvoted = upvotedByArray.some((v) =>
      typeof v === 'string' ? v === userId : v.address === userId,
    );
    if (hasUpvoted) return res.status(400).json({ error: 'Already upvoted' });

    const displayName = await getUserDisplayName(userId);
    const updated = await prisma.comparison.update({
      where: { id: comparisonId },
      data: {
        upvotes: { increment: 1 },
        upvotedBy: { push: { address: userId, name: displayName, timestamp: new Date().toISOString() } },
      },
    });

    res.json({ success: true, upvotes: updated.upvotes });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete comparison
 */
export const deleteComparison = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comparison = await prisma.comparison.findUnique({ where: { id } });
    if (!comparison) return res.status(404).json({ error: 'Not found' });
    if (comparison.onChain) return res.status(400).json({ error: 'Cannot delete on-chain comparison' });
    await prisma.comparison.delete({ where: { id } });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
};