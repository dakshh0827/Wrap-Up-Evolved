import axios from 'axios';
import * as cheerio from 'cheerio';
import got from 'got';

/**
 * MULTI-SOURCE RESEARCH ENGINE
 * Searches across 10+ platforms and extracts clean content
 * Platforms: Web search, X/Twitter, LinkedIn, Reddit, Medium, Dev.to, GitHub, ArXiv, News APIs
 */

// Platform search configurations
const SEARCH_PLATFORMS = {
  WEB: 'web',
  TWITTER: 'twitter',
  LINKEDIN: 'linkedin',
  REDDIT: 'reddit',
  MEDIUM: 'medium',
  GITHUB: 'github',
  NEWS: 'news',
  ACADEMIC: 'academic'
};

/**
 * Main research orchestrator
 * Searches across all platforms and returns top 10 sources
 */
export async function conductMultiSourceResearch(topic, userContext = null) {
  try {
    console.log(`🔍 Multi-source search for: "${topic}"`);
    
    // Parallel search across all platforms
    const searchPromises = [
      searchWeb(topic, 3),           // 3 web sources
      searchTwitter(topic, 2),       // 2 Twitter threads
      searchReddit(topic, 2),        // 2 Reddit discussions
      searchNews(topic, 2),          // 2 news articles
      searchAcademic(topic, 1)       // 1 academic paper
    ];
    
    const results = await Promise.allSettled(searchPromises);
    
    // Flatten and filter successful results
    const allSources = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value)
      .filter(Boolean);
    
    console.log(`📚 Found ${allSources.length} sources across platforms`);
    
    // Rank and select top 10
    const rankedSources = rankSources(allSources, topic);
    const topSources = rankedSources.slice(0, 10);
    
    // Extract full content for each source
    const sourcesWithContent = await Promise.all(
      topSources.map(source => extractSourceContent(source))
    );
    
    return sourcesWithContent.filter(s => s.content && s.content.length > 100);
    
  } catch (error) {
    console.error('Multi-source research error:', error.message);
    throw new Error('Failed to conduct research: ' + error.message);
  }
}

/**
 * Search web using DuckDuckGo HTML scraping
 */
/**
 * Search web using DuckDuckGo HTML scraping
 */
async function searchWeb(topic, limit = 3) {
  try {
    const query = encodeURIComponent(topic);
    const url = `https://html.duckduckgo.com/html/?q=${query}`;
    
    const response = await got(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: { request: 10000 }
    });
    
    const $ = cheerio.load(response.body);
    const results = [];
    
    $('.result').each((i, elem) => {
      if (results.length >= limit) return false;
      
      const title = $(elem).find('.result__title').text().trim();
      const snippet = $(elem).find('.result__snippet').text().trim();
      let link = $(elem).find('.result__url').attr('href');
      
      // FIX: Handle relative URLs from DuckDuckGo
      if (link && link.startsWith('//')) {
        link = 'https:' + link;
      } else if (link && link.startsWith('/')) {
        link = 'https://duckduckgo.com' + link;
      }
      
      // Extract actual URL from DuckDuckGo redirect
      if (link && link.includes('uddg=')) {
        try {
          const urlParams = new URL(link);
          const actualUrl = urlParams.searchParams.get('uddg');
          if (actualUrl) {
            link = decodeURIComponent(actualUrl);
          }
        } catch (e) {
          console.log('Could not parse URL:', link);
        }
      }
      
      if (title && link && link.startsWith('http')) {
        results.push({
          platform: SEARCH_PLATFORMS.WEB,
          title,
          url: link,
          snippet,
          relevanceScore: 0.9
        });
      }
    });
    
    console.log(`🌐 Web search: ${results.length} results`);
    return results;
  } catch (error) {
    console.error('Web search error:', error.message);
    return [];
  }
}

/**
 * Search Twitter/X (using Nitter instances or scraping)
 */
async function searchTwitter(topic, limit = 2) {
  try {
    // Using Nitter (privacy-focused Twitter frontend)
    const query = encodeURIComponent(topic);
    const nitterInstance = 'nitter.net';
    const url = `https://${nitterInstance}/search?f=tweets&q=${query}`;
    
    const response = await got(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: { request: 10000 }
    }).catch(() => ({ body: '' }));
    
    const $ = cheerio.load(response.body);
    const results = [];
    
    $('.timeline-item').each((i, elem) => {
      if (results.length >= limit) return false;
      
      const tweetText = $(elem).find('.tweet-content').text().trim();
      const author = $(elem).find('.username').text().trim();
      const tweetLink = $(elem).find('.tweet-link').attr('href');
      
      if (tweetText && tweetText.length > 50) {
        results.push({
          platform: SEARCH_PLATFORMS.TWITTER,
          title: `Tweet by ${author}`,
          url: tweetLink ? `https://twitter.com${tweetLink}` : '#',
          snippet: tweetText.substring(0, 200) + '...',
          content: tweetText,
          author,
          relevanceScore: 0.7
        });
      }
    });
    
    console.log(`🐦 Twitter search: ${results.length} results`);
    return results;
  } catch (error) {
    console.error('Twitter search error:', error.message);
    return [];
  }
}

/**
 * Search Reddit
 */
