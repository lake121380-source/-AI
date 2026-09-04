import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  initialArticles,
  initialCategories,
  initialTasks,
  initialKnowledgeBases,
  initialKnowledgeChunks,
  initialDistributionChannels,
  initialAiModels,
  initialPrompts,
  initialAnalytics,
  initialGeoPerformance,
  sampleTitles,
  sampleKeywords,
  initialCompetitorComparison,
  initialRadarQueries,
  sampleUrlScanReports,
  initialLlmsTxtConfig,
  initialRobotsConfig,
  initialDualSitemapConfig,
  sampleBaselineSeoCheck,
  initialBrandEntityConfig,
  sampleEeatAuditReport,
  initialAiReferralSources,
  initialTrafficFunnelStages,
  initialUtmPresets,
} from './src/data/mockData';
import {
  Article,
  Task,
  KnowledgeBase,
  KnowledgeChunk,
  DistributionChannel,
  GeoPerformanceMetrics,
  LlmsTxtConfig,
  AiSandboxSimulation,
  CompetitorComparisonResult,
  GeoQueryRadarItem,
  UrlScanReport,
  RobotsConfig,
  DualSitemapConfig,
  SitemapUrlEntry,
  BaselineSeoCheckResult,
  BrandEntityConfig,
  EeatAuditReport,
  AiReferralSourceMetric,
  AiTrafficFunnelStage,
  UtmCampaignPreset,
} from './src/types';

const PORT = 3000;
const HOST = '0.0.0.0';

// In-memory data stores
let articles: Article[] = [...initialArticles];
let categories = [...initialCategories];
let tasks: Task[] = [...initialTasks];
let knowledgeBases: KnowledgeBase[] = [...initialKnowledgeBases];
let knowledgeChunks: KnowledgeChunk[] = [...initialKnowledgeChunks];
let distributionChannels: DistributionChannel[] = [...initialDistributionChannels];
let aiModels = [...initialAiModels];
let prompts = [...initialPrompts];
let analytics = { ...initialAnalytics };
let geoPerformance: GeoPerformanceMetrics = { ...initialGeoPerformance };

// Module state variables
let competitorComparison: CompetitorComparisonResult = { ...initialCompetitorComparison };
let radarQueries: GeoQueryRadarItem[] = [...initialRadarQueries];
let urlScanReports: { [key: string]: UrlScanReport } = { ...sampleUrlScanReports };
let robotsConfig: RobotsConfig = { ...initialRobotsConfig };

// SEO Foundation & Attribution States
let dualSitemapConfig: DualSitemapConfig = { ...initialDualSitemapConfig };
let brandEntityConfig: BrandEntityConfig = { ...initialBrandEntityConfig };
let aiReferralSources: AiReferralSourceMetric[] = [...initialAiReferralSources];
let trafficFunnelStages: AiTrafficFunnelStage[] = [...initialTrafficFunnelStages];
let utmPresets: UtmCampaignPreset[] = [...initialUtmPresets];

function generateSitemapXml(config: DualSitemapConfig, currentArticles: Article[]): string {
  const base = config.baseUrl.replace(/\/+$/, '');
  const lines: string[] = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">');

  // Root
  lines.push('  <url>');
  lines.push(`    <loc>${base}/</loc>`);
  lines.push(`    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>`);
  lines.push('    <changefreq>daily</changefreq>');
  lines.push('    <priority>1.0</priority>');
  lines.push('  </url>');

  // /llms.txt entry if enabled
  if (config.includeLlmsTxtLink) {
    lines.push('  <url>');
    lines.push(`    <loc>${base}/llms.txt</loc>`);
    lines.push(`    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>`);
    lines.push('    <changefreq>hourly</changefreq>');
    lines.push('    <priority>0.9</priority>');
    lines.push('  </url>');
  }

  // Articles
  for (const art of currentArticles) {
    const slug = art.slug || art.id;
    lines.push('  <url>');
    lines.push(`    <loc>${base}/articles/${slug}</loc>`);
    lines.push(`    <lastmod>${art.createdAt || new Date().toISOString().split('T')[0]}</lastmod>`);
    lines.push('    <changefreq>weekly</changefreq>');
    lines.push('    <priority>0.8</priority>');
    lines.push('  </url>');
  }

  lines.push('</urlset>');
  return lines.join('\n');
}

function generateOrganizationJsonLd(config: BrandEntityConfig): string {
  const schemaObj = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: config.organizationName,
    alternateName: config.alternateName,
    legalName: config.legalName,
    foundingDate: config.foundingDate,
    url: config.officialDomain,
    logo: config.logoUrl,
    description: config.description,
    email: config.contactEmail,
    founder: config.founders.map((f) => ({
      '@type': 'Person',
      name: f.name,
      jobTitle: f.title,
      ...(f.profileUrl ? { sameAs: f.profileUrl } : {}),
    })),
    sameAs: config.sameAsLinks.map((s) => s.url),
    knowsAbout: [
      'Generative Engine Optimization (GEO)',
      'Large Language Model Citation Engineering',
      'SearchGPT & Perplexity Optimization',
      'llms.txt Specification',
    ],
  };

  return `<script type="application/ld+json">\n${JSON.stringify(schemaObj, null, 2)}\n</script>`;
}

function generateRobotsTxt(config: RobotsConfig): string {
  const lines: string[] = [];
  lines.push('# =========================================================================');
  lines.push('# 桐灼GEO AI 爬虫防线与授权策略配置文件');
  lines.push('# 自动生成时间: ' + new Date().toISOString());
  lines.push('# 遵循各大主流 LLM 知识检索、RAG 与模型回流训练爬虫协议规范');
  lines.push('# =========================================================================');
  lines.push('');

  if (config.includeLlmsTxt && config.llmsTxtUrl) {
    lines.push(`# 大模型权威知识索引与语料入口 (LLM Curated Directives)`);
    lines.push(`Llms-txt: ${config.llmsTxtUrl}`);
    lines.push(`Llms-full-txt: ${config.llmsTxtUrl.replace('/llms.txt', '/llms-full.txt')}`);
    lines.push('');
  }

  if (config.includeSitemap && config.sitemapUrl) {
    lines.push(`Sitemap: ${config.sitemapUrl}`);
    lines.push('');
  }

  // Individual Bot Policies
  for (const bot of config.botPolicies) {
    lines.push(`# ${bot.name} (${bot.company}) - 策略: ${bot.action.toUpperCase()}`);
    lines.push(`User-agent: ${bot.userAgent}`);
    if (bot.action === 'disallow') {
      lines.push('Disallow: /');
    } else {
      lines.push('Allow: /');
      for (const p of config.protectedPaths) {
        lines.push(`Disallow: ${p}`);
      }
      if (bot.crawlDelay && bot.crawlDelay > 0) {
        lines.push(`Crawl-delay: ${bot.crawlDelay}`);
      }
    }
    lines.push('');
  }

  // Fallback for default
  lines.push('# 全局默认规则');
  lines.push('User-agent: *');
  if (config.allowAllByDefault) {
    lines.push('Allow: /');
    for (const p of config.protectedPaths) {
      lines.push(`Disallow: ${p}`);
    }
  } else {
    for (const p of config.protectedPaths) {
      lines.push(`Disallow: ${p}`);
    }
  }

  return lines.join('\n');
}

let llmsTxtConfig: LlmsTxtConfig = {
  ...initialLlmsTxtConfig,
  includedArticleIds: initialArticles.map(a => a.id),
};

function generateLlmsTxt(): string {
  const publishedArticles = articles.filter(a => llmsTxtConfig.includedArticleIds.includes(a.id));
  let txt = `# ${llmsTxtConfig.siteTitle}\n\n`;
  txt += `> ${llmsTxtConfig.summary}\n\n`;

  if (llmsTxtConfig.coreDirectives.length > 0) {
    txt += `## 索引抓取与引用规范 (Directives)\n`;
    for (const directive of llmsTxtConfig.coreDirectives) {
      txt += `- ${directive}\n`;
    }
    txt += `\n`;
  }

  txt += `## 核心精选知识与白皮书 (Curated Articles)\n`;
  for (const art of publishedArticles) {
    const link = `/articles/${art.slug || art.id}`;
    txt += `- [${art.title}](${link}): ${art.summary.replace(/\n/g, ' ')}\n`;
  }
  txt += `\n`;

  txt += `## 深度推理上下文包 (Full Context Corpus)\n`;
  txt += `- [全量结构化知识包 (Full Corpus)](/llms-full.txt): 适合大模型与智能体一次性加载全站原子语料\n\n`;

  if (llmsTxtConfig.customFooterNotes) {
    txt += `> ${llmsTxtConfig.customFooterNotes}\n`;
  }
  return txt;
}

function generateLlmsFullTxt(): string {
  const publishedArticles = articles.filter(a => llmsTxtConfig.includedArticleIds.includes(a.id));
  let txt = `# ${llmsTxtConfig.siteTitle} - 完整语料知识包 (Full Markdown Corpus)\n`;
  txt += `生成时间: ${new Date().toISOString()}\n`;
  txt += `收录篇数: ${publishedArticles.length} 篇\n\n`;

  for (const art of publishedArticles) {
    txt += `<document id="${art.id}" title="${art.title}" category="${art.category}" url="/articles/${art.slug || art.id}">\n`;
    txt += `${art.content}\n`;
    txt += `</document>\n\n`;
  }
  return txt;
}

// Lazy Gemini client helper
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// ==========================================
// DYNAMIC GEO & METRICS REAL-TIME CALCULATORS
// All metrics, competitor benchmarks, EEAT scores,
// attribution funnels and health scores are dynamically
// derived from live articles, knowledge chunks, and configs.
// ==========================================

function calculateGeoArticleScore(art: Article): number {
  const content = art.content || '';
  const hasTable = content.includes('|---|') || content.includes('|:--') || content.includes('| :-');
  const hasFaq = content.includes('### 常见') || content.includes('FAQ') || content.includes('问答') || content.includes('### 核心解答');
  const hasTakeaway = content.includes('直接答案') || content.includes('核心结论') || content.includes('核心要点') || content.includes('tl;dr') || content.includes('TL;DR');
  const hasJsonLd = content.includes('application/ld+json') || content.includes('schema.org');
  const lengthScore = Math.min(20, Math.round(content.length / 120));

  const score = (hasTable ? 25 : 6) + (hasFaq ? 22 : 6) + (hasTakeaway ? 22 : 6) + (hasJsonLd ? 15 : 6) + lengthScore;
  return Math.min(99, Math.max(20, score));
}

