/**
 * Database Seeding Script for Wrap-Up
 * Run: node seed.js
 * Make sure DATABASE_URL is in your .env
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── SAMPLE DATA ──────────────────────────────────────────────────────────────

const USERS = [
  { walletAddress: '0x1234567890123456789012345678901234567890', displayName: 'CryptoResearcher' },
  { walletAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', displayName: 'Web3Analyst' },
  { walletAddress: '0x9876543210987654321098765432109876543210', displayName: 'DeFiExplorer' },
  { walletAddress: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef', displayName: 'BlockchainDev' },
];

const ARTICLES = [
  {
    articleId: 1,
    title: 'Ethereum Layer 2 Solutions Are Transforming DeFi Scalability',
    summary: 'A deep dive into how Optimistic Rollups and ZK-Rollups are solving Ethereum\'s throughput limitations and enabling a new era of decentralized finance.',
    detailedSummary: 'Layer 2 solutions have emerged as the dominant scaling paradigm for Ethereum, with total value locked across Optimism, Arbitrum, and zkSync surpassing $10 billion. This analysis examines the technical trade-offs between optimistic and zero-knowledge approaches, their impact on gas fees, and what this means for DeFi protocol developers.',
    fullContent: 'The Ethereum scaling trilemma has long been a central challenge for blockchain developers. Security, decentralization, and scalability cannot all be maximized simultaneously within a single layer. Layer 2 solutions sidestep this constraint by moving computation off-chain while inheriting Ethereum\'s security guarantees...',
    keyPoints: [
      'Arbitrum leads with over $5B TVL on its Optimistic Rollup',
      'zkSync Era processes 2,000+ TPS vs Ethereum\'s 15 TPS',
      'Gas fees reduced by 10-100x compared to Ethereum mainnet',
      'Over 500 dApps have deployed natively on L2 networks',
      'Cross-L2 interoperability remains the next major challenge',
    ],
    statistics: [
      { label: 'Total L2 TVL', value: '$10.2B', context: 'Combined across top L2 networks' },
      { label: 'Gas Reduction', value: '~95%', context: 'Average savings vs L1' },
      { label: 'Active L2 dApps', value: '500+', context: 'Deployed natively on L2' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
    articleUrl: 'https://example.com/eth-l2-defi-scaling',
    ipfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    curator: '0x1234567890123456789012345678901234567890',
    curatorName: 'CryptoResearcher',
    upvotes: 42,
    upvotedBy: [
      { address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', name: 'Web3Analyst', timestamp: new Date('2025-01-15').toISOString() },
      { address: '0x9876543210987654321098765432109876543210', name: 'DeFiExplorer', timestamp: new Date('2025-01-16').toISOString() },
    ],
    onChain: true,
  },
  {
    articleId: 2,
    title: 'The Rise of Real-World Assets in DeFi: A $16 Trillion Opportunity',
    summary: 'Tokenizing real-world assets like US Treasuries, real estate, and trade finance is bringing traditional finance onto blockchain rails at unprecedented speed.',
    detailedSummary: 'RWA tokenization has moved from theoretical to practical at scale. BlackRock\'s BUIDL fund, Ondo Finance\'s US Treasury products, and Centrifuge\'s trade receivables market have collectively demonstrated that institutional capital is ready to engage with blockchain-based financial infrastructure.',
    fullContent: 'Real-world asset tokenization represents perhaps the most significant bridge between traditional finance and decentralized systems...',
    keyPoints: [
      'BlackRock BUIDL fund crossed $500M in AUM within 6 weeks of launch',
      'Ondo Finance\'s OUSG offers 5%+ yield on tokenized US Treasuries',
      'RWA protocols saw 700% growth in TVL throughout 2024',
      'MakerDAO earns 70% of revenue from RWA allocations',
      'Regulatory clarity in key jurisdictions is accelerating institutional adoption',
    ],
    statistics: [
      { label: 'Addressable Market', value: '$16T', context: 'Estimated global RWA tokenization opportunity' },
      { label: 'Current RWA TVL', value: '$8.4B', context: 'On-chain tokenized real-world assets' },
      { label: 'YoY Growth', value: '700%', context: 'RWA protocol TVL growth in 2024' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    articleUrl: 'https://example.com/rwa-defi-opportunity',
    ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    curator: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    curatorName: 'Web3Analyst',
    upvotes: 38,
    upvotedBy: [
      { address: '0x1234567890123456789012345678901234567890', name: 'CryptoResearcher', timestamp: new Date('2025-01-20').toISOString() },
    ],
    onChain: true,
  },
  {
    articleId: 3,
    title: 'Zero-Knowledge Proofs: The Cryptography Powering Web3 Privacy',
    summary: 'ZK proofs have evolved from academic curiosities to production infrastructure, enabling verifiable computation without revealing underlying data.',
    detailedSummary: 'Zero-knowledge proofs allow one party to prove knowledge of information to another without revealing the information itself. This cryptographic primitive is now at the heart of scaling solutions, identity systems, and private DeFi applications across the blockchain ecosystem.',
    fullContent: 'The mathematical foundations of zero-knowledge proofs were laid in 1985 by Goldwasser, Micali, and Rackoff. Four decades later, the practical application of ZKPs is reshaping how we think about trust, privacy, and scalability in distributed systems...',
    keyPoints: [
      'SNARKs and STARKs are the two dominant ZK proof systems in production',
      'Proof generation times have dropped from hours to milliseconds',
      'zkEVM implementations now support full EVM compatibility',
      'ZK identity systems enable privacy-preserving KYC compliance',
      'Hardware acceleration is the next frontier for ZK scaling',
    ],
    statistics: [
      { label: 'Proof Generation Speed', value: '< 1s', context: 'Modern SNARK generation on consumer hardware' },
      { label: 'ZK Protocol Count', value: '50+', context: 'Active ZK-based protocols in production' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
    articleUrl: 'https://example.com/zk-proofs-web3-privacy',
    ipfsHash: 'QmZTR5bcpQD7cFgTorqxZDYaew1Wqv2jAS648ptvsrcnwj',
    curator: '0x9876543210987654321098765432109876543210',
    curatorName: 'DeFiExplorer',
    upvotes: 55,
    upvotedBy: [
      { address: '0x1234567890123456789012345678901234567890', name: 'CryptoResearcher', timestamp: new Date('2025-02-01').toISOString() },
      { address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', name: 'Web3Analyst', timestamp: new Date('2025-02-02').toISOString() },
      { address: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef', name: 'BlockchainDev', timestamp: new Date('2025-02-03').toISOString() },
    ],
    onChain: true,
  },
  {
    title: 'Solana vs Ethereum: The Great L1 Debate in 2025',
    summary: 'A technical and ecosystem comparison of the two largest smart contract platforms as they compete for developer mindshare and user adoption.',
    detailedSummary: 'Solana\'s monolithic architecture delivers raw throughput while Ethereum\'s modular roadmap bets on L2 specialization. This piece examines where each platform wins and what the competition means for the broader Web3 ecosystem.',
    fullContent: 'The L1 wars of 2021-2022 have given way to a more nuanced landscape where multiple chains coexist and serve different use cases...',
    keyPoints: [
      'Solana processes 65,000 TPS vs Ethereum + L2s combined ~10,000 TPS',
      'Ethereum has 10x more developers than any competing L1',
      'Solana\'s NFT market volume surpassed Ethereum\'s in Q4 2024',
      'Both chains are investing heavily in mobile and consumer applications',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=800',
    articleUrl: 'https://example.com/solana-vs-ethereum-2025',
    curator: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    curatorName: 'BlockchainDev',
    upvotes: 29,
    upvotedBy: [],
    onChain: false, // Pending article
  },
];

const RESEARCH_REPORTS = [
  {
    topic: 'Impact of AI on Software Development Productivity',
    executiveSummary: 'Artificial intelligence coding assistants have demonstrably accelerated software development across organizations of all sizes. Analysis of 10+ authoritative sources reveals a consensus that AI tools reduce boilerplate coding time by 30-55%, though complex architectural decisions still require experienced human judgment. The technology is creating a bifurcation in the developer market: those who effectively leverage AI tools are seeing significant productivity gains, while those who resist adoption face increasing competitive pressure.',
    keyInsights: [
      'GitHub Copilot users complete tasks 55% faster on average, per internal GitHub research',
      'AI coding assistants are most effective for test generation, documentation, and repetitive patterns',
      'Senior developers benefit more from AI tools than juniors due to better prompt engineering skills',
      'Code quality metrics show mixed results — AI reduces syntax errors but can introduce logical bugs',
      'Organizations report 40% reduction in time-to-deployment for standard CRUD applications',
      'AI pair programming is reshaping CS education as universities adapt their curricula',
    ],
    sources: [
      {
        platform: 'academic',
        title: 'The Impact of AI on Developer Productivity: A Controlled Study',
        url: 'https://arxiv.org/abs/2302.06590',
        snippet: 'Randomized controlled trial showing 55% productivity improvement with AI assistance',
        analysis: {
          mainArgument: 'AI significantly accelerates software development with statistically significant productivity gains',
          keyClaims: ['55% faster task completion', 'Highest gains in boilerplate code', 'No significant impact on code quality'],
          sentiment: 'positive',
          credibilityIndicators: { hasEvidence: true, hasCitations: true, authorityLevel: 'high' },
          uniqueContribution: 'First randomized controlled trial methodology applied to AI coding tools',
        },
      },
      {
        platform: 'web',
        title: 'GitHub Copilot Impact Report 2024',
        url: 'https://github.blog/2024-01-17-copilot-impact-report/',
        snippet: 'Internal GitHub data showing enterprise adoption patterns and productivity metrics',
        analysis: {
          mainArgument: 'Enterprise adoption of Copilot delivers measurable ROI across company sizes',
          keyClaims: ['46% of code now AI-generated in Copilot-enabled repos', '$1,500 annual savings per developer', 'Significant improvements in developer satisfaction'],
          sentiment: 'positive',
          credibilityIndicators: { hasEvidence: true, hasCitations: false, authorityLevel: 'high' },
          uniqueContribution: 'Largest dataset on real-world AI coding tool adoption',
        },
      },
      {
        platform: 'reddit',
        title: 'r/programming: My 6-month experience with AI coding assistants',
        url: 'https://reddit.com/r/programming/ai-coding-experience',
        snippet: 'Community discussion of practical experiences with AI coding tools',
        analysis: {
          mainArgument: 'Developers have nuanced, mixed experiences depending on use case and skill level',
          keyClaims: ['AI excels at boilerplate but struggles with complex logic', 'Prompt engineering is a new essential skill', 'Over-reliance can atrophy problem-solving skills'],
          sentiment: 'balanced',
          credibilityIndicators: { hasEvidence: false, hasCitations: false, authorityLevel: 'medium' },
          uniqueContribution: 'Practitioner perspectives often missing from academic studies',
        },
      },
    ],
    comparativeAnalysis: {
      comparisonTable: [
        { source: 'GitHub Impact Report', platform: 'web', mainArgument: 'Measurable enterprise ROI', sentiment: 'positive', credibility: 'high' },
        { source: 'ArXiv Study', platform: 'academic', mainArgument: 'Controlled productivity gains', sentiment: 'positive', credibility: 'high' },
        { source: 'Reddit Community', platform: 'reddit', mainArgument: 'Mixed practitioner experiences', sentiment: 'balanced', credibility: 'medium' },
      ],
      insights: {
        patterns: ['All sources confirm productivity improvement for routine tasks', 'Skill-level effects consistently observed across sources'],
        majorAgreements: ['AI reduces boilerplate coding time significantly', 'Senior developers see larger gains'],
        keyDebates: ['Long-term impact on developer skill development', 'Effect on code quality at scale'],
      },
    },
    consensusVsContradiction: {
      widelyAgreedPoints: [
        'AI coding tools measurably accelerate development of routine code',
        'The technology is most effective for test generation and documentation',
        'Adoption is accelerating across enterprise and startup environments',
      ],
      debatedViews: [
        {
          topic: 'Impact on developer skill development',
          positions: ['AI creates dependency and atrophies skills', 'AI frees developers to focus on higher-order thinking'],
          sourcesCount: { A: 3, B: 4 },
        },
      ],
      minorityPerspectives: ['AI coding tools may increase security vulnerabilities through insecure code suggestions'],
      evidenceGaps: ['Long-term studies (3+ years) on developer skill trajectories', 'Impact on software architecture quality'],
    },
    visualizationData: {
      sentimentDistribution: [
        { sentiment: 'Positive', count: 6, percentage: 60 },
        { sentiment: 'Balanced', count: 3, percentage: 30 },
        { sentiment: 'Negative', count: 1, percentage: 10 },
      ],
      platformDistribution: [
        { platform: 'Web', count: 3, percentage: 30 },
        { platform: 'Academic', count: 2, percentage: 20 },
        { platform: 'Reddit', count: 2, percentage: 20 },
        { platform: 'Hackernews', count: 2, percentage: 20 },
        { platform: 'News', count: 1, percentage: 10 },
      ],
      credibilityDistribution: [
        { level: 'High', count: 5 },
        { level: 'Medium', count: 4 },
        { level: 'Low', count: 1 },
      ],
      thematicClusters: [
        { theme: 'Technical', count: 4 },
        { theme: 'Business', count: 3 },
        { theme: 'Scientific', count: 2 },
        { theme: 'Social', count: 1 },
      ],
      totalSources: 10,
    },
    sourceComparisonReport: {
      sourceRatings: [
        { index: 1, title: 'GitHub Copilot Impact Report 2024', platform: 'web', url: '#', credibility: 9, depth: 8, bias: 'Medium', uniqueness: 7, oneLiner: 'Authoritative first-party data but has commercial interest' },
        { index: 2, title: 'ArXiv Controlled Study', platform: 'academic', url: '#', credibility: 10, depth: 9, bias: 'Low', uniqueness: 9, oneLiner: 'Gold standard methodology with peer-reviewed results' },
        { index: 3, title: 'Reddit Community Discussion', platform: 'reddit', url: '#', credibility: 5, depth: 4, bias: 'Low', uniqueness: 8, oneLiner: 'Valuable practitioner voice but lacks systematic evidence' },
      ],
      mostCredibleSource: { index: 2, reason: 'Peer-reviewed, randomized controlled trial with clear methodology' },
      mostUniqueSource: { index: 2, reason: 'First study to apply RCT methodology to AI coding tool evaluation' },
      overallVerdict: 'Sources converge on a positive but nuanced picture. Academic research provides rigorous evidence of productivity gains while community voices highlight important caveats around skill atrophy and use-case limitations.',
      recommendedReading: [1, 2],
    },
    metadata: {
      totalSources: 10,
      platforms: ['web', 'academic', 'reddit', 'hackernews', 'news'],
      generatedAt: new Date('2025-01-10').toISOString(),
    },
    onChain: true,
    blockchainId: 10,
    curator: '0x1234567890123456789012345678901234567890',
    curatorName: 'CryptoResearcher',
    ipfsHash: 'QmResearch1IpfsHashExample123456789',
    upvotes: 23,
    upvotedBy: [],
  },
  {
    topic: 'Bitcoin ETF Impact on Institutional Crypto Adoption',
    executiveSummary: 'The approval of spot Bitcoin ETFs in January 2024 represents an inflection point for institutional cryptocurrency adoption. Analysis across financial media, academic research, and industry reports shows that inflows exceeded all analyst projections, with BlackRock\'s iShares Bitcoin Trust becoming the fastest ETF to reach $10 billion in assets. The structural change in market access is bringing a new class of capital allocators into the Bitcoin ecosystem.',
    keyInsights: [
      'US spot Bitcoin ETFs accumulated over $50 billion in AUM within 6 months of approval',
      'BlackRock IBIT became the fastest ETF in history to reach $10 billion AUM',
      'Institutional allocation to Bitcoin moved from 1% to 3-5% of alternatives portfolios post-ETF',
      'Retail Bitcoin ownership paradoxically decreased as institutions absorbed supply',
      'The ETF structure resolved custody and regulatory compliance barriers for pension funds',
    ],
    sources: [
      {
        platform: 'news',
        title: 'Bitcoin ETF Inflows Shatter Records as Wall Street Embraces Crypto',
        url: 'https://wsj.com/bitcoin-etf-records',
        snippet: 'Wall Street Journal coverage of record ETF inflows',
        analysis: {
          mainArgument: 'Bitcoin ETFs have attracted unprecedented institutional capital flows',
          keyClaims: ['$50B AUM reached within 6 months', 'Pension funds are allocating for first time', 'ETF premium to spot eliminated'],
          sentiment: 'positive',
          credibilityIndicators: { hasEvidence: true, hasCitations: true, authorityLevel: 'high' },
          uniqueContribution: 'Primary source data from institutional allocation desks',
        },
      },
    ],
    comparativeAnalysis: {
      comparisonTable: [
        { source: 'Wall Street Journal', platform: 'news', mainArgument: 'Record inflows confirmed', sentiment: 'positive', credibility: 'high' },
      ],
      insights: {
        patterns: ['All major financial publications confirm record inflows'],
        majorAgreements: ['ETF approval was a watershed moment for Bitcoin institutionalization'],
        keyDebates: ['Whether ETF structure changes Bitcoin\'s decentralization properties'],
      },
    },
    consensusVsContradiction: {
      widelyAgreedPoints: ['ETF inflows exceeded projections', 'Institutional adoption accelerated post-ETF'],
      debatedViews: [],
      minorityPerspectives: ['ETFs undermine Bitcoin self-custody principles'],
      evidenceGaps: ['Long-term price impact data still developing'],
    },
    visualizationData: {
      sentimentDistribution: [
        { sentiment: 'Positive', count: 7, percentage: 70 },
        { sentiment: 'Neutral', count: 2, percentage: 20 },
        { sentiment: 'Negative', count: 1, percentage: 10 },
      ],
      platformDistribution: [
        { platform: 'News', count: 4, percentage: 40 },
        { platform: 'Web', count: 3, percentage: 30 },
        { platform: 'Academic', count: 2, percentage: 20 },
        { platform: 'Reddit', count: 1, percentage: 10 },
      ],
      credibilityDistribution: [
        { level: 'High', count: 6 },
        { level: 'Medium', count: 3 },
        { level: 'Low', count: 1 },
      ],
      thematicClusters: [
        { theme: 'Business', count: 6 },
        { theme: 'Scientific', count: 2 },
        { theme: 'Technical', count: 2 },
      ],
      totalSources: 10,
    },
    sourceComparisonReport: null,
    metadata: {
      totalSources: 10,
      platforms: ['news', 'web', 'academic', 'reddit'],
      generatedAt: new Date('2025-02-01').toISOString(),
    },
    onChain: true,
    blockchainId: 11,
    curator: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    curatorName: 'Web3Analyst',
    ipfsHash: 'QmResearch2IpfsHashExample123456789',
    upvotes: 31,
    upvotedBy: [],
  },
];

const COMPARISONS = [
  {
    articleOneUrl: 'https://techcrunch.com/sample-article-1',
    articleTwoUrl: 'https://theverge.com/sample-article-2',
    articleOneTitle: 'TechCrunch: Why GPT-4 Is a Breakthrough',
    articleTwoTitle: 'The Verge: GPT-4\'s Real Limitations',
    articleOneMeta: {
      title: 'Why GPT-4 Is a Breakthrough',
      author: 'Sarah Perez',
      publisher: 'TechCrunch',
      date: '2024-03-15',
      image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400',
      description: 'GPT-4 represents a quantum leap in AI capability with multimodal reasoning.',
    },
    articleTwoMeta: {
      title: 'GPT-4\'s Real Limitations',
      author: 'James Vincent',
      publisher: 'The Verge',
      date: '2024-03-16',
      image: 'https://images.unsplash.com/photo-1684369175833-4b445ad6bfb5?w=400',
      description: 'Despite the hype, GPT-4 still hallucinates facts and struggles with reasoning.',
    },
    report: {
      overview: {
        article1: { title: 'Why GPT-4 Is a Breakthrough', publisher: 'TechCrunch', author: 'Sarah Perez', date: '2024-03-15', wordCountEstimate: 1200 },
        article2: { title: 'GPT-4\'s Real Limitations', publisher: 'The Verge', author: 'James Vincent', date: '2024-03-16', wordCountEstimate: 950 },
      },
      dimensions: {
        credibility: { article1Score: 7, article2Score: 8, article1Analysis: 'Cites OpenAI benchmarks but limited independent verification', article2Analysis: 'Sources academic researchers and provides specific failure examples', winner: 'article2', explanation: 'The Verge article provides more independently verifiable evidence' },
        depth: { article1Score: 6, article2Score: 8, article1Analysis: 'Broad overview without technical depth', article2Analysis: 'Detailed analysis of specific failure modes with examples', winner: 'article2', explanation: 'Greater technical depth and specific examples' },
        bias: { article1Score: 5, article2Score: 8, article1Bias: 'Optimistic framing favoring tech industry narrative', article2Bias: 'Critical but balanced assessment', article1Analysis: 'Positive framing throughout', article2Analysis: 'Acknowledges capabilities while noting limitations', winner: 'article2', explanation: 'More balanced treatment of the subject' },
        truthiness: { article1Score: 7, article2Score: 8, article1Analysis: 'Core claims accurate but selectively presented', article2Analysis: 'Claims well-supported with specific examples', winner: 'article2', explanation: 'Both accurate but Article 2 more complete' },
        impact: { article1Score: 8, article2Score: 7, article1Analysis: 'High shareability and broad reach due to positive framing', article2Analysis: 'Important corrective but less viral', winner: 'article1', explanation: 'Article 1 likely reached wider audience' },
        writingQuality: { article1Score: 8, article2Score: 8, article1Analysis: 'Clear, engaging consumer-friendly prose', article2Analysis: 'Technical clarity with accessible explanations', winner: 'article1', explanation: 'Slight edge in readability for general audience' },
        publicPresence: { article1Score: 8, article2Score: 9, article1Analysis: 'TechCrunch has 12M monthly visitors', article2Analysis: 'The Verge has 18M monthly visitors and strong tech credibility', winner: 'article2', explanation: 'The Verge has larger and more technically engaged readership' },
        originality: { article1Score: 5, article2Score: 8, article1Analysis: 'Largely summarizes OpenAI marketing materials', article2Analysis: 'Original reporting with researcher interviews', winner: 'article2', explanation: 'Article 2 brings original reporting and fresh perspectives' },
      },
      agreements: [
        'Both articles confirm GPT-4 is a significant advancement over GPT-3.5',
        'Both acknowledge the multimodal capabilities as a genuine innovation',
        'Both agree that the model will have significant economic impact',
      ],
      disagreements: [
        { topic: 'Overall Assessment', article1Position: 'GPT-4 represents a breakthrough that fundamentally changes AI capabilities', article2Position: 'GPT-4 is impressive but current limitations prevent transformative deployment' },
        { topic: 'Reliability for Professional Use', article1Position: 'Ready for enterprise deployment with appropriate guardrails', article2Position: 'Hallucination rates remain too high for high-stakes professional applications' },
      ],
      overallScores: { article1Total: 54, article2Total: 64, article1Percentage: 67, article2Percentage: 80 },
      verdict: {
        winner: 'article2',
        shortVerdict: 'The Verge article wins with more rigorous, balanced reporting',
        fullVerdict: 'While TechCrunch delivers an accessible and widely-read perspective on GPT-4, The Verge article demonstrates superior journalistic rigor through independent source verification, specific failure case analysis, and balanced framing. The Verge\'s piece better serves readers seeking to make informed decisions about AI adoption.',
        recommendation: 'Read TechCrunch for a quick overview of capabilities; read The Verge for a critical assessment before making deployment decisions',
      },
      keyDifferences: [
        'TechCrunch focuses on capabilities; The Verge focuses on limitations',
        'Different sources: OpenAI marketing vs independent academic researchers',
        'Framing: breakthrough narrative vs measured critical assessment',
        'Intended audience: business decision-makers vs technically-informed readers',
      ],
      factCheckNotes: [
        'TechCrunch claim of "90% on bar exam" needs context — this is the top percentile, not overall pass rate',
        'The Verge\'s hallucination rate statistics should be verified against independent benchmarks',
      ],
    },
    verdict: 'The Verge article wins with more rigorous, balanced reporting',
    onChain: false,
    upvotes: 12,
    upvotedBy: [],
    ipfsHash: null,
  },
];

// ─── SEED FUNCTION ────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Starting database seed...\n');

  // ── Users ──
  console.log('👤 Seeding users...');
  for (const user of USERS) {
    await prisma.user.upsert({
      where: { walletAddress: user.walletAddress },
      update: { displayName: user.displayName },
      create: user,
    });
    console.log(`   ✅ User: ${user.displayName}`);
  }

  // ── Articles ──
  console.log('\n📰 Seeding articles...');
  const createdArticles = [];
  for (const article of ARTICLES) {
    try {
      const created = await prisma.article.upsert({
        where: { articleUrl: article.articleUrl },
        update: {},
        create: {
          ...article,
          cardJson: JSON.stringify({ headline: article.title, quickSummary: article.summary }),
        },
      });
      createdArticles.push(created);
      console.log(`   ✅ Article: "${article.title.substring(0, 50)}..."`);
    } catch (err) {
      console.error(`   ❌ Failed: ${article.title.substring(0, 40)} — ${err.message}`);
    }
  }

  // ── Comments ──
  console.log('\n💬 Seeding comments...');
  if (createdArticles.length > 0) {
    const sampleComments = [
      {
        articleId: createdArticles[0].id,
        articleUrl: createdArticles[0].articleUrl,
        content: 'This is a really insightful analysis of L2 solutions. The fee comparison data is particularly compelling for dApp developers considering migration.',
        author: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        authorName: 'Web3Analyst',
        upvotes: 8,
        onChain: true,
        commentId: 1,
        ipfsHash: 'QmComment1IpfsHash123',
        upvotedBy: [],
      },
      {
        articleId: createdArticles[0].id,
        articleUrl: createdArticles[0].articleUrl,
        content: 'Great piece! Though I\'d push back on the 100x gas savings claim — in practice it depends heavily on transaction type and network congestion conditions.',
        author: '0x9876543210987654321098765432109876543210',
        authorName: 'DeFiExplorer',
        upvotes: 5,
        onChain: true,
        commentId: 2,
        ipfsHash: 'QmComment2IpfsHash123',
        upvotedBy: [],
      },
    ];

    for (const comment of sampleComments) {
      try {
        await prisma.comment.create({ data: comment });
        console.log(`   ✅ Comment by ${comment.authorName}`);
      } catch (err) {
        console.error(`   ❌ Comment failed: ${err.message}`);
      }
    }

    // Reply to first comment
    const firstComment = await prisma.comment.findFirst({
      where: { articleId: createdArticles[0].id },
    });
    if (firstComment) {
      await prisma.comment.create({
        data: {
          articleId: createdArticles[0].id,
          articleUrl: createdArticles[0].articleUrl,
          content: 'Fair point on the gas savings variance. The 100x figure is for simple ETH transfers; ERC-20 transfers are more like 10-30x depending on conditions.',
          author: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
          authorName: 'BlockchainDev',
          upvotes: 3,
          onChain: false,
          upvotedBy: [],
          parentId: firstComment.id,
        },
      });
      console.log(`   ✅ Reply to comment`);
    }
  }

  // ── Research Reports ──
  console.log('\n🔬 Seeding research reports...');
  const createdResearch = [];
  for (const report of RESEARCH_REPORTS) {
    try {
      const created = await prisma.research.create({ data: report });
      createdResearch.push(created);
      console.log(`   ✅ Research: "${report.topic.substring(0, 50)}..."`);
    } catch (err) {
      console.error(`   ❌ Research failed: ${err.message}`);
    }
  }

  // ── Research Comments ──
  console.log('\n💬 Seeding research comments...');
  if (createdResearch.length > 0) {
    try {
      await prisma.researchComment.create({
        data: {
          researchId: createdResearch[0].id,
          content: 'The finding about senior developers benefiting more from AI tools is counterintuitive at first — but makes sense when you consider that they write better prompts.',
          author: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
          authorName: 'Web3Analyst',
          upvotes: 7,
          onChain: false,
          upvotedBy: [],
        },
      });
      console.log(`   ✅ Research comment added`);
    } catch (err) {
      console.error(`   ❌ Research comment failed: ${err.message}`);
    }
  }

  // ── Comparisons ──
  console.log('\n⚖️  Seeding comparisons...');
  for (const comp of COMPARISONS) {
    try {
      await prisma.comparison.create({ data: comp });
      console.log(`   ✅ Comparison: "${comp.articleOneTitle.substring(0, 35)}" vs "${comp.articleTwoTitle.substring(0, 35)}"`);
    } catch (err) {
      console.error(`   ❌ Comparison failed: ${err.message}`);
    }
  }

  console.log('\n✨ Seeding complete!\n');

  // Summary
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.article.count(),
    prisma.comment.count(),
    prisma.research.count(),
    prisma.researchComment.count(),
    prisma.comparison.count(),
  ]);
  console.log('📊 Database Summary:');
  console.log(`   Users: ${counts[0]}`);
  console.log(`   Articles: ${counts[1]}`);
  console.log(`   Comments: ${counts[2]}`);
  console.log(`   Research Reports: ${counts[3]}`);
  console.log(`   Research Comments: ${counts[4]}`);
  console.log(`   Comparisons: ${counts[5]}`);
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());