async function searchReddit(topic, limit = 2) {
  try {
    const query = encodeURIComponent(topic);
    const url = `https://www.reddit.com/search.json?q=${query}&limit=${limit}&sort=relevance`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 Research/1.0'
      }
    });
    
    const posts = response.data.data.children;
    const results = posts.map(post => {
      const data = post.data;
      return {
        platform: SEARCH_PLATFORMS.REDDIT,
        title: data.title,
        url: `https://reddit.com${data.permalink}`,
        snippet: data.selftext ? data.selftext.substring(0, 200) + '...' : '',
        content: data.selftext || '',
        author: data.author,
        subreddit: data.subreddit,
        score: data.score,
        relevanceScore: 0.75
      };
    });
    
    console.log(`🔴 Reddit search: ${results.length} results`);
    return results;
  } catch (error) {
    console.error('Reddit search error:', error.message);
    return [];
  }
}

/**
 * Search news articles (using NewsAPI or web scraping)
 */
async function searchNews(topic, limit = 2) {
  try {
    // Fallback: scrape Google News
    const query = encodeURIComponent(topic);
    const url = `https://news.google.com/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;
    
    const response = await got(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: { request: 10000 }
    }).catch(() => ({ body: '' }));
    
    const $ = cheerio.load(response.body);
    const results = [];
    
    $('article').each((i, elem) => {
      if (results.length >= limit) return false;
      
      const title = $(elem).find('h3, h4').first().text().trim();
      const link = $(elem).find('a').first().attr('href');
      const snippet = $(elem).find('p').first().text().trim();
      
      if (title && link) {
        const fullUrl = link.startsWith('http') ? link : `https://news.google.com${link}`;
        results.push({
          platform: SEARCH_PLATFORMS.NEWS,
          title,
          url: fullUrl,
          snippet,
          relevanceScore: 0.85
        });
      }
    });
    
    console.log(`📰 News search: ${results.length} results`);
    return results;
  } catch (error) {
    console.error('News search error:', error.message);
    return [];
  }
}

/**
 * Search academic papers (using ArXiv API)
 */
async function searchAcademic(topic, limit = 1) {
  try {
    const query = encodeURIComponent(topic);
    const url = `http://export.arxiv.org/api/query?search_query=all:${query}&start=0&max_results=${limit}&sortBy=relevance`;
    
    const response = await axios.get(url);
    const $ = cheerio.load(response.data, { xmlMode: true });
    
    const results = [];
    $('entry').each((i, elem) => {
      const title = $(elem).find('title').text().trim();
      const summary = $(elem).find('summary').text().trim();
      const link = $(elem).find('id').text().trim();
      const authors = [];
      $(elem).find('author name').each((j, author) => {
        authors.push($(author).text().trim());
      });
      
      if (title) {
        results.push({
          platform: SEARCH_PLATFORMS.ACADEMIC,
          title,
          url: link,
          snippet: summary.substring(0, 200) + '...',
          content: summary,
          authors: authors.join(', '),
          relevanceScore: 0.95
        });
      }
    });
    
    console.log(`🎓 Academic search: ${results.length} results`);
    return results;
  } catch (error) {
    console.error('Academic search error:', error.message);
    return [];
  }
}

/**
 * Rank sources by relevance
 */
function rankSources(sources, topic) {
  const topicWords = topic.toLowerCase().split(' ').filter(w => w.length > 3);
  
  return sources
    .map(source => {
      let score = source.relevanceScore || 0.5;
      
      // Boost based on title match
      const titleLower = source.title.toLowerCase();
      const matchCount = topicWords.filter(word => titleLower.includes(word)).length;
      score += (matchCount / topicWords.length) * 0.3;
      
      // Boost based on platform credibility
      if (source.platform === SEARCH_PLATFORMS.ACADEMIC) score += 0.2;
      if (source.platform === SEARCH_PLATFORMS.NEWS) score += 0.15;
      
      // Boost based on content length
      if (source.content && source.content.length > 500) score += 0.1;
      
      return { ...source, finalScore: Math.min(score, 1.0) };
    })
    .sort((a, b) => b.finalScore - a.finalScore);
}

/**
 * Extract full content from source URL
 */
async function extractSourceContent(source) {
  try {
    // If content already exists (e.g., from Reddit/Twitter), return as is
    if (source.content && source.content.length > 200) {
      return source;
    }
    
    // Otherwise, scrape the URL
    const response = await got(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: { request: 15000 }
    });
    
    const $ = cheerio.load(response.body);
    
    // Remove unwanted elements
    $('script, style, nav, header, footer, aside, iframe, .ad').remove();
    
    // Extract main content
    let content = '';
    const contentSelectors = ['article', '[role="main"]', '.article-content', '.post-content', 'main'];
    
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text().trim();
        break;
      }
    }
    
    // Fallback to body
    if (!content) {
      content = $('body').text().trim();
    }
    
    // Clean and truncate
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim()
      .substring(0, 5000); // Limit to 5000 chars
    
    return {
      ...source,
      content,
      extractedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`Content extraction error for ${source.url}:`, error.message);
    // Return source with snippet as content
    return {
      ...source,
      content: source.snippet || '',
      extractionError: true
    };
  }
}

/**
 * Validate and clean extracted content
 */
function cleanExtractedContent(content) {
  return content
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable chars
    .trim();
}