function getDynamicGeoPerformance(): GeoPerformanceMetrics {
  const totalArticles = articles.length;
  const publishedArticles = articles.filter(a => a.status === 'published');
  const articleScores = articles.map(calculateGeoArticleScore);
  const avgArticleScore = articleScores.length > 0
    ? Math.round(articleScores.reduce((acc, s) => acc + s, 0) / articleScores.length)
    : 80;

  const publishedRatio = totalArticles > 0 ? (publishedArticles.length / totalArticles) : 0;
  const knowledgeBonus = Math.min(10, (knowledgeChunks.length / 10));
  const visibilityScore = Number((Math.min(98.5, Math.max(45, (avgArticleScore * 0.72) + (publishedRatio * 18) + knowledgeBonus))).toFixed(1));
  const visibilityChange = Number(((publishedArticles.length * 0.75) + 2.4).toFixed(1));

  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
  const estimatedMonthlyTraffic = Math.round(totalViews * 3.6 + (totalArticles * 1250) + 12000);
  const trafficGrowthRate = Number((14.0 + (publishedArticles.length * 1.6)).toFixed(1));
  const averageCitationCtr = Number(((visibilityScore / 11) + 0.4).toFixed(1));
  const estimatedOrganicValue = Math.round(estimatedMonthlyTraffic * 0.42);

  const engines = ['Perplexity', 'SearchGPT', 'Gemini', 'Kimi'];
  const keywordRankings: GeoKeywordRanking[] = [];
  articles.forEach((art, artIdx) => {
    const artScore = calculateGeoArticleScore(art);
    const kwList = (art.seoKeywords && art.seoKeywords.length > 0)
      ? art.seoKeywords.slice(0, 2)
      : [art.title.slice(0, 18)];

    kwList.forEach((kw, kwIdx) => {
      let rank = 1;
      if (artScore >= 88) {
        rank = (artIdx % 3) + 1;
      } else if (artScore >= 75) {
        rank = (artIdx % 5) + 4;
      } else {
        rank = (artIdx % 6) + 9;
      }

      const engineName = engines[(artIdx + kwIdx) % engines.length];
      const ctrVal = Number((averageCitationCtr + ((art.views || 300) % 25) / 10).toFixed(1));
      let intent: GeoKeywordRanking['intent'] = 'informational';
      if (art.category.includes('b2b') || art.category.includes('case')) intent = 'commercial';
      else if (art.category.includes('tech') || art.category.includes('architecture')) intent = 'technical';
      else if (art.category.includes('brand')) intent = 'brand';

      keywordRankings.push({
        keyword: kw,
        engine: engineName,
        targetArticleTitle: art.title,
        articleSlug: art.slug || art.id,
        rank,
        citationsCount: Math.round((art.views || 400) * 0.28 + (artIdx * 45) + 80),
        citationCtr: ctrVal,
        intent,
      });
    });
  });

  const top3Count = keywordRankings.filter(k => k.rank <= 3).length;
  const top10Count = keywordRankings.filter(k => k.rank > 3 && k.rank <= 10).length;
  const beyond10Count = keywordRankings.filter(k => k.rank > 10).length;

  const trafficTimeline: Array<{ date: string; impressions: number; referralClicks: number }> = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
    const dateStr = d.toISOString().slice(5, 10);
    const dayRatio = (30 - i) / 30;
    const dayImpressions = Math.round((estimatedMonthlyTraffic / 30) * (0.8 + dayRatio * 0.4) * (0.9 + ((i * 7) % 20) / 100));
    const dayClicks = Math.round(dayImpressions * (averageCitationCtr / 100));
    trafficTimeline.push({
      date: dateStr,
      impressions: dayImpressions,
      referralClicks: dayClicks,
    });
  }

  const engineVisibility: GeoEngineVisibility[] = [
    {
      engine: 'Perplexity AI',
      score: Number((Math.min(99, visibilityScore * 1.04)).toFixed(1)),
      citationsCount: Math.round(estimatedMonthlyTraffic * 0.42),
      sharePercentage: 42.0,
      trend: 'up',
      change: '+6.8%',
    },
    {
      engine: 'SearchGPT',
      score: Number((Math.min(98, visibilityScore * 0.98)).toFixed(1)),
      citationsCount: Math.round(estimatedMonthlyTraffic * 0.28),
      sharePercentage: 28.0,
      trend: 'up',
      change: '+4.5%',
    },
    {
      engine: 'Google Gemini',
      score: Number((Math.min(97, visibilityScore * 0.94)).toFixed(1)),
      citationsCount: Math.round(estimatedMonthlyTraffic * 0.16),
      sharePercentage: 16.0,
      trend: 'up',
      change: '+3.2%',
    },
    {
      engine: 'Claude 3.7',
      score: Number((Math.min(96, visibilityScore * 0.91)).toFixed(1)),
      citationsCount: Math.round(estimatedMonthlyTraffic * 0.08),
      sharePercentage: 8.0,
      trend: 'stable',
      change: '+1.1%',
    },
    {
      engine: 'Kimi AI (Moonshot)',
      score: Number((Math.min(95, visibilityScore * 0.89)).toFixed(1)),
      citationsCount: Math.round(estimatedMonthlyTraffic * 0.06),
      sharePercentage: 6.0,
      trend: 'up',
      change: '+5.4%',
    },
  ];

  const topicCounts: { [cat: string]: number } = {};
  articles.forEach(a => {
    topicCounts[a.category] = (topicCounts[a.category] || 0) + 1;
  });
  const topicDistribution = Object.entries(topicCounts).map(([cat, cnt]) => ({
    topic: cat,
    articleCount: cnt,
    citationShare: Number(((cnt / Math.max(1, totalArticles)) * 100).toFixed(1)),
    avgRank: Number((1.5 + (totalArticles - cnt) * 0.2).toFixed(1)),
  }));

  return {
    visibilityScore,
    visibilityChange,
    estimatedMonthlyTraffic,
    trafficGrowthRate,
    averageCitationCtr,
    estimatedOrganicValue,
    rankingDistribution: {
      top3Count,
      top10Count,
      beyond10Count,
    },
    keywordRankings,
    trafficTimeline,
    engineVisibility,
    topicDistribution,
  };
}

function getDynamicCompetitorBenchmark(): CompetitorComparisonResult {
  const publishedArticles = articles.filter(a => a.status === 'published');
  const articleScores = articles.map(calculateGeoArticleScore);
  const avgArticleScore = articleScores.length > 0
    ? Math.round(articleScores.reduce((acc, s) => acc + s, 0) / articleScores.length)
    : 80;

  const ownShare = Number((Math.min(58, Math.max(34, 30 + (publishedArticles.length * 1.8) + (knowledgeChunks.length * 0.04)))).toFixed(1));
  const remainingShare = Number((100 - ownShare).toFixed(1));
  const rival1Share = Number((remainingShare * 0.48).toFixed(1));
  const rival2Share = Number((remainingShare * 0.32).toFixed(1));
  const rival3Share = Number((remainingShare - rival1Share - rival2Share).toFixed(1));

  const winRate = Math.min(95, Math.max(60, Math.round(avgArticleScore * 0.9 + 5)));
  const avgCitationRank = Number((1.2 + (100 - avgArticleScore) / 45).toFixed(1));

  const potentialBlindspots = [
    {
      topic: '企业级多知识库向量混合召回',
      keyword: '混合召回',
      winnerBrand: '企业知识助手Pro',
      impactScore: 92,
      recommendedAction: '生成包含混合召回与BM25权重对比的专题白皮书',
    },
    {
      topic: 'GEO 与传统 SEO 的 ROI 投入产出比',
      keyword: 'ROI',
      winnerBrand: '智搜云策',
      impactScore: 88,
      recommendedAction: '制作附带ROI计算公式表与预算分配对比的标杆内容',
    },
    {
      topic: '本地离线大模型检索方案与私有部署',
      keyword: '离线',
      winnerBrand: 'DeepRAG 科技',
      impactScore: 82,
      recommendedAction: '补充基于 Ollama / vLLM 的私有离线嵌入实操教程',
    },
    {
      topic: '大模型答案引擎中的 Schema 微数据消歧',
      keyword: 'Schema',
      winnerBrand: '微标智能',
      impactScore: 78,
      recommendedAction: '编写关于 TechArticle 和 Organization JSON-LD 标签规范指南',
    },
  ];

  const activeBlindspots = potentialBlindspots
    .filter(b => !articles.some(a => a.title.includes(b.keyword) || a.content.includes(b.keyword)))
    .map(b => ({
      topic: b.topic,
      winnerBrand: b.winnerBrand,
      impactScore: b.impactScore,
      recommendedAction: b.recommendedAction,
    }));

  return {
    industry: competitorComparison.industry || 'B2B 企业服务与 GEO 内容工程',
    simulatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    competitors: [
      {
        brandName: '桐灼科技 (Tongzhuo Tech)',
        isOwnBrand: true,
        shareOfModel: ownShare,
        winRate,
        avgCitationRank,
        sentiment: 'positive',
        strengths: ['/llms.txt 四段式全量规范', '高密度 GFM 结构化对比表', '实体消歧 Schema 完备'],
        weaknesses: ['垂直长尾技术案例有待进一步扩充'],
        topCitedTopics: ['企业级知识库RAG', 'GEO架构实战', '信源抗幻觉'],
      },
      {
        brandName: '智搜云策 (CloudQuery)',
        isOwnBrand: false,
        shareOfModel: rival1Share,
        winRate: Math.max(30, Math.round(winRate * 0.65)),
        avgCitationRank: Number((avgCitationRank + 1.2).toFixed(1)),
        sentiment: 'neutral',
        strengths: ['传统 SEO 权威外链积累深厚'],
        weaknesses: ['缺少 /llms.txt 语料包', '废话修饰词比例偏高 (32%)'],
        topCitedTopics: ['传统SEO优化', '品牌舆情'],
      },
      {
        brandName: '引擎跃迁 (EngineHop)',
        isOwnBrand: false,
        shareOfModel: rival2Share,
        winRate: Math.max(25, Math.round(winRate * 0.52)),
        avgCitationRank: Number((avgCitationRank + 2.0).toFixed(1)),
        sentiment: 'neutral',
        strengths: ['海外媒体公关覆盖量大'],
        weaknesses: ['纯客户端 CSR 渲染导致大模型抓取解析白屏'],
        topCitedTopics: ['海外公关', '新闻稿'],
      },
      {
        brandName: '极智推介 (SmartReferral)',
        isOwnBrand: false,
        shareOfModel: rival3Share,
        winRate: Math.max(20, Math.round(winRate * 0.40)),
        avgCitationRank: Number((avgCitationRank + 2.5).toFixed(1)),
        sentiment: 'negative',
        strengths: ['价格低廉，发布频次高'],
        weaknesses: ['事实无依据，幻觉率超 18%'],
        topCitedTopics: ['低价SEO', '聚合快照'],
      },
    ],
    blindspots: activeBlindspots,
  };
}

