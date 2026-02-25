import { PrismaClient } from '@prisma/client';
import { conductMultiSourceResearch } from '../services/researchEngine.js';
import { synthesizeResearchReport } from '../services/reportSynthesizer.js';
import { uploadToIPFS } from '../services/ipfs.js';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helper: resolve wallet address → display name
// ---------------------------------------------------------------------------
const getUserDisplayName = async (walletAddress) => {
  try {
    if (!walletAddress || walletAddress.startsWith('anon_')) return 'Anonymous';
    const user = await prisma.user.findUnique({ where: { walletAddress } });
    return user?.displayName
      || `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`;
  } catch {
    return `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`;
  }
};

// ---------------------------------------------------------------------------
// POST /api/research/initiate
// PHASE 1: Run multi-source search and return a preview without persisting.
// If a recent report already exists for the topic, return it from cache.
// ---------------------------------------------------------------------------
export const initiateResearch = async (req, res, next) => {
  try {
    const { topic, userContext } = req.body;

    if (!topic || topic.trim().length < 5) {
      return res.status(400).json({ error: 'Topic must be at least 5 characters' });
    }

    console.log(`🔬 Initiating research: "${topic}"`);

    // 24-hour cache check.
    const cached = await prisma.research.findFirst({
      where: {
        topic: topic.trim(),
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    if (cached) {
      console.log('✅ Returning cached research');
      return res.json({
        cached: true,
        researchId: cached.id,
        preview: {
          topic: cached.topic,
          sourcesFound: cached.sources.length,
          status: 'completed',
        },
      });
    }

    console.log('🌐 Searching across platforms...');
    const sources = await conductMultiSourceResearch(topic, userContext);
    console.log(`✅ ${sources.length} sources found`);

    res.json({
      cached: false,
      preview: {
        topic,
        sourcesFound: sources.length,
        status: 'sources_collected',
        sources: sources.map((s) => ({
          platform: s.platform,
          title: s.title,
          url: s.url,
        })),
      },
    });
  } catch (error) {
    console.error('initiateResearch error:', error.message);
    next(error);
  }
};

// ---------------------------------------------------------------------------
// POST /api/research/generate
// PHASE 2: Full pipeline — search → analyze → synthesize → persist to DB.
// Returns the complete report + researchId for subsequent IPFS/chain steps.
// ---------------------------------------------------------------------------
export const generateResearchReport = async (req, res, next) => {
  try {
    const { topic, userContext } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'topic is required' });
    }

    console.log(`📊 Generating full report for: "${topic}"`);

    const sources = await conductMultiSourceResearch(topic, userContext);

    if (sources.length === 0) {
      return res.status(404).json({
        error: 'No sources found',
        message: 'Unable to find sufficient sources. Try a more specific query.',
      });
    }

    console.log(`📝 Synthesizing from ${sources.length} sources...`);
    const report = await synthesizeResearchReport(topic, sources);

    const savedResearch = await prisma.research.create({
      data: {
        topic: topic.trim(),
        executiveSummary: report.executiveSummary,
        keyInsights: report.keyInsights,
        sources: report.sources,
        comparativeAnalysis: report.comparativeAnalysis,
        consensusVsContradiction: report.consensusVsContradiction,
        visualizationData: report.visualizationData,
        sourceComparisonReport: report.sourceComparisonReport || null,
        metadata: {
          totalSources: sources.length,
          platforms: [...new Set(sources.map((s) => s.platform))],
          generatedAt: new Date().toISOString(),
        },
        onChain: false,
        upvotedBy: [],
      },
    });

    console.log(`✅ Research saved: ${savedResearch.id}`);

    res.json({
      researchId: savedResearch.id,
      report: {
        id: savedResearch.id,
        topic: savedResearch.topic,
        executiveSummary: savedResearch.executiveSummary,
        keyInsights: savedResearch.keyInsights,
        sources: savedResearch.sources,
        comparativeAnalysis: savedResearch.comparativeAnalysis,
        consensusVsContradiction: savedResearch.consensusVsContradiction,
        visualizationData: savedResearch.visualizationData,
        sourceComparisonReport: savedResearch.sourceComparisonReport,
        metadata: savedResearch.metadata,
        onChain: savedResearch.onChain,
        upvotes: savedResearch.upvotes,
        createdAt: savedResearch.createdAt,
      },
    });
  } catch (error) {
    console.error('generateResearchReport error:', error.message);
    next(error);
  }
};

// ---------------------------------------------------------------------------
// POST /api/research/upload-ipfs
// Pin the research report to IPFS. Returns the hash for the blockchain call.
// ---------------------------------------------------------------------------
export const uploadResearchToIPFS = async (req, res, next) => {
  try {
    const { researchId } = req.body;

    if (!researchId) {
      return res.status(400).json({ error: 'researchId is required' });
    }

    const research = await prisma.research.findUnique({ where: { id: researchId } });
    if (!research) return res.status(404).json({ error: 'Research not found' });

    console.log(`📤 Uploading research "${research.topic}" to IPFS...`);

    const ipfsData = {
      topic: research.topic,
      executiveSummary: research.executiveSummary,
      keyInsights: research.keyInsights,
      sources: research.sources,
      comparativeAnalysis: research.comparativeAnalysis,
      consensusVsContradiction: research.consensusVsContradiction,
      visualizationData: research.visualizationData,
      metadata: research.metadata,
      generatedAt: research.createdAt.toISOString(),
    };

    const ipfsHash = await uploadToIPFS(ipfsData);
    console.log(`✅ Research IPFS hash: ${ipfsHash}`);

    // Store the hash so the mark-onchain step has it.
    await prisma.research.update({
      where: { id: researchId },
      data: { ipfsHash },
    });

    res.json({ ipfsHash, researchId });
  } catch (error) {
    console.error('uploadResearchToIPFS error:', error.message);
    next(error);
  }
};

