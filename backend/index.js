import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import articleRoutes from './routes/articleRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import researchRoutes from './routes/researchRoutes.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

// Middleware
app.use(
  cors({
    origin: ['https://wrap-up-one.vercel.app', 'http://localhost:5173'], // Allow frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use('/api/articles', articleRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/research', researchRoutes); // NEW: AI Research Engine

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    features: {
      aiResearch: true,
      linkCuration: true,
      blockchain: true
    }
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Wrap-Up Backend v2.0 running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔬 AI Research Engine: ENABLED`);
  console.log(`📰 Legacy Link Curation: ENABLED`);
});