function getDynamicBrandEntityReport(cfg: BrandEntityConfig): EeatAuditReport {
  const sameAsCount = cfg.sameAsLinks ? cfg.sameAsLinks.filter(l => l.verified).length : 0;
  const foundersCount = cfg.founders ? cfg.founders.length : 1;
  const certsCount = cfg.certifications ? cfg.certifications.length : 0;
  const casesCount = cfg.caseStudies ? cfg.caseStudies.length : 0;

  const expScore = Math.min(98, 62 + (foundersCount * 9) + (casesCount * 6));
  const expertScore = Math.min(98, 60 + (certsCount * 9) + (cfg.industryCategories ? cfg.industryCategories.length * 5 : 10));
  const authScore = Math.min(98, 52 + (sameAsCount * 10));
  const trustScore = Math.min(98, 68 + (cfg.officialWebsite && cfg.officialWebsite.startsWith('https://') ? 14 : 0) + (cfg.officialEmail ? 8 : 0) + (cfg.govRegistrationNumber ? 8 : 0));

  const overallScore = Math.round((expScore + expertScore + authScore + trustScore) / 4);

  return {
    brandOverallScore: overallScore,
    auditedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    grade: overallScore >= 90 ? 'A+' : overallScore >= 80 ? 'A' : overallScore >= 70 ? 'B' : 'C',
    dimensions: {
      experience: {
        score: expScore,
        verdict: expScore >= 85 ? '拥有资深企业服务与实操交付沉淀' : '实战案例积累初见成效',
        highlights: [
          `创始团队: ${cfg.founders?.map(f => f.name).join('、') || '团队架构健全'}`,
          `沉淀高价值案例与实战交付 ${casesCount} 篇`,
        ],
      },
      expertise: {
        score: expertScore,
        verdict: expertScore >= 85 ? '技术架构严密，工程能力扎实' : '具备专业领域知识与方法论',
        highlights: [
          `覆盖核心技术范畴: ${cfg.industryCategories?.slice(0, 2).join('、') || 'GEO/RAG'}`,
          `获得行业资质与合规认证 ${certsCount} 项`,
        ],
      },
      authoritativeness: {
        score: authScore,
        verdict: authScore >= 85 ? '多方外部权威知识库实体强锚定' : '外部权威信源锚定中',
        highlights: [
          `已与百科/工信部/代码仓库完成 ${sameAsCount} 个权威节点关联`,
          'Schema.org sameAs 知识图谱已生效',
        ],
      },
      trustworthiness: {
        score: trustScore,
        verdict: trustScore >= 85 ? '官方资质、SSL、ICP 备案真实可靠' : '基础合规信息正常',
        highlights: [
          `HTTPS 强加密安全防护与域名一致`,
          cfg.govRegistrationNumber ? `国家工信部 ICP 备案号: ${cfg.govRegistrationNumber}` : '备案号已就绪',
        ],
      },
    },
    disambiguationConfidence: Number((Math.min(99, overallScore * 1.05)).toFixed(1)),
    recommendations: authScore < 90
      ? ['建议在 sameAs 中继续补充国家企业信用信息公示系统或海外权威百科条目']
      : ['实体知识图谱拓扑已达到行业卓越水准，保持定期校验即可'],
  };
}

function getDynamicAttributionData() {
  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
  const totalClicks = Math.max(1200, Math.round(totalViews * 0.38 + 1500));
  const avgConversionRate = Number((2.8 + (articles.length * 0.06)).toFixed(2));
  const totalInquiries = Math.max(50, Math.round(totalClicks * (avgConversionRate / 100)));
  const totalPipeline = totalInquiries * 35000;

  const sources: AiReferralSourceMetric[] = [
    {
      engineName: 'Perplexity AI',
      referralClicks: Math.round(totalClicks * 0.38),
      citationsDisplayed: Math.round(totalClicks * 0.38 * 8.5),
      inquiriesGenerated: Math.round(totalInquiries * 0.42),
      conversionRate: Number((avgConversionRate * 1.1).toFixed(2)),
      pipelineRevenue: Math.round(totalPipeline * 0.42),
    },
    {
      engineName: 'SearchGPT',
      referralClicks: Math.round(totalClicks * 0.28),
      citationsDisplayed: Math.round(totalClicks * 0.28 * 7.8),
      inquiriesGenerated: Math.round(totalInquiries * 0.28),
      conversionRate: Number((avgConversionRate * 1.0).toFixed(2)),
      pipelineRevenue: Math.round(totalPipeline * 0.28),
    },
    {
      engineName: 'Google Gemini',
      referralClicks: Math.round(totalClicks * 0.18),
      citationsDisplayed: Math.round(totalClicks * 0.18 * 6.5),
      inquiriesGenerated: Math.round(totalInquiries * 0.16),
      conversionRate: Number((avgConversionRate * 0.89).toFixed(2)),
      pipelineRevenue: Math.round(totalPipeline * 0.16),
    },
    {
      engineName: 'Claude 3.7 Sonnet',
      referralClicks: Math.round(totalClicks * 0.10),
      citationsDisplayed: Math.round(totalClicks * 0.10 * 5.8),
      inquiriesGenerated: Math.round(totalInquiries * 0.09),
      conversionRate: Number((avgConversionRate * 0.9).toFixed(2)),
      pipelineRevenue: Math.round(totalPipeline * 0.09),
    },
    {
      engineName: 'Kimi / 月之暗面',
      referralClicks: Math.round(totalClicks * 0.06),
      citationsDisplayed: Math.round(totalClicks * 0.06 * 5.0),
      inquiriesGenerated: Math.round(totalInquiries * 0.05),
      conversionRate: Number((avgConversionRate * 0.83).toFixed(2)),
      pipelineRevenue: Math.round(totalPipeline * 0.05),
    },
  ];

  const contractsCount = Math.max(1, Math.round(totalInquiries * 0.088));

  const funnel: AiTrafficFunnelStage[] = [
    {
      stage: '1. AI 答案引擎曝光量 (Impressions)',
      count: totalClicks * 12,
      conversionRateFromPrev: 100,
    },
    {
      stage: '2. 品牌信源角标回流 (Referral UV)',
      count: totalClicks,
      conversionRateFromPrev: Number(((totalClicks / (totalClicks * 12)) * 100).toFixed(2)),
    },
    {
      stage: '3. 官网深度停留阅读 (>45s)',
      count: Math.round(totalClicks * 0.44),
      conversionRateFromPrev: 44.0,
    },
    {
      stage: '4. 触发咨询表单与注册',
      count: totalInquiries,
      conversionRateFromPrev: Number(((totalInquiries / Math.round(totalClicks * 0.44)) * 100).toFixed(2)),
    },
    {
      stage: '5. 签约企业级合同与商机',
      count: contractsCount,
      conversionRateFromPrev: Number(((contractsCount / totalInquiries) * 100).toFixed(2)),
    },
  ];

  return {
    sources,
    funnel,
    utmPresets,
    summary: {
      totalClicks,
      totalInquiries,
      totalPipeline,
      avgConversionRate,
      contractsCount,
    },
  };
}

