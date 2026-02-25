import express from 'express';
import * as commentController from '../controllers/commentController.js';

const router = express.Router();

// ============================================================
// CRITICAL: Fixed-path routes MUST come before /:commentId
// ============================================================

// --- POST routes ---
router.post('/', commentController.addComment);
router.post('/upload-ipfs', commentController.uploadCommentToIPFS);
router.post('/mark-onchain', commentController.markCommentOnChain);
router.post('/upvote', commentController.upvoteComment);
router.post('/sync-upvotes', commentController.syncCommentUpvotes);

// --- Fixed-path GET routes BEFORE /:commentId ---
router.get('/by-article', commentController.getCommentsByArticleUrl);  // ?articleUrl=...

// --- Parameterized routes LAST ---
router.get('/:commentId/replies', commentController.getCommentReplies);

export default router;