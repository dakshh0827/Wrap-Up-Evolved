import express from 'express';
import * as researchController from '../controllers/researchController.js';
import * as researchCommentController from '../controllers/researchCommentController.js';

const router = express.Router();

// ===== RESEARCH ENDPOINTS =====

// Initiate multi-source research (Phase 1)
router.post('/initiate', researchController.initiateResearch);

// Generate full research report (Phase 2)
router.post('/generate', researchController.generateResearchReport);

// Upload research to IPFS
router.post('/upload-ipfs', researchController.uploadResearchToIPFS);

// Mark research as on-chain
router.post('/mark-onchain', researchController.markResearchOnChain);

// Get research by ID (with comments)
router.get('/:id', researchController.getResearchById);

// Get all research (paginated)
router.get('/', researchController.getAllResearch);

// Upvote research
router.post('/upvote', researchController.upvoteResearch);

// Sync upvotes from blockchain
router.post('/sync-upvotes', researchController.syncResearchUpvotes);

// Delete research
router.delete('/:id', researchController.deleteResearch);

// ===== RESEARCH COMMENT ENDPOINTS =====

// Add comment (supports replies)
router.post('/comments', researchCommentController.addResearchComment);

// Upload comment to IPFS
router.post('/comments/upload-ipfs', researchCommentController.uploadResearchCommentToIPFS);

// Mark comment as on-chain
router.post('/comments/mark-onchain', researchCommentController.markResearchCommentOnChain);

// Get comments by research ID
router.get('/comments/by-research', researchCommentController.getResearchComments);

// Get replies for a comment
router.get('/comments/:commentId/replies', researchCommentController.getResearchCommentReplies);

// Upvote comment
router.post('/comments/upvote', researchCommentController.upvoteResearchComment);

// Sync comment upvotes from blockchain
router.post('/comments/sync-upvotes', researchCommentController.syncResearchCommentUpvotes);

export default router;