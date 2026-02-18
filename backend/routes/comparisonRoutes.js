import express from 'express';
import * as comparisonController from '../controllers/comparisonController.js';

const router = express.Router();

// Generate comparison (POST with two URLs)
router.post('/generate', comparisonController.generateComparison);

// Get all comparisons
router.get('/', comparisonController.getAllComparisons);

// Get comparison by ID
router.get('/:id', comparisonController.getComparisonById);

// Upload to IPFS
router.post('/upload-ipfs', comparisonController.uploadComparisonToIPFS);

// Mark on-chain
router.post('/mark-onchain', comparisonController.markComparisonOnChain);

// Upvote
router.post('/upvote', comparisonController.upvoteComparison);

// Delete
router.delete('/:id', comparisonController.deleteComparison);

export default router;