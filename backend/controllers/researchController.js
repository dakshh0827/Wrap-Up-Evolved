import { PrismaClient } from '@prisma/client';
import { conductMultiSourceResearch } from '../services/researchEngine.js';
import { synthesizeResearchReport } from '../services/reportSynthesizer.js';
import { uploadToIPFS } from '../services/ipfs.js';

const prisma = new PrismaClient();

/**
 * Helper function to get user display name
 */
const getUserDisplayName = async (walletAddress) => {
  try {
    if (!walletAddress || walletAddress.startsWith('anon_')) {
      return 'Anonymous';
    }
    
    const user = await prisma.user.findUnique({
      where: { walletAddress }
    });
    
    return user?.displayName || `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`;
  } catch (error) {
    console.error('Error fetching user display name:', error);
    return `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`;
  }
};

/**
 * PHASE 1: Initiate multi-source research
 * Searches top 10 sources across platforms and extracts content
 */
export const initiateResearch = async (req, res, next) => {
  try {
    const { topic, userContext } = req.body;
    
    if (!topic || topic.trim().length < 5) {
      return res.status(400).json({ error: 'Topic must be at least 5 characters' });
    }
    
    console.log(`🔬 Starting research for topic: "${topic}"`);
    
    // Check for existing research (cache)
    const existingResearch = await prisma.research.findFirst({
      where: { 
        topic: topic.trim(),
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Within last 24 hours
        }
      }
    });
    
    if (existingResearch) {
      console.log('✅ Found cached research');
      return res.json({
        cached: true,
        researchId: existingResearch.id,
        preview: {
          topic: existingResearch.topic,
          sourcesFound: existingResearch.sources.length,
          status: 'completed'
        }
      });
    }
    
    // Phase 1: Multi-source search and extraction (10-15 seconds)
    console.log('🌐 Searching across platforms...');
    const sources = await conductMultiSourceResearch(topic, userContext);
    
    console.log(`✅ Found ${sources.length} sources`);
    
    res.json({
      cached: false,
      preview: {
        topic,
        sourcesFound: sources.length,
        status: 'sources_collected',
        sources: sources.map(s => ({
          platform: s.platform,
          title: s.title,
          url: s.url
        }))
      }
    });
    
  } catch (error) {
    console.error('Research initiation error:', error.message);
    next(error);
  }
};

/**
 * PHASE 2: Generate comprehensive research report (saves to DB)
 */
export const generateResearchReport = async (req, res, next) => {
  try {
    const { topic, userContext } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    
    console.log(`📊 Generating full research report for: "${topic}"`);
    
    // Step 1: Conduct multi-source research
    const sources = await conductMultiSourceResearch(topic, userContext);
    
    if (sources.length === 0) {
      return res.status(404).json({ 
        error: 'No sources found',
        message: 'Unable to find sufficient sources for this topic. Try a more specific query.'
      });
    }
    
    console.log(`📝 Analyzing ${sources.length} sources...`);
    
    // Step 2: Synthesize comprehensive report
    const report = await synthesizeResearchReport(topic, sources);
    
    // Step 3: Save to database
    const savedResearch = await prisma.research.create({
      data: {
        topic: topic.trim(),
        executiveSummary: report.executiveSummary,
        keyInsights: report.keyInsights,
        sources: report.sources,
        comparativeAnalysis: report.comparativeAnalysis,
        consensusVsContradiction: report.consensusVsContradiction,
        visualizationData: report.visualizationData,
        metadata: {
          totalSources: sources.length,
          platforms: [...new Set(sources.map(s => s.platform))],
          generatedAt: new Date().toISOString()
        },
        onChain: false
      }
    });
    
    console.log(`✅ Research report generated: ${savedResearch.id}`);
    
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
        metadata: savedResearch.metadata,
        onChain: savedResearch.onChain,
        upvotes: savedResearch.upvotes,
        createdAt: savedResearch.createdAt
      }
    });
    
  } catch (error) {
    console.error('Report generation error:', error.message);
    next(error);
  }
};

/**
 * Upload research to IPFS (Step before blockchain)
 */
export const uploadResearchToIPFS = async (req, res, next) => {
  try {
    const { researchId } = req.body;
    
    if (!researchId) {
      return res.status(400).json({ error: 'Research ID is required' });
    }
    
    const research = await prisma.research.findUnique({
      where: { id: researchId }
    });
    
    if (!research) {
      return res.status(404).json({ error: 'Research not found' });
    }
    
    console.log(`📤 Uploading research to IPFS: ${research.topic}`);
    
    const ipfsData = {
      topic: research.topic,
      executiveSummary: research.executiveSummary,
      keyInsights: research.keyInsights,
      sources: research.sources,
      comparativeAnalysis: research.comparativeAnalysis,
      consensusVsContradiction: research.consensusVsContradiction,
      visualizationData: research.visualizationData,
      metadata: research.metadata,
      generatedAt: research.createdAt.toISOString()
    };
    
    const ipfsHash = await uploadToIPFS(ipfsData);
    
    console.log(`✅ IPFS Upload successful: ${ipfsHash}`);
    
    res.json({ ipfsHash, researchId });
    
  } catch (error) {
    console.error('IPFS upload error:', error.message);
    next(error);
  }
};