// ---------------------------------------------------------------------------
// POST /api/research/mark-onchain
// Called AFTER the blockchain tx confirms. Updates DB to onChain: true.
// ---------------------------------------------------------------------------
export const markResearchOnChain = async (req, res, next) => {
  try {
    const { researchId, blockchainId, curator, ipfsHash } = req.body;

    if (!researchId || !blockchainId || !curator || !ipfsHash) {
      return res.status(400).json({
        error: 'researchId, blockchainId, curator and ipfsHash are all required',
      });
    }

    const curatorName = await getUserDisplayName(curator);

    const updated = await prisma.research.update({
      where: { id: researchId },
      data: {
        onChain: true,
        blockchainId: parseInt(blockchainId, 10),
        curator,
        curatorName,
        ipfsHash,
      },
    });

    console.log(`⛓  Research ${researchId} on-chain as #${blockchainId}`);
    res.json(updated);
  } catch (error) {
    console.error('markResearchOnChain error:', error.message);
    next(error);
  }
};

// ---------------------------------------------------------------------------
// GET /api/research/:id
// Single research report with nested comments.
// ---------------------------------------------------------------------------
export const getResearchById = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('📖 Fetching research:', id);

    const research = await prisma.research.findUnique({
      where: { id },
      include: {
        comments: {
          where: { parentId: null },
          orderBy: { createdAt: 'desc' },
          include: {
            replies: { orderBy: { createdAt: 'asc' } },
          },
        },
      },
    });

    if (!research) {
      return res.status(404).json({ error: 'Research report not found' });
    }

    console.log(`✅ Research found, ${research.comments?.length ?? 0} top-level comments`);
    res.json(research);
  } catch (error) {
    console.error('getResearchById error:', error);
    next(error);
  }
};

// ---------------------------------------------------------------------------
// GET /api/research
// Paginated list. On-chain only by default; pass ?includeOffChain=true for all.
// ---------------------------------------------------------------------------
export const getAllResearch = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, includeOffChain = 'false' } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const whereClause = includeOffChain === 'true' ? {} : { onChain: true };

    const [research, total] = await Promise.all([
      prisma.research.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit, 10),
        select: {
          id: true,
          blockchainId: true,
          topic: true,
          executiveSummary: true,
          metadata: true,
          curator: true,
          curatorName: true,
          onChain: true,
          upvotes: true,
          createdAt: true,
          _count: { select: { comments: true } },
        },
      }),
      prisma.research.count({ where: whereClause }),
    ]);

    res.json({
      research: research.map((r) => ({ ...r, commentCount: r._count.comments })),
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        totalPages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    console.error('getAllResearch error:', error);
    next(error);
  }
};

// ---------------------------------------------------------------------------
// POST /api/research/upvote
// DB-level upvote (wallet-optional).
// ---------------------------------------------------------------------------
export const upvoteResearch = async (req, res, next) => {
  try {
    const { researchId, userId } = req.body;

    if (!researchId || !userId) {
      return res.status(400).json({ error: 'researchId and userId are required' });
    }

    const research = await prisma.research.findUnique({ where: { id: researchId } });
    if (!research) return res.status(404).json({ error: 'Research not found' });

    const upvotedByArray = Array.isArray(research.upvotedBy) ? research.upvotedBy : [];
    const hasUpvoted = upvotedByArray.some((v) =>
      typeof v === 'string' ? v === userId : v.address === userId
    );
    if (hasUpvoted) return res.status(400).json({ error: 'Already upvoted this research' });

    const displayName = await getUserDisplayName(userId);
    const updated = await prisma.research.update({
      where: { id: researchId },
      data: {
        upvotes: { increment: 1 },
        upvotedBy: {
          push: { address: userId, name: displayName, timestamp: new Date().toISOString() },
        },
      },
    });

    res.json({ success: true, upvotes: updated.upvotes });
  } catch (error) {
    console.error('upvoteResearch error:', error.message);
    next(error);
  }
};

// ---------------------------------------------------------------------------
// POST /api/research/sync-upvotes
// Overwrite DB upvote count with authoritative on-chain value.
// ---------------------------------------------------------------------------
export const syncResearchUpvotes = async (req, res, next) => {
  try {
    const { researchId, upvotes } = req.body;

    if (!researchId || upvotes === undefined) {
      return res.status(400).json({ error: 'researchId and upvotes are required' });
    }

    const updated = await prisma.research.update({
      where: { id: researchId },
      data: { upvotes: parseInt(upvotes, 10) },
    });

    console.log(`🔄 Research ${researchId} upvotes synced → ${upvotes}`);
    res.json(updated);
  } catch (error) {
    console.error('syncResearchUpvotes error:', error);
    next(error);
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/research/:id
// Remove a DB record. Blocked if the report is already on-chain.
// ---------------------------------------------------------------------------
export const deleteResearch = async (req, res, next) => {
  try {
    const { id } = req.params;

    const research = await prisma.research.findUnique({ where: { id } });
    if (!research) return res.status(404).json({ error: 'Research not found' });
    if (research.onChain) {
      return res.status(400).json({ error: 'Cannot delete an on-chain research report' });
    }

    await prisma.research.delete({ where: { id } });
    res.json({ message: 'Research deleted successfully' });
  } catch (error) {
    console.error('deleteResearch error:', error);
    next(error);
  }
};