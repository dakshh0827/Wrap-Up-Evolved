import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * RESEARCH REPORT SYNTHESIZER
 * Analyzes multiple sources and generates comprehensive research report
 * with structured insights, comparative analysis, and consensus mapping
 */

export async function synthesizeResearchReport(topic, sources) {
  try {
    console.log(`🧠 Synthesizing report for ${sources.length} sources...`);

    const analyzedSources = await analyzeIndividualSources(sources, topic);
    const comparativeAnalysis = await generateComparativeAnalysis(analyzedSources, topic);
    const consensusMap = await identifyConsensusAndContradictions(analyzedSources, topic);
    const synthesis = await generateExecutiveSummary(topic, analyzedSources, comparativeAnalysis, consensusMap);
    const visualizationData = generateVisualizationData(analyzedSources);
    const sourceComparisonReport = await generateSourceComparisonReport(analyzedSources, topic);

    return {
      executiveSummary: synthesis.executiveSummary,
      keyInsights: synthesis.keyInsights,
      sources: analyzedSources,
      comparativeAnalysis,
      consensusVsContradiction: consensusMap,
      visualizationData,
      sourceComparisonReport, // NEW
      metadata: {
        totalSources: sources.length,
        analysisDepth: 'comprehensive',
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Report synthesis error:', error.message);
    throw new Error('Failed to synthesize report: ' + error.message);
  }
}

/**
 * Analyze each source individually for:
 * - Main arguments
 * - Key claims
 * - Sentiment
 * - Credibility indicators
 */
async function analyzeIndividualSources(sources, topic) {
  const analysisPromises = sources.map(async (source) => {
    try {
      const analysis = await analyzeSingleSource(source, topic);
      return {
        ...source,
        analysis
      };
    } catch (error) {
      console.error(`Analysis error for ${source.url}:`, error.message);
      return {
        ...source,
        analysis: {
          mainArgument: 'Analysis unavailable',
          keyClaims: [],
          sentiment: 'neutral',
          credibilityIndicators: [],
          uniqueContribution: 'Unable to analyze'
        }
      };
    }
  });
  
  return await Promise.all(analysisPromises);
}

/**
 * Analyze a single source using AI
 */
async function analyzeSingleSource(source, topic) {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are a research analyst. Analyze the provided source content in relation to the topic.

Extract:
1. Main Argument - The primary thesis or position (1-2 sentences)
2. Key Claims - Specific factual claims or assertions (list 3-5)
3. Sentiment - Overall tone: positive, negative, neutral, or balanced
4. Credibility Indicators - Evidence quality, source authority, citation usage
5. Unique Contribution - What makes this source distinct from others

Respond ONLY with valid JSON.`
        },
        {
          role: "user",
          content: `Topic: ${topic}

Source Title: ${source.title}
Platform: ${source.platform}
Content: ${source.content.substring(0, 2000)}

Provide analysis in JSON format:
{
  "mainArgument": "concise statement",
  "keyClaims": ["claim 1", "claim 2", "claim 3"],
  "sentiment": "positive|negative|neutral|balanced",
  "credibilityIndicators": {
    "hasEvidence": true/false,
    "hasCitations": true/false,
    "authorityLevel": "high|medium|low"
  },
  "uniqueContribution": "what makes this source unique"
}`
        }
      ],
      temperature: 0.5,
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(completion.choices[0].message.content);
    
  } catch (error) {
    console.error('Single source analysis error:', error.message);
    throw error;
  }
}

/**
 * Generate comparative analysis table
 */
async function generateComparativeAnalysis(analyzedSources, topic) {
  try {
    // Create comparison matrix
    const comparisonData = analyzedSources.map(source => ({
      source: source.title,
      platform: source.platform,
      url: source.url,
      mainArgument: source.analysis.mainArgument,
      sentiment: source.analysis.sentiment,
      uniqueContribution: source.analysis.uniqueContribution,
      credibility: source.analysis.credibilityIndicators?.authorityLevel || 'medium'
    }));
    
    // Use AI to identify patterns
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `Analyze the comparative data and identify key patterns, agreements, and disagreements across sources. Provide structured insights.`
        },
        {
          role: "user",
          content: `Topic: ${topic}

Source Comparison:
${JSON.stringify(comparisonData, null, 2)}

Provide analysis in JSON:
{
  "patterns": ["pattern 1", "pattern 2"],
  "majorAgreements": ["agreement 1", "agreement 2"],
  "keyDebates": ["debate 1", "debate 2"],
  "qualityAssessment": "overall source quality assessment"
}`
        }
      ],
      temperature: 0.6,
      response_format: { type: "json_object" }
    });
    
    const insights = JSON.parse(completion.choices[0].message.content);
    
    return {
      comparisonTable: comparisonData,
      insights
    };
    
  } catch (error) {
    console.error('Comparative analysis error:', error.message);
    return {
      comparisonTable: analyzedSources.map(s => ({
        source: s.title,
        platform: s.platform,
        mainArgument: s.analysis.mainArgument,
        sentiment: s.analysis.sentiment
      })),
      insights: {
        patterns: [],
        majorAgreements: [],
        keyDebates: []
      }
    };
  }
}

/**
 * Identify consensus and contradictions
 */
async function identifyConsensusAndContradictions(analyzedSources, topic) {
  try {
    const allClaims = analyzedSources.flatMap(s => s.analysis.keyClaims || []);
    const allArguments = analyzedSources.map(s => ({
      source: s.title,
      argument: s.analysis.mainArgument,
      sentiment: s.analysis.sentiment
    }));
    
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `Analyze the claims and arguments to identify:
1. Widely Agreed Points - What most sources agree on
2. Debated Views - Where sources significantly disagree
3. Minority Perspectives - Unique or outlier viewpoints
4. Evidence Gaps - Areas lacking clear evidence

Respond ONLY with valid JSON.`
        },
        {
          role: "user",
          content: `Topic: ${topic}

All Claims Across Sources:
${JSON.stringify(allClaims, null, 2)}

Source Arguments:
${JSON.stringify(allArguments, null, 2)}

Provide consensus mapping in JSON:
{
  "widelyAgreedPoints": ["point 1", "point 2", "point 3"],
  "debatedViews": [
    {
      "topic": "debate topic",
      "positions": ["position A", "position B"],
      "sourcesCount": {"A": 3, "B": 2}
    }
  ],
  "minorityPerspectives": ["perspective 1", "perspective 2"],
  "evidenceGaps": ["gap 1", "gap 2"]
}`
        }
      ],
      temperature: 0.6,
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(completion.choices[0].message.content);
    
  } catch (error) {
    console.error('Consensus mapping error:', error.message);
    return {
      widelyAgreedPoints: [],
      debatedViews: [],
      minorityPerspectives: [],
      evidenceGaps: []
    };
  }
}

/**
 * Generate executive summary and key insights
 */
async function generateExecutiveSummary(topic, analyzedSources, comparativeAnalysis, consensusMap) {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are a research synthesizer. Create a comprehensive executive summary and key insights from the analyzed sources.

The executive summary should:
- Be 200-300 words
- Synthesize main findings across all sources
- Highlight consensus and key debates
- Provide actionable insights
- Be written in clear, professional language

Key insights should:
- Be 5-7 distinct points
- Each 1-2 sentences
- Represent the most important takeaways
- Be evidence-based and non-plagiarized

CRITICAL: All content must be 100% original and synthesized. Never copy exact phrases from sources.`
        },
        {
          role: "user",
          content: `Topic: ${topic}

Number of Sources: ${analyzedSources.length}

Comparative Analysis:
${JSON.stringify(comparativeAnalysis.insights, null, 2)}

Consensus Map:
${JSON.stringify(consensusMap, null, 2)}

Source Sentiments:
${analyzedSources.map(s => `${s.title}: ${s.analysis.sentiment}`).join('\n')}

Provide synthesis in JSON:
{
  "executiveSummary": "comprehensive 200-300 word synthesis",
  "keyInsights": [
    "insight 1",
    "insight 2",
    "insight 3",
    "insight 4",
    "insight 5"
  ]
}`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(completion.choices[0].message.content);
    
  } catch (error) {
    console.error('Executive summary error:', error.message);
    return {
      executiveSummary: `Research on "${topic}" analyzed ${analyzedSources.length} sources across multiple platforms. The analysis revealed diverse perspectives with both areas of consensus and active debate. Further investigation is recommended for comprehensive understanding.`,
      keyInsights: [
        'Multiple perspectives were identified across sources',
        'Source quality and credibility varied significantly',
        'Additional research may be needed for conclusive findings'
      ]
    };
  }
}

/**
 * Generate data for visualizations
 */
function generateVisualizationData(analyzedSources) {
  // Sentiment distribution
  const sentiments = analyzedSources.reduce((acc, source) => {
    const sentiment = source.analysis.sentiment || 'neutral';
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {});
  
  const sentimentData = Object.entries(sentiments).map(([sentiment, count]) => ({
    sentiment: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
    count,
    percentage: Math.round((count / analyzedSources.length) * 100)
  }));
  
  // Platform distribution
  const platforms = analyzedSources.reduce((acc, source) => {
    acc[source.platform] = (acc[source.platform] || 0) + 1;
    return acc;
  }, {});
  
  const platformData = Object.entries(platforms).map(([platform, count]) => ({
    platform: platform.charAt(0).toUpperCase() + platform.slice(1),
    count,
    percentage: Math.round((count / analyzedSources.length) * 100)
  }));
  
  // Credibility distribution
  const credibilityLevels = analyzedSources.reduce((acc, source) => {
    const level = source.analysis.credibilityIndicators?.authorityLevel || 'medium';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});
  
  const credibilityData = Object.entries(credibilityLevels).map(([level, count]) => ({
    level: level.charAt(0).toUpperCase() + level.slice(1),
    count
  }));
  
  // Thematic clustering (simplified)
  const themes = {
    technical: 0,
    business: 0,
    social: 0,
    scientific: 0,
    other: 0
  };
  
  analyzedSources.forEach(source => {
    const content = (source.content + source.analysis.mainArgument).toLowerCase();
    if (content.includes('technology') || content.includes('software')) themes.technical++;
    else if (content.includes('business') || content.includes('market')) themes.business++;
    else if (content.includes('social') || content.includes('community')) themes.social++;
    else if (content.includes('research') || content.includes('study')) themes.scientific++;
    else themes.other++;
  });
  
  const themeData = Object.entries(themes)
    .filter(([_, count]) => count > 0)
    .map(([theme, count]) => ({
      theme: theme.charAt(0).toUpperCase() + theme.slice(1),
      count
    }));
  
  return {
    sentimentDistribution: sentimentData,
    platformDistribution: platformData,
    credibilityDistribution: credibilityData,
    thematicClusters: themeData,
    totalSources: analyzedSources.length
  };
}

// ADD THIS to the return object in synthesizeResearchReport():
//   sourceComparisonReport: await generateSourceComparisonReport(analyzedSources, topic),

/**
 * NEW: Generate a per-source comparison table for the frontend report
 */
export async function generateSourceComparisonReport(analyzedSources, topic) {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are a research analyst. Given multiple analyzed sources about a topic, produce a structured comparison report. 
Rate each source on: Credibility (1-10), Depth (1-10), Bias (Low/Medium/High), Uniqueness (1-10).
Also identify the single most credible source, the most unique perspective, and an overall verdict.
Respond ONLY with valid JSON.`,
        },
        {
          role: 'user',
          content: `Topic: ${topic}

Sources:
${analyzedSources
  .map(
    (s, i) => `
[${i + 1}] Platform: ${s.platform}
Title: ${s.title}
Main Argument: ${s.analysis?.mainArgument || 'N/A'}
Sentiment: ${s.analysis?.sentiment || 'neutral'}
Key Claims: ${(s.analysis?.keyClaims || []).join(' | ')}
URL: ${s.url}
`,
  )
  .join('\n')}

Respond in JSON:
{
  "sourceRatings": [
    {
      "index": 1,
      "title": "...",
      "platform": "...",
      "url": "...",
      "credibility": 8,
      "depth": 7,
      "bias": "Low",
      "uniqueness": 6,
      "oneLiner": "Why this source stands out or falls short"
    }
  ],
  "mostCredibleSource": { "index": 1, "reason": "..." },
  "mostUniqueSource": { "index": 3, "reason": "..." },
  "overallVerdict": "2-3 sentence synthesis of what the sources collectively show",
  "recommendedReading": [1, 3]
}`,
        },
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Source comparison report error:', error.message);
    return {
      sourceRatings: analyzedSources.map((s, i) => ({
        index: i + 1,
        title: s.title,
        platform: s.platform,
        url: s.url,
        credibility: 5,
        depth: 5,
        bias: 'Unknown',
        uniqueness: 5,
        oneLiner: 'Analysis unavailable',
      })),
      overallVerdict: 'Comparison analysis unavailable.',
      recommendedReading: [1],
    };
  }
}