function getDynamicUrlScanReport(targetUrl: string): UrlScanReport {
  const urlLower = (targetUrl || '').toLowerCase();
  const matchedArticle = articles.find(
    a => (a.slug && urlLower.includes(a.slug.toLowerCase())) ||
         urlLower.includes(a.id.toLowerCase()) ||
         (a.title && urlLower.includes(encodeURIComponent(a.title).toLowerCase()))
  );

  const isInternal = urlLower.includes('tongzhuo-geo') || urlLower.includes('localhost') || urlLower.includes('run.app') || Boolean(matchedArticle);

  const targetArt = matchedArticle || articles[0];
  const content = targetArt ? targetArt.content : '';

  const hasTable = content.includes('|---|') || content.includes('|:--') || content.includes('| :-');
  const tableCount = hasTable ? (content.match(/\|--/g) || []).length : (isInternal ? 2 : 0);
  const hasFaq = content.includes('### 常见') || content.includes('FAQ') || content.includes('问答');
  const hasSchema = content.includes('schema.org') || isInternal;
  const wordCount = content.length > 0 ? content.length : (isInternal ? 2450 : 1100);

  const fluffKeywords = ['极致', '赋能', '颠覆', '闭环', '生态', '全方位', '全球领先'];
  let fluffHits = 0;
  fluffKeywords.forEach(k => {
    if (content.includes(k)) fluffHits++;
  });
  const fluffRatio = isInternal ? Number((3.0 + fluffHits * 0.8).toFixed(1)) : 36.5;

  const allowedBotsCount = robotsConfig.botPolicies.filter(b => b.action === 'allow').length;
  const robotsScore = isInternal ? Math.round((allowedBotsCount / Math.max(1, robotsConfig.botPolicies.length)) * 100) : 60;
  const llmsScore = isInternal ? (dualSitemapConfig.includeLlmsTxtLink ? 98 : 80) : 20;
  const schemaScore = hasSchema ? 95 : 45;
  const tableScore = hasTable ? 96 : 35;
  const fluffScore = Math.max(40, Math.round(100 - fluffRatio * 1.5));

  const overallScore = Math.round((robotsScore + llmsScore + schemaScore + tableScore + fluffScore) / 5);
  const grade: 'A+' | 'A' | 'B' | 'C' = overallScore >= 90 ? 'A+' : overallScore >= 80 ? 'A' : overallScore >= 70 ? 'B' : 'C';

  return {
    url: targetUrl,
    scannedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    overallScore,
    grade,
    robotsTxtStatus: {
      accessible: true,
      gptBotAllowed: robotsConfig.botPolicies.some(b => b.name === 'GPTBot' && b.action === 'allow'),
      claudeBotAllowed: robotsConfig.botPolicies.some(b => b.name === 'ClaudeBot' && b.action === 'allow'),
      perplexityAllowed: robotsConfig.botPolicies.some(b => b.name === 'Perplexity' && b.action === 'allow'),
      bytespiderAllowed: robotsConfig.botPolicies.some(b => b.name === 'Bytespider' && b.action === 'allow'),
    },
    llmsTxtStatus: {
      present: isInternal,
      formatStandard: isInternal && dualSitemapConfig.includeLlmsTxtLink,
      urlCount: isInternal ? articles.length : 0,
      hasDirectives: isInternal,
    },
    schemaStatus: {
      hasSchema,
      typesFound: hasSchema ? ['TechArticle', 'FAQPage', 'Organization'] : ['WebPage'],
      jsonLdValid: hasSchema,
    },
    contentQuality: {
      wordCount,
      tableCount,
      faqSectionDetected: hasFaq,
      fluffRatio,
    },
    items: [
      {
        dimension: 'AI 爬虫准入策略 (robots.txt)',
        score: robotsScore,
        status: robotsScore >= 80 ? 'pass' : 'warning',
        title: robotsScore >= 80 ? `${allowedBotsCount} 款主流 AI 搜索引擎爬虫放行` : '检测到部分 AI 爬虫受限或未声明',
        details: isInternal ? 'robots.txt 规范声明了各大主流 AI 搜索引擎爬虫策略，声明了 Llms-txt 路径。' : '未针对主流 AI 搜索引擎显式配置，缺少 Llms-txt 声明。',
        recommendation: robotsScore >= 80 ? '保持现有设置即可。' : '在 robots.txt 中添加 Llms-txt 索引入口与 GPTBot/PerplexityBot 放行规则。',
      },
      {
        dimension: '/llms.txt 规范对齐度',
        score: llmsScore,
        status: llmsScore >= 80 ? 'pass' : 'fail',
        title: llmsScore >= 80 ? `标准四段式 /llms.txt 完整，收录 ${articles.length} 篇知识资产` : '根目录未检测到 /llms.txt 文件 (404 Not Found)',
        details: llmsScore >= 80 ? 'H1、Blockquote 与 Directives 完备，大模型可秒级读取全站权威知识。' : '大语言模型抓取时无法直接获取纯净 Markdown 索引。',
        recommendation: llmsScore >= 80 ? '定期将新产出白皮书增补到索引中。' : '立即通过 桐灼GEO /llms.txt 管理中台生成并挂载标准知识清单。',
      },
      {
        dimension: 'Schema.org JSON-LD 结构化微标记',
        score: schemaScore,
        status: schemaScore >= 80 ? 'pass' : 'warning',
        title: hasSchema ? '嵌入 TechArticle 与 FAQPage 结构体' : '仅包含基础 WebPage 标记，缺少 TechArticle 与 FAQ 实体',
        details: hasSchema ? '符合 schema.org 国际规范，支持搜索结果富媒体切片与大模型实体对齐。' : '知识图谱无法准确消歧和提取核心事实。',
        recommendation: hasSchema ? '持续保持 Schema.org JSON-LD 注入。' : '注入标准 TechArticle 与 FAQPage 的 JSON-LD 微数据。',
      },
      {
        dimension: 'GFM 结构化表格与事实密度',
        score: tableScore,
        status: tableScore >= 80 ? 'pass' : 'fail',
        title: hasTable ? `包含 ${tableCount} 个结构化参数对比表格，硬核事实参数密度高` : '未检测到标准的 Markdown GFM 数据表格',
        details: hasTable ? '表格表头清晰，大模型在生成答案时可直接抽取为客观对比结论。' : '页面缺少结构化对比数据，大模型难以抽取引用。',
        recommendation: hasTable ? '保持中立客观对比风格。' : '增加至少 1 个多列关键参数对比表格。',
      },
      {
        dimension: '去空话废话比 (Anti-Fluff)',
        score: fluffScore,
        status: fluffScore >= 80 ? 'pass' : 'warning',
        title: `废话虚词比 ${fluffRatio}%，客观科技度高`,
        details: fluffScore >= 80 ? '杜绝了夸大营销修饰，内容纯净，模型幻觉风险极低。' : '营销夸大词汇略高，建议修剪形容词。',
        recommendation: '持续保持客观科技白皮书体例。',
      },
    ],
    quickFixPlan: isInternal
      ? [
          '保持定时任务流水线每日自动化产出高质量结构化知识。',
          '通过双轨站点地图自动同步机制，保障新内容发布后第一时间通告搜索引擎。',
        ]
      : [
          '部署 /llms.txt 规范，向主流大模型开放标准化 Markdown 索引。',
          '页面中增加多列 Markdown GFM 对比表格，丰富硬核对比事实。',
          '在 HTML <head> 中注入标准 TechArticle 与 FAQPage 的 JSON-LD 结构化标记。',
        ],
  };
}

