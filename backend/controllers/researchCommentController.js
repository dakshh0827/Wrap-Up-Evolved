import { PrismaClient } from '@prisma/client';
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
 * Add comment to research (supports nested replies)
 */
export const addResearchComment = async (req, res, next) => {
  try {
    const { researchId, content, author, authorName, parentId } = req.body;
    
    if (!researchId || !content || !author) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate research exists
    const research = await prisma.research.findUnique({
      where: { id: researchId }
    });
    
    if (!research) {
      return res.status(404).json({ error: 'Research not found' });
    }
    
    // Validate parent comment exists if this is a reply
    if (parentId) {
      const parentComment = await prisma.researchComment.findUnique({
        where: { id: parentId }
      });
      
      if (!parentComment) {
        return res.status(404).json({ error: 'Parent comment not found' });
      }
    }
    
    // Use provided authorName or fetch from database
    const finalAuthorName = authorName || await getUserDisplayName(author);
    
    const comment = await prisma.researchComment.create({
      data: { 
        researchId, 
        content, 
        author,
        authorName: finalAuthorName,
        parentId: parentId || null,
        onChain: false,
        upvotedBy: []
      },
      include: {
        replies: true
      }
    });
    
    console.log(`✅ Research comment created with ID: ${comment.id}${parentId ? ` (reply to ${parentId})` : ''}`);
    
    res.status(201).json({ 
      ...comment,
      id: comment.id
    });
  } catch (error) {
    console.error('Add research comment error:', error);
    next(error);
  }
};

/**
 * Upload research comment to IPFS
 */
export const uploadResearchCommentToIPFS = async (req, res, next) => {
  try {
    const { commentId, content, author, authorName, researchId } = req.body;
    
    if (!commentId || !content || !author) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Use provided authorName or fetch from database
    const finalAuthorName = authorName || await getUserDisplayName(author);
    
    const metadata = {
      content,
      author,
      authorName: finalAuthorName,
      researchId,
      timestamp: new Date().toISOString()
    };
    
    const ipfsHash = await uploadToIPFS(metadata);
    
    await prisma.researchComment.update({
      where: { id: commentId },
      data: { ipfsHash }
    });
    
    console.log(`📤 Research comment ${commentId} uploaded to IPFS: ${ipfsHash}`);
    
    res.json({ ipfsHash, commentId });
  } catch (error) {
    console.error('Upload research comment to IPFS error:', error);
    next(error);
  }
};

/**
 * Mark research comment as on-chain
 */
export const markResearchCommentOnChain = async (req, res, next) => {
  try {
    const { commentId, onChainCommentId, ipfsHash } = req.body;
    
    if (!commentId || !onChainCommentId || !ipfsHash) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const updated = await prisma.researchComment.update({
      where: { id: commentId },
      data: { 
        onChain: true,
        commentId: parseInt(onChainCommentId),
        ipfsHash
      }
    });
    
    console.log(`⛓️ Research comment ${commentId} marked as on-chain with ID ${onChainCommentId}`);
    
    res.json(updated);
  } catch (error) {
    console.error('Mark research comment on-chain error:', error);
    next(error);
  }
};

/**
 * Get comments by research ID (with nested replies)
 */
export const getResearchComments = async (req, res, next) => {
  try {
    const { researchId } = req.query;
    
    if (!researchId) {
      return res.status(400).json({ error: 'researchId parameter is required' });
    }
    
    const comments = await prisma.researchComment.findMany({
      where: { 
        researchId,
        parentId: null
      },
      orderBy: { createdAt: 'desc' },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    res.json(comments);
  } catch (error) {
    console.error('Get research comments error:', error);
    next(error);
  }
};

/**
 * Upvote research comment
 */
export const upvoteResearchComment = async (req, res, next) => {
  try {
    const { commentId, userId } = req.body;
    
    if (!commentId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const comment = await prisma.researchComment.findUnique({
      where: { id: commentId }
    });
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Check if already upvoted
    const upvotedByArray = Array.isArray(comment.upvotedBy) ? comment.upvotedBy : [];
    const hasUpvoted = upvotedByArray.some(vote => 
      typeof vote === 'string' ? vote === userId : vote.address === userId
    );
    
    if (hasUpvoted) {
      return res.status(400).json({ error: 'Already upvoted this comment' });
    }
    
    // Get user's display name
    const displayName = await getUserDisplayName(userId);
    
    // Add upvote with user info
    const newUpvote = {
      address: userId,
      name: displayName,
      timestamp: new Date().toISOString()
    };
    
    const updated = await prisma.researchComment.update({
      where: { id: commentId },
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
    console.error('Upvote research comment error:', error.message);
    next(error);
  }
};

/**
 * Sync research comment upvotes from blockchain
 */
export const syncResearchCommentUpvotes = async (req, res, next) => {
  try {
    const { commentId, upvotes } = req.body;
    
    if (!commentId || upvotes === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    console.log(`🔄 Syncing upvotes for research comment ${commentId}: ${upvotes}`);
    
    const updated = await prisma.researchComment.update({
      where: { id: commentId },
      data: { upvotes: parseInt(upvotes) }
    });
    
    console.log(`✅ Research comment ${commentId} upvotes synced: ${upvotes}`);
    
    res.json(updated);
  } catch (error) {
    console.error('Sync research comment upvotes error:', error);
    next(error);
  }
};

/**
 * Get all replies for a research comment
 */
export const getResearchCommentReplies = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    
    const replies = await prisma.researchComment.findMany({
      where: { parentId: commentId },
      orderBy: { createdAt: 'asc' }
    });
    
    res.json(replies);
  } catch (error) {
    console.error('Get research comment replies error:', error);
    next(error);
  }
};