/**
 * Mark research as on-chain after blockchain confirmation
 */
export const markResearchOnChain = async (req, res, next) => {
  try {
    const { researchId, blockchainId, curator, ipfsHash } = req.body;
    
    if (!researchId || !blockchainId || !curator || !ipfsHash) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get curator's display name
    const curatorName = await getUserDisplayName(curator);
    
    const updated = await prisma.research.update({
      where: { id: researchId },
      data: {
        onChain: true,
        blockchainId: parseInt(blockchainId),
        curator,
        curatorName,
        ipfsHash
      }
    });
    
    console.log(`⛓️ Research marked as on-chain: ${researchId}`);
    
    res.json(updated);
  } catch (error) {
    console.error('Mark on-chain error:', error.message);
    next(error);
  }
};

/**
 * Get research report by ID (with comments)
 */
export const getResearchById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    console.log('📖 Fetching research with ID:', id);
    
    const research = await prisma.research.findUnique({
      where: { id },
      include: {
        comments: {
          where: { parentId: null }, // Only top-level comments
          orderBy: { createdAt: 'desc' },
          include: {
            replies: {
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      }
    });
    
    if (!research) {
      return res.status(404).json({ error: 'Research report not found' });
    }
    
    console.log(`✅ Found research with ${research.comments?.length || 0} comments`);
    
    res.json(research);
  } catch (error) {
    console.error('Get research error:', error);
    next(error);
  }
};

/**
 * Get all research reports (paginated, on-chain only by default)
 */
export const getAllResearch = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, includeOffChain = false } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const whereClause = includeOffChain === 'true' ? {} : { onChain: true };
    
    const [research, total] = await Promise.all([
      prisma.research.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
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
          createdAt: true
        },
        include: {
          _count: {
            select: { comments: true }
          }
        }
      }),
      prisma.research.count({ where: whereClause })
    ]);
    
    res.json({
      research: research.map(r => ({
        ...r,
        commentCount: r._count.comments
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all research error:', error);
    next(error);
  }
};

/**
 * Upvote research report
 */
export const upvoteResearch = async (req, res, next) => {
  try {
    const { researchId, userId } = req.body;
    
    if (!researchId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const research = await prisma.research.findUnique({
      where: { id: researchId }
    });
    
    if (!research) {
      return res.status(404).json({ error: 'Research not found' });
    }
    
    // Check if already upvoted
    const upvotedByArray = Array.isArray(research.upvotedBy) ? research.upvotedBy : [];
    const hasUpvoted = upvotedByArray.some(vote => 
      typeof vote === 'string' ? vote === userId : vote.address === userId
    );
    
    if (hasUpvoted) {
      return res.status(400).json({ error: 'Already upvoted this research' });
    }
    
    // Get user's display name
    const displayName = await getUserDisplayName(userId);
    
    // Add upvote with user info
    const newUpvote = {
      address: userId,
      name: displayName,
      timestamp: new Date().toISOString()
    };
    
    const updated = await prisma.research.update({
      where: { id: researchId },
      data: {
        upvotes: { increment: 1 },
        upvotedBy: { push: newUpvote }
      }
    });
    
    res.json({ 
      success: true, 
      upvotes: updated.upvotes,
      message: 'Upvote recorded'
    });
  } catch (error) {
    console.error('Upvote research error:', error.message);
    next(error);
  }
};

/**
 * Sync upvotes from blockchain
 */
export const syncResearchUpvotes = async (req, res, next) => {
  try {
    const { researchId, upvotes } = req.body;
    
    if (!researchId || upvotes === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    console.log(`🔄 Syncing upvotes for research ${researchId}: ${upvotes}`);
    
    const updated = await prisma.research.update({
      where: { id: researchId },
      data: { upvotes: parseInt(upvotes) }
    });
    
    console.log(`✅ Research upvotes synced: ${upvotes}`);
    
    res.json(updated);
  } catch (error) {
    console.error('Sync upvotes error:', error);
    next(error);
  }
};

/**
 * Delete research (only if not on-chain)
 */
export const deleteResearch = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const research = await prisma.research.findUnique({
      where: { id }
    });
    
    if (!research) {
      return res.status(404).json({ error: 'Research not found' });
    }
    
    if (research.onChain) {
      return res.status(400).json({ error: 'Cannot delete on-chain research' });
    }
    
    await prisma.research.delete({
      where: { id }
    });
    
    res.json({ message: 'Research deleted successfully' });
  } catch (error) {
    console.error('Delete research error:', error);
    next(error);
  }
};