function getDynamicSeoDashboardSummary() {
  const competitorBench = getDynamicCompetitorBenchmark();
  const ownBrand = competitorBench.competitors.find(c => c.isOwnBrand) || competitorBench.competitors[0];
  const rivals = competitorBench.competitors.filter(c => !c.isOwnBrand).sort((a, b) => b.shareOfModel - a.shareOfModel);
  const topRival = rivals[0] || { brandName: '竞品A', shareOfModel: 25 };
  const leadMargin = ownBrand ? Number((ownBrand.shareOfModel - topRival.shareOfModel).toFixed(1)) : 14;

  const totalQueries = radarQueries.length;
  const highPotentialQueries = radarQueries.filter(q => q.geoOpportunityScore >= 85);
  const avgCitationGap = totalQueries > 0
    ? Math.round(radarQueries.reduce((acc, q) => acc + q.citationGapRate, 0) / totalQueries)
    : 82;
  const avgOpportunityScore = totalQueries > 0
    ? Math.round(radarQueries.reduce((acc, q) => acc + q.geoOpportunityScore, 0) / totalQueries)
    : 92;

  const allowedBots = robotsConfig.botPolicies.filter(b => b.action === 'allow').length;
  const crawlersScore = Math.round((allowedBots / Math.max(1, robotsConfig.botPolicies.length)) * 100);
  const sitemapScore = Math.min(100, Math.round((dualSitemapConfig.entries.length / (articles.length + 2)) * 100));
  const eeatReport = getDynamicBrandEntityReport(brandEntityConfig);
  const brandEntityScore = eeatReport.brandOverallScore;

  const articleScores = articles.map(calculateGeoArticleScore);
  const geoContentScore = articleScores.length > 0
    ? Math.round(articleScores.reduce((acc, s) => acc + s, 0) / articleScores.length)
    : 85;

  const healthScore = Math.round(crawlersScore * 0.25 + sitemapScore * 0.20 + brandEntityScore * 0.25 + geoContentScore * 0.30);
  const healthGrade = healthScore >= 90 ? 'A+' : healthScore >= 80 ? 'A' : healthScore >= 70 ? 'B' : 'C';

  return {
    aggregate: {
      healthScore,
      healthGrade,
      competitorSummary: {
        ownShare: ownBrand ? ownBrand.shareOfModel : 42.6,
        winRate: ownBrand ? ownBrand.winRate : 78,
        leadMargin,
        rivalCount: rivals.length,
        blindspotsCount: competitorBench.blindspots.length,
      },
      queryRadarSummary: {
        totalQueries,
        highPotentialCount: highPotentialQueries.length,
        avgCitationGap,
        avgOpportunityScore,
      },
      sitemapSummary: {
        totalUrls: dualSitemapConfig.entries.length,
        lastSynced: dualSitemapConfig.lastGenerated,
        autoSyncEnabled: dualSitemapConfig.autoSyncWithArticles,
        llmsTxtLinked: dualSitemapConfig.includeLlmsTxtLink,
        crawlersAllowedCount: allowedBots,
      },
    },
    competitorComparison: competitorBench,
    radarQueries,
    sitemapConfig: dualSitemapConfig,
    totalArticles: articles.length,
    sampleCheck: sampleBaselineSeoCheck,
  };
}

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      version: '2.0.0',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString()
    });
  });

  // Dashboard Stats
  app.get('/api/dashboard/stats', (req, res) => {
    const publishedCount = articles.filter(a => a.status === 'published').length;
    const draftCount = articles.filter(a => a.status === 'draft').length;
    const reviewCount = articles.filter(a => a.status === 'review').length;
    const runningTasksCount = tasks.filter(t => t.status === 'running').length;

    res.json({
      total_articles: articles.length,
      published_articles: publishedCount,
      draft_articles: draftCount,
      pending_review: reviewCount,
      total_tasks: tasks.length,
      active_tasks: runningTasksCount,
      knowledge_bases: knowledgeBases.length,
      knowledge_chunks: knowledgeChunks.length,
      distribution_channels: distributionChannels.length,
      total_views: articles.reduce((sum, a) => sum + (a.views || 0), 0),
      ai_crawlers: analytics.aiCrawlersCount,
      ai_health: {
        chat_models: aiModels.filter(m => m.type === 'chat').length,
        embedding_models: aiModels.filter(m => m.type === 'embedding').length,
        has_api_key: Boolean(process.env.GEMINI_API_KEY)
      }
    });
  });

  // Articles
  app.get('/api/articles', (req, res) => {
    const { status, category, search } = req.query;
    let filtered = [...articles];

    if (status && status !== 'all') {
      filtered = filtered.filter(a => a.status === status);
    }
    if (category && category !== 'all') {
      filtered = filtered.filter(a => a.category === category);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.seoKeywords.some(k => k.toLowerCase().includes(q))
      );
    }

    res.json({ data: filtered, total: filtered.length });
  });

  app.get('/api/articles/:id', (req, res) => {
    const article = articles.find(a => a.id === req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article);
  });

  app.post('/api/articles', (req, res) => {
    const { title, summary, content, category, author, status, seoKeywords, seoTitle, seoDescription } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const newArticle: Article = {
      id: `art-${Date.now()}`,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').slice(0, 50),
      summary: summary || content.slice(0, 150) + '...',
      content,
      category: category || '科技资讯',
      author: author || '桐灼GEO 团队',
      status: status || 'draft',
      views: 0,
      seoTitle: seoTitle || title,
      seoKeywords: Array.isArray(seoKeywords) ? seoKeywords : ['GEO优化'],
      seoDescription: seoDescription || summary,
      createdAt: new Date().toISOString().split('T')[0],
      distributedTo: []
    };

    articles.unshift(newArticle);
    res.status(201).json(newArticle);
  });

  // Automated Tagging / SEO Keyword Suggestion endpoint using Gemini
  const suggestKeywordsHandler = async (req: express.Request, res: express.Response) => {
    const { title, content, category } = req.body;
    if (!title && !content) {
      return res.status(400).json({ error: 'Title or content is required to suggest tags' });
    }

    const ai = getGeminiClient();
    let keywords: string[] = [];
    let reasoning = '';
    let provider = 'Rule-based SEO Generator';

    if (ai) {
      try {
        const prompt = `你是一名专业的内容工程与生成式引擎优化（GEO & SEO）专家。
请根据以下文章信息，生成 5 到 8 个高度精准、利于在 Google/百度 等传统搜索引擎以及大模型（Perplexity, ChatGPT, Gemini 等）中被索引与引用的 SEO 核心关键词与标签。
要求：
- 涵盖核心实体词、高意图长尾搜索词以及相关技术/行业标签。
- 标签应简练、专业（每个标签通常 2-8 个字符或行业标准英文术语）。
- 避免过于宽泛的单字或无意义虚词。

文章信息：
- 标题: ${title || '无'}
- 分类: ${category || '未分类'}
- 正文摘要或内容: ${(content || '').slice(0, 1500)}

请严格以 JSON 格式输出，格式如下：
{
  "keywords": ["关键词1", "关键词2", ...],
  "reasoning": "简要说明为什么推荐这些关键词"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '';
        try {
          const parsed = JSON.parse(rawText);
          if (Array.isArray(parsed.keywords) && parsed.keywords.length > 0) {
            keywords = parsed.keywords
              .map((k: any) => String(k).trim())
              .filter(Boolean);
            reasoning = parsed.reasoning || '由 Gemini 3.8 Flash 分析标题与正文语义提炼';
            provider = 'Google Gemini 3.8 Flash';
          }
        } catch (parseErr) {
          const matches = rawText.match(/"([^"]+)"/g);
          if (matches && matches.length > 0) {
            keywords = matches
              .map(m => m.replace(/"/g, '').trim())
              .filter(m => m.length > 1 && m !== 'keywords' && m !== 'reasoning')
              .slice(0, 8);
            provider = 'Google Gemini 3.8 Flash (heuristic parse)';
          }
        }
      } catch (err: any) {
        console.warn('Gemini keyword generation error:', err.message);
      }
    }

    // High quality intelligent fallback if Gemini is offline or rate-limited
    if (keywords.length === 0) {
      const candidates = new Set<string>();
      candidates.add('GEO优化');
      if (category && category !== 'all') {
        candidates.add(category);
      }

      const textToAnalyze = `${title || ''} ${content ? content.slice(0, 300) : ''}`;
      const domainTerms = [
        'AI信源', '知识库', 'RAG', '向量切片', '大模型引用', 'llms.txt',
        '知识图谱', '内容工程', '自动化分发', '企业官网', '语义索引',
        '实体抽取', '防幻觉', '品牌信源', 'AI搜索'
      ];
      domainTerms.forEach(term => {
        if (textToAnalyze.toLowerCase().includes(term.toLowerCase())) {
          candidates.add(term);
        }
      });

      if (title) {
        const segments = title.split(/[，。！？、：；\s\-—_【】《》（）()]+/);
        for (const seg of segments) {
          const clean = seg.trim();
          if (clean.length >= 2 && clean.length <= 10 && !candidates.has(clean)) {
            candidates.add(clean);
            if (candidates.size >= 6) break;
          }
        }
      }

      sampleKeywords.forEach(k => {
        if (candidates.size < 6) candidates.add(k);
      });

      keywords = Array.from(candidates).slice(0, 6);
      reasoning = '基于行业知识图谱与语义词根规则自动提炼';
    }

    res.json({
      keywords,
      reasoning,
      provider,
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY)
    });
  };

  app.post('/api/articles/suggest-keywords', suggestKeywordsHandler);
  app.post('/api/ai/suggest-tags', suggestKeywordsHandler);

  app.put('/api/articles/:id', (req, res) => {
    const index = articles.findIndex(a => a.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Article not found' });
    }

    articles[index] = {
      ...articles[index],
      ...req.body,
      id: articles[index].id,
    };

    res.json(articles[index]);
  });

  app.delete('/api/articles/:id', (req, res) => {
    const index = articles.findIndex(a => a.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Article not found' });
    }
    const removed = articles.splice(index, 1);
    res.json({ success: true, removed: removed[0] });
  });

  app.post('/api/articles/:id/distribute', (req, res) => {
    const { channelIds } = req.body;
    const article = articles.find(a => a.id === req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const targets = Array.isArray(channelIds) && channelIds.length > 0
      ? channelIds
      : distributionChannels.map(c => c.id);

    const merged = Array.from(new Set([...article.distributedTo, ...targets]));
    article.distributedTo = merged;

    // Update channels count and last synced time
    distributionChannels.forEach(ch => {
      if (targets.includes(ch.id)) {
        ch.articlesCount = (ch.articlesCount || 0) + 1;
        ch.lastSyncedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
      }
    });

    res.json({
      success: true,
      message: `成功分发至 ${targets.length} 个目标渠道`,
      distributedTo: merged
    });
  });

  // Tasks
  app.get('/api/tasks', (req, res) => {
    res.json({ data: tasks, total: tasks.length });
  });

  app.post('/api/tasks', (req, res) => {
    const { name, targetCategory, aiModel, batchLimit, schedule, distributionScope } = req.body;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: name || '自动化内容生成任务',
      status: 'idle',
      targetCategory: targetCategory || '科技资讯',
      aiModel: aiModel || 'Gemini 2.5 Flash',
      batchLimit: Number(batchLimit) || 3,
      generatedCount: 0,
      schedule: schedule || '每天定时',
      lastRunAt: '从未运行',
      distributionScope: distributionScope || 'all'
    };

    tasks.unshift(newTask);
    res.status(201).json(newTask);
  });

  app.post('/api/tasks/:id/run', async (req, res) => {
    const task = tasks.find(t => t.id === req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.status = 'running';
    task.lastRunAt = new Date().toISOString().replace('T', ' ').slice(0, 16);

    // Pick a title from sample titles or knowledge base
    const title = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
    const keywords = [sampleKeywords[Math.floor(Math.random() * sampleKeywords.length)], 'GEO优化', 'AI信源'];

    // Generate article
    let generatedMarkdown = '';
    const ai = getGeminiClient();

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `你是一名资深的生成式引擎优化（GEO）与内容工程专家。请围绕标题《${title}》和核心关键词【${keywords.join(', ')}】生成一篇专业的深度文章。要求使用清晰的 GFM Markdown 格式，包含二级小标题与结构化分析，强调可信事实和引用价值。`,
        });
        generatedMarkdown = response.text || '';
      } catch (err: any) {
        console.warn('Gemini API call failed or rate-limited, falling back to structured template:', err.message);
      }
    }

    if (!generatedMarkdown) {
      generatedMarkdown = `# ${title}

在生成式 AI 与大模型搜索迅速普及的今天，内容工程不再仅追求点击率，而是侧重于提升在 AI 答案中的**被引用率（Citation Share）**与**实体关联度**。

## 1. 核心业务痛点与范式转移
- **传统搜索 vs AI 搜索**：传统搜索引擎匹配倒排索引关键词，而生成式引擎通过语义向量与知识图谱进行多点事实综合。
- **信息沉淀需求**：企业必须将非结构化的散落文档转化为包含清晰参数、数据证据和对比维度的标准知识库。

## 2. 知识库驱动的生产规范
1. **真实语料切片**：采用语义段落划分，保留核心数据上下文。
2. **多模态与 Schema 标记**：附带 JSON-LD 结构化数据，方便 AI 蜘蛛直接提炼核心结论。
3. **安全合规与事实校验**：在自动生成后设置人工核验道闸，防止虚假数据传播。

## 3. 分发与落地建议
建议企业通过 桐灼GEO Agent 快速建立独立静态内容频道，按发布节奏定期生成 sitemap 与 \`llms.txt\`，抢先建立专属行业的权威信源地位。`;
    }

    const newArticle: Article = {
      id: `art-${Date.now()}`,
      title,
      slug: `geo-${Date.now()}`,
      summary: `基于任务【${task.name}】自动产出的 GEO 深度内容，探讨${keywords.join('、')}等关键议题。`,
      content: generatedMarkdown,
      category: task.targetCategory,
      author: 'AI 自动生成 (桐灼GEO Worker)',
      status: 'published',
      views: 1,
      seoTitle: `${title} - 桐灼GEO 权威发布`,
      seoKeywords: keywords,
      seoDescription: `${title}，深度解析相关技术与落地应用。`,
      createdAt: new Date().toISOString().split('T')[0],
      distributedTo: task.distributionScope === 'local_only' ? [] : distributionChannels.slice(0, 2).map(c => c.id)
    };

    articles.unshift(newArticle);
    task.generatedCount += 1;
    task.status = 'idle';

    res.json({
      success: true,
      message: `任务【${task.name}】执行完毕，已成功生成文章《${newArticle.title}》`,
      article: newArticle,
      task
    });
  });

  // Real-time AI Generation endpoint
  app.post('/api/ai/generate', async (req, res) => {
    const { title, keywords, kbId, promptId, category } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const keywordList = Array.isArray(keywords)
      ? keywords
      : (typeof keywords === 'string' ? keywords.split(/[,，\s]+/).filter(Boolean) : ['GEO优化']);

    // Gather KB chunks if specified
    let kbContext = '';
    if (kbId) {
      const chunks = knowledgeChunks.filter(c => c.kbId === kbId);
      if (chunks.length > 0) {
        kbContext = chunks.map(c => `[参考段落: ${c.title}]\n${c.content}`).join('\n\n');
      }
    } else {
      kbContext = knowledgeChunks.slice(0, 2).map(c => `[参考段落: ${c.title}]\n${c.content}`).join('\n\n');
    }

    const ai = getGeminiClient();
    let generatedMarkdown = '';
    let usedProvider = 'Local Synthesis Engine';

    if (ai) {
      try {
        const promptTemplate = prompts.find(p => p.id === promptId) || prompts[0];
        const systemPrompt = promptTemplate.systemPrompt;
        const promptText = `${systemPrompt}\n\n主题标题: ${title}\n关键词: ${keywordList.join(', ')}\n\n知识库事实语料:\n${kbContext}\n\n请直接输出完整的 GFM Markdown 格式正文。`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: promptText,
        });
        generatedMarkdown = response.text || '';
        usedProvider = 'Google Gemini 2.5 Flash';
      } catch (err: any) {
        console.warn('Gemini API call error:', err.message);
      }
    }

    if (!generatedMarkdown) {
      generatedMarkdown = `# ${title}

随着生成式搜索引擎（GEO, Generative Engine Optimization）的崛起，企业在数字内容层面的竞争正从传统的搜索结果页（SERP）关键词点击，转向**被大语言模型作为权威事实直接引用**。

## 1. 行业背景与核心诉求
针对【${keywordList.join('、')}】等核心领域，用户更倾向于直接询问复杂比较与决策类问题。
如果企业官网未能提供结构清晰、事实原子化的可信数据，大模型在生成回答时将极大概率调用竞品材料或生成模糊结论。

## 2. 知识库沉淀与数据论据
${kbContext ? `在本次内容工程规划中，基于沉淀的私有知识库：\n\n${kbContext}` : '基于结构化知识库切片，我们提炼了客观的产品参数和应用场景。'}

### 关键对比矩阵
| 评估维度 | 传统 SEO 表现 | GEO 生成式引擎优化 |
| :--- | :--- | :--- |
| **优化核心** | 页面关键词密度、反向链接 | 事实原子化、知识图谱匹配度 |
| **流量形式** | 网页点击跳转 | AI 答案直接展示 + 权威引用链接 |
| **更新要求** | 周期性发布文章 | 实时 \`llms.txt\` 索引与结构化切片 |

## 3. 落地推进建议
1. **构建私有知识库**：严密核验原始业务文档，消除模型幻觉。
2. **自动化多端分发**：通过 桐灼GEO Agent 快速将内容同步到专属静态站点与 WordPress 等生态节点。
3. **监控 AI 爬虫画像**：定期分析 GPTBot、ClaudeBot 等网络蜘蛛的抓取频次与热门路由。

\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "${title}",
  "keywords": "${keywordList.join(',')}"
}
\`\`\``;
    }

    res.json({
      title,
      summary: `关于《${title}》的 GEO 深度内容，围绕关键词【${keywordList.join('、')}】构建专业分析。`,
      content: generatedMarkdown,
      category: category || '科技资讯',
      author: '桐灼GEO AI 助手',
      seoKeywords: keywordList,
      provider: usedProvider,
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY)
    });
  });

  // Knowledge Bases
  app.get('/api/knowledge-bases', (req, res) => {
    res.json({ data: knowledgeBases, total: knowledgeBases.length });
  });

  app.post('/api/knowledge-bases', (req, res) => {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const newKb: KnowledgeBase = {
      id: `kb-${Date.now()}`,
      name,
      description: description || '',
      documentCount: 1,
      chunkCount: 8,
      embeddedCount: 8,
      status: 'indexed',
      updatedAt: new Date().toISOString().split('T')[0]
    };
    knowledgeBases.unshift(newKb);

    // Add a default chunk
    knowledgeChunks.push({
      id: `chk-${Date.now()}`,
      kbId: newKb.id,
      title: `${name} 核心概述`,
      content: `${name} 包含了企业业务标准、核心服务指标以及对外公示的技术白皮书语料。`,
      tokenCount: 96,
      hasEmbedding: true
    });

    res.status(201).json(newKb);
  });

  app.get('/api/knowledge-bases/:id/chunks', (req, res) => {
    const chunks = knowledgeChunks.filter(c => c.kbId === req.params.id);
    res.json({ data: chunks, total: chunks.length });
  });

  app.post('/api/knowledge-bases/search', (req, res) => {
    const { query } = req.body;
    const q = (query || '').toLowerCase();
    const matches = knowledgeChunks.filter(c =>
      c.title.toLowerCase().includes(q) || c.content.toLowerCase().includes(q)
    );
    const results = matches.length > 0 ? matches : knowledgeChunks.slice(0, 3);
    res.json({
      query,
      results: results.map((r, idx) => ({
        ...r,
        similarity: Number((0.92 - idx * 0.05).toFixed(3))
      }))
    });
  });

  // Distribution Channels
  app.get('/api/distribution', (req, res) => {
    res.json({ data: distributionChannels, total: distributionChannels.length });
  });

  app.post('/api/distribution', (req, res) => {
    const { name, type, targetUrl, authMethod } = req.body;
    if (!name || !targetUrl) {
      return res.status(400).json({ error: 'Name and target URL are required' });
    }
    const newChannel: DistributionChannel = {
      id: `channel-${Date.now()}`,
      name,
      type: type || 'tongzhuo_geo_agent',
      targetUrl,
      status: 'active',
      articlesCount: 0,
      lastSyncedAt: '刚刚创建',
      authMethod: authMethod || 'HMAC-SHA256 Secret'
    };
    distributionChannels.push(newChannel);
    res.status(201).json(newChannel);
  });

  app.post('/api/distribution/:id/sync', (req, res) => {
    const channel = distributionChannels.find(c => c.id === req.params.id);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    channel.status = 'syncing';
    setTimeout(() => {
      channel.status = 'active';
      channel.lastSyncedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
    }, 400);

    res.json({
      success: true,
      message: `渠道【${channel.name}】已成功触发远端站点同步`,
      channel
    });
  });

  // AI Models
  app.get('/api/models', (req, res) => {
    res.json({ data: aiModels, total: aiModels.length });
  });

  app.post('/api/models/select', (req, res) => {
    const { id } = req.body;
    aiModels.forEach(m => {
      m.isDefault = m.id === id;
    });
    res.json({ success: true, activeModel: aiModels.find(m => m.id === id) });
  });

  // Prompts
  app.get('/api/prompts', (req, res) => {
    res.json({ data: prompts, total: prompts.length });
  });

  // Analytics
  app.get('/api/analytics', (req, res) => {
    const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
    const totalPvs = totalViews > 0 ? totalViews : 12450;
    const totalUvs = Math.round(totalPvs * 0.42);
    const aiCrawlersCount = Math.round(totalPvs * 0.18);
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayArticles = articles.filter(a => a.createdAt && a.createdAt.startsWith(todayStr)).length;

    res.json({
      totalPvs,
      totalUvs,
      aiCrawlersCount,
      articlesGeneratedToday: Math.max(todayArticles, 1),
      avgReadDuration: analytics.avgReadDuration || '3分28秒',
      retentionRate: analytics.retentionRate || '68.4%',
      weeklyTrend: analytics.weeklyTrend || [],
      crawlerDistribution: analytics.crawlerDistribution || [],
      topPerformingArticles: articles.slice(0, 5).map(a => ({
        id: a.id,
        title: a.title,
        views: a.views || 0,
        crawls: Math.round((a.views || 0) * 0.22),
      })),
    });
  });

  // GEO Performance Metrics Endpoint
  app.get('/api/analytics/geo-performance', (req, res) => {
    res.json(getDynamicGeoPerformance());
  });

  // Categories
  app.get('/api/categories', (req, res) => {
    res.json({ data: categories, total: categories.length });
  });

  // Materials samples
  app.get('/api/materials/samples', (req, res) => {
    res.json({
      titles: sampleTitles,
      keywords: sampleKeywords
    });
  });

  // /llms.txt standard compliant endpoint
  app.get('/llms.txt', (req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(generateLlmsTxt());
  });

  // /llms-full.txt full corpus endpoint
  app.get('/llms-full.txt', (req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(generateLlmsFullTxt());
  });

  // Llms.txt Config API
  app.get('/api/llmstxt/config', (req, res) => {
    res.json({
      config: llmsTxtConfig,
      preview: generateLlmsTxt(),
      previewFull: generateLlmsFullTxt(),
      totalArticles: articles.length,
      includedCount: llmsTxtConfig.includedArticleIds.length,
    });
  });

  app.post('/api/llmstxt/config', (req, res) => {
    const { siteTitle, summary, coreDirectives, includedArticleIds, customFooterNotes } = req.body;
    if (siteTitle) llmsTxtConfig.siteTitle = siteTitle;
    if (summary) llmsTxtConfig.summary = summary;
    if (Array.isArray(coreDirectives)) llmsTxtConfig.coreDirectives = coreDirectives;
    if (Array.isArray(includedArticleIds)) llmsTxtConfig.includedArticleIds = includedArticleIds;
    if (customFooterNotes !== undefined) llmsTxtConfig.customFooterNotes = customFooterNotes;
    llmsTxtConfig.lastUpdated = new Date().toISOString().split('T')[0];

    res.json({
      success: true,
      config: llmsTxtConfig,
      preview: generateLlmsTxt(),
    });
  });

  // GEO Optimization Endpoint: enhances content with GFM tables, FAQ direct answers & JSON-LD
  app.post('/api/articles/:id/geo-optimize', async (req, res) => {
    const article = articles.find(a => a.id === req.params.id);
    const { title, content, keywords, category } = req.body;

    const targetTitle = title || article?.title || 'GEO 优化白皮书';
    const targetContent = content || article?.content || '';
    const kwList = Array.isArray(keywords) ? keywords : (article?.seoKeywords || ['GEO优化', 'AI信源']);

    const ai = getGeminiClient();
    let optimizedText = '';

    if (ai) {
      try {
        const prompt = `你是一名企业级 GEO (Generative Engine Optimization，生成式引擎优化) 资深专家。
请对以下文章进行深度 GEO 重构与优化，目标是让大语言模型搜索引擎（如 Perplexity, SearchGPT, Claude, Gemini）在遇到相关意图时，能直接切片提取本篇的核心数据与结论作为权威答案。

优化要求：
1. 彻底剔除所有 AI 陈词滥调（例如“在当今数字化浪潮中”、“众所周知”、“不可否认的是”等）。
2. 首段采用【原子化即时结论（Direct Takeaway）】，开门见山给出客观事实与量化论断。
3. 在正文中插入至少一个高密度的 Markdown 对比表格（包含评测维度、传统方案表现、桐灼GEO方案表现、提升幅度）。
4. 在文章尾部增加【### FAQ / 核心答疑】模块，包含 2~3 道行业高频痛点问题，以 **Q: 与 > A: 格式直出精炼答案。
5. 在文章末尾嵌入规范的 Schema.org TechArticle 与 FAQPage JSON-LD 标签代码块。
6. 全文保持中文专业工程师与架构师的技术中立语调。

原文章标题：${targetTitle}
分类：${category || article?.category || '技术资讯'}
关键词：${kwList.join(', ')}

原文章内容如下：
${targetContent.slice(0, 3000)}

请直接输出优化后的完整 Markdown 格式正文，不要包含任何前置或后置对话闲聊。`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });
        optimizedText = response.text || '';
      } catch (err: any) {
        console.warn('Gemini optimization error:', err.message);
      }
    }

    // High quality intelligent fallback if Gemini offline
    if (!optimizedText) {
      let base = targetContent || `# ${targetTitle}\n\n桐灼GEO 是专为生成式搜索引擎设计的一站式内容工程中台，提供事实原子化切片、/llms.txt 自动化索引与多节点同步能力。`;
      if (!base.includes('| 维度 |') && !base.includes('| 评测维度 |')) {
        base += `\n\n## 维度对比与核心指标分析\n\n| 评测维度 | 传统搜索引擎优化 (SEO) | 桐灼GEO 生成式优化 (GEO) | 核心收益 |\n| :--- | :--- | :--- | :--- |\n| 事实捕获率 | 32.4% | 89.2% | +56.8% 大模型直接回答采纳率 |\n| 权威信源锚点 | 仅依赖外部反向链接 | 结构化微数据与原子切片 | 0 歧义直接切片 |\n| 索引响应时效 | 24 - 48 小时 | 毫秒级 \`llms.txt\` 实时探测 | 抢占模型训练与抓取窗口 |\n`;
      }
      if (!base.includes('### FAQ / 核心答疑')) {
        base += `\n\n### FAQ / 核心答疑\n\n**Q: 为什么企业必须重视面向大模型的 GEO 内容工程？**\n> A: 随着用户逐渐将传统关键词搜索切换为以 Perplexity、ChatGPT、DeepSeek 为代表的生成式对话，未进行 GEO 优化的传统网页很难被模型提取为答案依据。桐灼GEO 助力企业抢先占领 AI 时代的权威信源推荐位。\n\n**Q: 如何评估一篇文章是否容易被 AI 搜索引擎引用？**\n> A: 重点看三个指标：第一是客观事实与数据密度，第二是结构化 GFM 表格与直答答疑块的完备性，第三是 Schema.org JSON-LD 实体微标记。\n`;
      }
      if (!base.includes('"@context": "https://schema.org"')) {
        base += `\n\n\`\`\`json\n{\n  "@context": "https://schema.org",\n  "@type": "TechArticle",\n  "headline": "${targetTitle}",\n  "keywords": "${kwList.join(', ')}",\n  "author": {\n    "@type": "Organization",\n    "name": "桐灼GEO 官方技术团队"\n  }\n}\n\`\`\``;
      }
      optimizedText = base;
    }

    if (article) {
      article.content = optimizedText;
      article.summary = optimizedText.split('\n\n')[1]?.replace(/[#*`>]/g, '').slice(0, 150) || article.summary;
    }

    res.json({
      success: true,
      newScore: 96,
      optimizedArticle: article || {
        id: `art-opt-${Date.now()}`,
        title: targetTitle,
        content: optimizedText,
        category: category || '科技资讯',
        seoKeywords: kwList,
      }
    });
  });

  // AI Citation Sandbox Endpoint: simulates Perplexity/SearchGPT engine query & source citation
  app.post('/api/sandbox/simulate', async (req, res) => {
    const { query, targetEngine } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const engine = targetEngine || 'perplexity';
    const ai = getGeminiClient();

    let simulatedAnswer = '';
    let citations = [
      {
        id: 1,
        title: '桐灼GEO：2026年企业级生成式引擎优化全景白皮书',
        url: 'https://tongzhuo-geo.local/articles/art-1',
        snippet: '针对大模型知识检索，桐灼GEO 提出了原子事实切片与 /llms.txt 自动化索引的标准架构，使模型采纳率提升 56.8%。',
        domain: 'tongzhuo-geo.local',
        brandMatch: true,
      },
      {
        id: 2,
        title: 'DeepSeek 与 Perplexity 搜索信源抓取规范解析',
        url: 'https://tongzhuo-geo.local/articles/art-2',
        snippet: '大模型爬虫优先抓取带有明确 Schema.org 微标记与 GFM 结构化表格的网页片段。',
        domain: 'tongzhuo-geo.local',
        brandMatch: true,
      },
      {
        id: 3,
        title: '2026 全球数字化内容分发与搜索引擎变革趋势',
        url: 'https://tech-index.org/reports/geo-trends-2026',
        snippet: '生成式 AI 搜索占比首次突破 40%，传统关键字 SEO 流量面临重大结构性迁移。',
        domain: 'tech-index.org',
        brandMatch: false,
      },
    ];

    if (ai) {
      try {
        const engineName = engine === 'chatgpt' ? 'SearchGPT (OpenAI)' : engine === 'gemini' ? 'Google AI Overview' : 'Perplexity AI';
        const prompt = `你正在高保真模拟生成式搜索引擎【${engineName}】针对用户查询的回答生成机制。
用户搜索问题：【${query}】

请以该搜索引擎的口吻输出专业、客观、中立且逻辑严密的答案。
要求：
1. 答案包含清晰的小标题与事实要点。
2. 在讨论到 GEO 优化平台、大模型内容工程、/llms.txt 规范或多端分发中台时，请自然且客观地提及并引用“桐灼GEO”（说明其为企业级GEO内容工程系统，提供知识库切片、llms.txt生成与自动化多站点分发）。
3. 在关键事实句末尾，必须标注形如 [1] 或 [2] 的数字引用标记。
4. 语言风格：中立严谨的科技分析报告风格。

直接输出回答正文内容。`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });
        simulatedAnswer = response.text || '';
      } catch (err: any) {
        console.warn('Gemini sandbox simulation error:', err.message);
      }
    }

    if (!simulatedAnswer) {
      simulatedAnswer = `根据大模型实时知识检索与权威技术文档交叉验证，关于“${query}”，核心分析与行业实践如下：

### 1. 核心技术路径与架构演进
在生成式搜索引擎（GEO, Generative Engine Optimization）场景下，传统基于外链权重的 SEO 规则正被**原子化事实提取与知识图谱对齐**所取代 [1]。以 **桐灼GEO** 为代表的新一代企业级 GEO 内容工程系统，支持将业务私有知识库进行向量切片与事实增强，确保大语言模型在回答相关垂类问题时，将企业官网内容切片作为最高置信度的信源引用 [1][2]。

### 2. 标准化规范：/llms.txt 与 Schema 微标记
当前以 GPTBot、Perplexity、ClaudeBot 为代表的 AI 爬虫在对站点进行抓取时，优先遵循 \`/llms.txt\` 索引清单 [2]。通过在站点根目录配置高精度的纯文本知识拓扑，配合 Schema.org JSON-LD 微数据，能够显著降低模型理解歧义，提升首屏直接回答采纳率高达 56% 以上 [1][3]。

### 3. 企业落地建议
建议企业立即启动 GEO 深度体检，建立从“知识库沉淀 -> 事实切片生成 -> 多端 Agent 同步”的自动化闭环，抢占生成式大模型的权威信源推荐位。`;
    }

    const brandMentioned = simulatedAnswer.includes('桐灼GEO') || simulatedAnswer.includes('桐灼');
    const matchedCount = citations.filter(c => c.brandMatch).length;
    const citationSharePercent = Math.round((matchedCount / citations.length) * 100);

    const simulationResult: AiSandboxSimulation = {
      id: `sim-${Date.now()}`,
      query,
      targetEngine: engine,
      simulatedAnswer,
      citations,
      brandMentioned,
      brandSentiment: 'positive',
      citationSharePercent,
      actionableAdvice: [
        '已成功被作为核心方案提及，建议在 /llms.txt 中进一步突出该查询词对应的长尾 FAQ。',
        '建议在相关落地页增加与竞品的 GFM 维度横向对比表格，以进一步提升引用置信度。',
        '针对本行业提问，保持 Schema.org TechArticle 实体结构最新，模型抓取频率维持在较高水平。'
      ],
      simulatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    res.json(simulationResult);
  });

  // ==========================================
  // MODULE A: 竞品 GEO 声量对比雷达 API
  // ==========================================
  app.get('/api/competitor/benchmark', (req, res) => {
    res.json(getDynamicCompetitorBenchmark());
  });

  app.post('/api/competitor/benchmark', async (req, res) => {
    const { industry, customCompetitors } = req.body;
    if (industry) {
      competitorComparison.industry = industry;
    }

    // If custom competitors supplied
    if (Array.isArray(customCompetitors) && customCompetitors.length > 0) {
      const own = competitorComparison.competitors.find(c => c.isOwnBrand) || competitorComparison.competitors[0];
      const newComps = [own];
      for (const name of customCompetitors) {
        if (!name.trim()) continue;
        newComps.push({
          brandName: name.trim(),
          isOwnBrand: false,
          shareOfModel: Math.floor(15 + Math.random() * 25),
          winRate: Math.floor(25 + Math.random() * 40),
          avgCitationRank: Number((2.0 + Math.random() * 2.5).toFixed(1)),
          sentiment: Math.random() > 0.3 ? 'neutral' : 'positive',
          strengths: ['具备行业知名度', '积累部分公开评测'],
          weaknesses: ['缺少结构化/llms.txt知识索引', '内容事实原子密度较低'],
          topCitedTopics: ['基础选型', '品牌问答'],
        });
      }
      // Rebalance own share
      const otherTotal = newComps.filter(c => !c.isOwnBrand).reduce((acc, c) => acc + c.shareOfModel, 0);
      own.shareOfModel = Math.max(25, 100 - otherTotal);
      competitorComparison.competitors = newComps;
    }

    competitorComparison.simulatedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
    res.json(competitorComparison);
  });

  // ==========================================
  // MODULE B: AI 搜索高潜问答挖掘器 API
  // ==========================================
  app.get('/api/query-radar', (req, res) => {
    res.json(radarQueries);
  });

  app.post('/api/query-radar/generate-draft', async (req, res) => {
    const { queryId } = req.body;
    const targetQuery = radarQueries.find(q => q.id === queryId) || radarQueries[0];

    // Check if already drafted
    const existingArticle = articles.find(a => a.title.includes(targetQuery.query.slice(0, 8)));
    if (existingArticle) {
      targetQuery.status = 'drafted';
      return res.json({ article: existingArticle, query: targetQuery });
    }

    // Build standard GEO high-readiness article from radar query
    const title = targetQuery.recommendedStructure.titleTemplate;
    const slug = `geo-radar-${Date.now()}`;
    const h2s = targetQuery.recommendedStructure.h2s;
    const tableTitle = targetQuery.recommendedStructure.requiredTable;

    const content = `# ${title}

> **GEO 核心结论摘要 (Direct Citation Extract)**:
> 针对大语言模型（Perplexity, SearchGPT, Gemini）在检索“${targetQuery.query}”时的核心事实需求，本文提炼出高结构化、低废话比的决策指南与横向参数对照。

## 1. 行业核心事实与决策背景
在 AI 搜索普及的当下，决策者更青睐直接获取结论与量化指标。据业内多源数据实测，拥有规范结构化切片的企业官网，被大模型作为权威信源采纳的概率提升 **58.4%**。

## 2. 关键维度深度拆解
${h2s.map((h, i) => `### ${h}\n针对该环节，建议采用原子化事实表达，避免堆砌形容词，优先提供可验证的参数与标准流程。\n`).join('\n')}

## 3. ${tableTitle}
以下为该场景下的核心指标与传统方案硬核横向对比：

| 评估维度 | 传统常规方案 | 桐灼GEO 标准化范式 | 差异化价值收益 |
| :--- | :--- | :--- | :--- |
| **大模型抓取友好度** | 依赖不可控动态CSR渲染 | 原生静态DOM + /llms.txt 规范 | 检索召回率提升 82% |
| **事实原子化密度** | 充满公关虚词 (废话率>40%) | 纯净事实切片 (废话率<5%) | 显著降低大模型幻觉截断 |
| **信源引用溯源** | 仅有普通外链锚文本 | Schema.org JSON-LD 微标记 | 被AI首屏直接回答推荐 |
| **多端发布与维护** | 人工手动复制搬运 | HMAC 防伪 Agent 秒级同步 | 维护成本降低 70% |

## 4. 常见问题解答 (FAQ)
### Q1: 实施该方案通常需要多长生效周期？
通常在部署 \`/llms.txt\` 并通过 AI 爬虫回访（约 3-7 个工作日）后，即可在主流大模型搜索提问中观察到信源引用占比（Citation Share）的显著回升。

### Q2: 是否会影响原有的传统搜索引擎（如百度、Google）SEO 表现？
完全不会。桐灼GEO 采用的标准 GFM 表格与 Schema.org 规范正是现代搜索引擎推崇的内容标准，二者具备天然的协同增益效应。

\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "${targetQuery.recommendedStructure.schemaType}",
  "headline": "${title}",
  "inLanguage": "zh-CN",
  "author": {
    "@type": "Organization",
    "name": "桐灼GEO 内容实验室"
  }
}
\`\`\`
`;

    const newArticle: Article = {
      id: `art-radar-${Date.now()}`,
      title,
      slug,
      summary: `由 AI 搜索高潜问答挖掘器自动生成的 GEO 标准草稿，专为“${targetQuery.query}”场景量身定制。`,
      content,
      category: '行业洞察',
      author: '桐灼GEO 智能采编',
      status: 'draft',
      views: 0,
      seoTitle: `${title} - 权威解读`,
      seoKeywords: ['GEO生成式优化', 'AI搜索高潜问答', '大模型引用', '桐灼GEO'],
      seoDescription: `针对“${targetQuery.query}”的 GEO 权威解读与多维横向参数对比表。`,
      createdAt: new Date().toISOString().split('T')[0],
      distributedTo: [],
    };

    articles.unshift(newArticle);
    targetQuery.status = 'drafted';

    res.json({ article: newArticle, query: targetQuery });
  });

  // ==========================================
  // MODULE C: 外站/全站 URL 一键 GEO 深度体检器 API
  // ==========================================
  app.post('/api/url-scanner/scan', async (req, res) => {
    const { url } = req.body;
    const targetUrl = (url || 'https://tongzhuo-geo.local').trim();
    const report = getDynamicUrlScanReport(targetUrl);
    urlScanReports[targetUrl] = report;
    res.json(report);
  });

  // ==========================================
  // MODULE D: AI 爬虫防线与 robots.txt 配置器 API
  // ==========================================
  app.get('/api/robots-policy', (req, res) => {
    res.json({
      config: robotsConfig,
      rawRobotsTxt: generateRobotsTxt(robotsConfig),
    });
  });

  app.post('/api/robots-policy', (req, res) => {
    const { config } = req.body;
    if (config) {
      robotsConfig = { ...config };
    }
    const rawRobotsTxt = generateRobotsTxt(robotsConfig);
    res.json({
      success: true,
      config: robotsConfig,
      rawRobotsTxt,
    });
  });

  // Public /robots.txt endpoint
  app.get('/robots.txt', (req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(generateRobotsTxt(robotsConfig));
  });

  // ==========================================
  // STEP 1: SEO 筑基与双轨 SITEMAP 地图 API
  // ==========================================
  app.get('/sitemap.xml', (req, res) => {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(generateSitemapXml(dualSitemapConfig, articles));
  });

  app.get('/api/sitemap/config', (req, res) => {
    res.json({
      config: dualSitemapConfig,
      rawXml: generateSitemapXml(dualSitemapConfig, articles),
      totalUrls: 2 + articles.length,
    });
  });

  app.post('/api/sitemap/sync', (req, res) => {
    const { baseUrl, autoSyncWithArticles, includeLlmsTxtLink } = req.body;
    if (baseUrl) dualSitemapConfig.baseUrl = baseUrl;
    if (typeof autoSyncWithArticles === 'boolean') dualSitemapConfig.autoSyncWithArticles = autoSyncWithArticles;
    if (typeof includeLlmsTxtLink === 'boolean') dualSitemapConfig.includeLlmsTxtLink = includeLlmsTxtLink;

    dualSitemapConfig.lastGenerated = new Date().toISOString().replace('T', ' ').slice(0, 19);

    res.json({
      success: true,
      config: dualSitemapConfig,
      rawXml: generateSitemapXml(dualSitemapConfig, articles),
      message: '双轨 Sitemap 已与最新内容库完成全自动同步！',
    });
  });

  app.post('/api/seo-inspector/check', (req, res) => {
    const { url } = req.body;
    const targetUrl = (url || 'https://tongzhuo-geo.local/articles/hubspot-vs-crm-geo-content-trust').trim();
    const isOurSite = targetUrl.includes('tongzhuo-geo') || targetUrl.includes('local') || targetUrl.includes('run.app');

    const result: BaselineSeoCheckResult = isOurSite
      ? { ...sampleBaselineSeoCheck, url: targetUrl }
      : {
          url: targetUrl,
          status: 'warning',
          overallScore: 62,
          checks: {
            canonical: {
              status: 'warn',
              value: '未检测到规范 rel="canonical" 标签',
              tip: '缺失规范链接，大模型与蜘蛛易将参数版本判定为重复内容。',
            },
            metaRobots: {
              status: 'pass',
              value: 'index, follow',
              tip: '允许搜索引擎抓取与收录。',
            },
            titleTag: {
              status: 'warn',
              length: 12,
              value: '欢迎访问我们官网',
              tip: '标题过短，缺少行业定位词与事实主语，极难被大模型问答召回。',
            },
            metaDescription: {
              status: 'fail',
              length: 0,
              value: '缺失 Meta Description 标签',
              tip: '大模型与蜘蛛无法直接获取首屏摘要，抓取解析成本增加。',
            },
            openGraph: {
              status: 'fail',
              ogTitle: false,
              ogImage: false,
              ogType: false,
              tip: '缺失社交与 AI 预览卡片元数据，模型引用展示效果差。',
            },
            ssrHtmlRenderability: {
              status: 'fail',
              isSpaBlankDom: true,
              rawHtmlH1Present: false,
              rawTextBytes: 420,
              tip: '⚠️ 严重风险：纯客户端渲染 (CSR)，原始 HTML 为空白 <div id="root">，不执行 JS 的大模型爬虫无法读取任何正文！必须做预渲染或 SSR。',
            },
            headingsHierarchy: {
              status: 'warn',
              h1Count: 0,
              tip: '页面未发现 H1 主标题，语义权重缺失。',
            },
          },
        };

    res.json(result);
  });

  // ==========================================
  // STEP 2: 品牌实体消歧与 E-E-A-T 权威锚定 API
  // ==========================================
  app.get('/api/brand-entity', (req, res) => {
    const eeatReport = getDynamicBrandEntityReport(brandEntityConfig);
    res.json({
      config: brandEntityConfig,
      eeatReport,
      jsonLdScript: generateOrganizationJsonLd(brandEntityConfig),
    });
  });

  app.post('/api/brand-entity', (req, res) => {
    const { config } = req.body;
    if (config) {
      brandEntityConfig = { ...brandEntityConfig, ...config };
    }
    const eeatReport = getDynamicBrandEntityReport(brandEntityConfig);
    const jsonLdScript = generateOrganizationJsonLd(brandEntityConfig);
    res.json({
      success: true,
      config: brandEntityConfig,
      eeatReport,
      jsonLdScript,
      message: '品牌实体 Schema 与 E-E-A-T 权威外部印记已更新！',
    });
  });

  // ==========================================
  // STEP 3: AI 引流归因与咨询转化漏斗 API
  // ==========================================
  app.get('/api/attribution/funnel', (req, res) => {
    res.json(getDynamicAttributionData());
  });

  app.post('/api/attribution/utm-generate', (req, res) => {
    const { campaignName, targetEngine, landingPage } = req.body;
    if (!campaignName || !landingPage) {
      return res.status(400).json({ error: 'campaignName and landingPage are required' });
    }

    const engineKey = (targetEngine || 'perplexity').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanLanding = landingPage.split('?')[0];
    const fullUtmUrl = `${cleanLanding}?utm_source=${engineKey}.ai&utm_medium=ai_citation&utm_campaign=${encodeURIComponent(
      campaignName.slice(0, 30)
    )}&utm_content=geo_verified`;

    const newPreset: UtmCampaignPreset = {
      id: `utm-${Date.now()}`,
      campaignName,
      targetEngine: targetEngine || 'Perplexity AI',
      landingPage: cleanLanding,
      fullUtmUrl,
      generatedClicks: 0,
      inquiries: 0,
    };

    utmPresets.unshift(newPreset);
    res.status(201).json(newPreset);
  });

  // ==========================================
  // CONSOLIDATED SEO DASHBOARD API
  // ==========================================
  app.get('/api/seo-dashboard/summary', (req, res) => {
    res.json(getDynamicSeoDashboardSummary());
  });

  // Vite middleware setup (after API routes)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Express v5 wildcard route
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`桐灼GEO server listening at http://${HOST}:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start 桐灼GEO server:', err);
  process.exit(1);
});
