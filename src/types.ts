export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  status: 'published' | 'draft' | 'review' | 'trash';
  views: number;
  seoTitle?: string;
  seoKeywords: string[];
  seoDescription?: string;
  createdAt: string;
  distributedTo: string[];
  geoScore?: number;
  geoAudit?: GeoAuditReport;
}

export interface GeoAuditCriterion {
  id: string;
  name: string;
  score: number; // 0 - 100
  weight: number;
  passed: boolean;
  status: 'good' | 'warning' | 'critical';
  feedback: string;
  suggestion: string;
}

export interface GeoAuditReport {
  overallScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  factDensityScore: number;
  extractabilityScore: number;
  schemaReadinessScore: number;
  fluffRatio: number;
  tableCount: number;
  faqCount: number;
  schemaTypesDetected: string[];
  criteria: GeoAuditCriterion[];
  optimizationsAvailable: string[];
}

export interface LlmsTxtConfig {
  siteTitle: string;
  summary: string;
  coreDirectives: string[];
  includedArticleIds: string[];
  includeFullText: boolean;
  customFooterNotes: string;
  lastUpdated: string;
}

export interface AiSandboxCitation {
  index: number;
  title: string;
  url: string;
  relevanceScore: number;
  isBrandSource: boolean;
  snippet: string;
}

export interface AiSandboxSimulation {
  query: string;
  targetEngine: 'perplexity' | 'chatgpt' | 'gemini';
  simulatedAnswer: string;
  citations: AiSandboxCitation[];
  brandMentioned: boolean;
  brandSentiment: 'positive' | 'neutral' | 'none';
  brandRecommendationGrade: '强力推荐' | '客观列举' | '未上榜';
  citationSharePercent: number;
  actionableAdvice: string[];
  timestamp: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  articleCount: number;
}

export interface Task {
  id: string;
  name: string;
  status: 'running' | 'idle' | 'paused' | 'completed';
  targetCategory: string;
  aiModel: string;
  batchLimit: number;
  generatedCount: number;
  schedule: string;
  lastRunAt: string;
  distributionScope: 'all' | 'channels_only' | 'local_only';
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  documentCount: number;
  chunkCount: number;
  embeddedCount: number;
  status: 'ready' | 'processing' | 'indexed';
  updatedAt: string;
}

export interface KnowledgeChunk {
  id: string;
  kbId: string;
  title: string;
  content: string;
  tokenCount: number;
  hasEmbedding: boolean;
}

export interface DistributionChannel {
  id: string;
  name: string;
  type: 'tongzhuo_geo_agent' | 'wordpress_rest' | 'generic_http';
  targetUrl: string;
  status: 'active' | 'disconnected' | 'syncing';
  articlesCount: number;
  lastSyncedAt: string;
  authMethod: string;
}

export interface AiModelConfig {
  id: string;
  name: string;
  provider: 'gemini' | 'openai' | 'custom';
  modelId: string;
  isDefault: boolean;
  contextWindow: number;
  type: 'chat' | 'embedding';
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  systemPrompt: string;
  userPromptTemplate: string;
  isDefault: boolean;
}

export interface AnalyticsOverview {
  totalPvs: number;
  totalUvs: number;
  articlesGeneratedToday: number;
  aiCrawlersCount: number;
  crawlerBreakdown: { name: string; count: number; percentage: number; color: string }[];
  dailyTraffic: { date: string; pv: number; uv: number; aiBot: number }[];
  topArticles: { title: string; views: number; citations: number }[];
}

export interface GeoEngineVisibility {
  engine: string;
  name: string;
  citationShare: number; // percentage, e.g. 36.4
  citationsCount: number;
  visibilityScore: number; // 0 to 100
  trendChange: number; // e.g. +5.2
  color: string;
}

export interface GeoKeywordRanking {
  id: string;
  keyword: string;
  intent: 'commercial' | 'technical' | 'informational' | 'brand';
  currentRank: number;
  previousRank: number;
  engine: string;
  promptVolume: number;
  citationLikelihood: number; // 0 - 100
  targetArticleTitle: string;
  targetArticleSlug?: string;
  trend: number[]; // e.g. last 5 rankings
}

export interface GeoTrafficTimelinePoint {
  date: string;
  impressions: number;
  referralClicks: number;
  ctr: number;
}

export interface GeoPerformanceMetrics {
  visibilityScore: number;
  visibilityChange: number;
  estimatedMonthlyTraffic: number;
  trafficGrowthRate: number;
  averageCitationCtr: number;
  estimatedOrganicValue: number; // in USD
  rankingDistribution: {
    top3Count: number;
    top10Count: number;
    beyond10Count: number;
  };
  engineVisibility: GeoEngineVisibility[];
  keywordRankings: GeoKeywordRanking[];
  trafficTimeline: GeoTrafficTimelinePoint[];
  topicDistribution: { topic: string; trafficShare: number; citations: number }[];
}

// ================= MODULE A: 竞品 GEO 声量对比雷达 =================
export interface CompetitorBenchmarkItem {
  brandName: string;
  isOwnBrand: boolean;
  shareOfModel: number; // 0 - 100
  winRate: number; // 0 - 100
  avgCitationRank: number; // 1.2, 2.5 etc
  sentiment: 'positive' | 'neutral' | 'critical';
  strengths: string[];
  weaknesses: string[];
  topCitedTopics: string[];
}

export interface CompetitorBlindspot {
  topic: string;
  winnerBrand: string;
  ourStatus: 'absent' | 'lagging' | 'leading';
  impactScore: number;
  recommendedAction: string;
}

export interface CompetitorComparisonResult {
  industry: string;
  evaluatedEngines: string[];
  competitors: CompetitorBenchmarkItem[];
  blindspots: CompetitorBlindspot[];
  headToHead: { dimension: string; ownScore: number; compScores: { [brand: string]: number }; verdict: string }[];
  simulatedAt: string;
}

// ================= MODULE B: AI 搜索高潜问答挖掘器 =================
export interface GeoQueryRadarItem {
  id: string;
  query: string;
  intent: 'comparison' | 'buying_decision' | 'technical' | 'faq' | 'pricing';
  searchVolumeScore: number; // 1 - 100
  citationGapRate: number; // 0 - 100%
  geoOpportunityScore: number; // 0 - 100
  targetEngines: string[];
  recommendedStructure: {
    titleTemplate: string;
    h2s: string[];
    requiredTable: string;
    schemaType: string;
  };
  sampleExcerpt?: string;
  status: 'new' | 'drafted' | 'published';
}

// ================= MODULE C: URL GEO 深度体检器 =================
export interface UrlScanItem {
  dimension: string;
  score: number;
  status: 'pass' | 'warning' | 'fail';
  title: string;
  details: string;
  recommendation: string;
}

export interface UrlScanReport {
  url: string;
  scannedAt: string;
  overallScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  robotsTxtStatus: {
    accessible: boolean;
    gptBotAllowed: boolean;
    claudeBotAllowed: boolean;
    perplexityAllowed: boolean;
    bytespiderAllowed: boolean;
  };
  llmsTxtStatus: {
    present: boolean;
    formatStandard: boolean;
    urlCount: number;
    hasDirectives: boolean;
  };
  schemaStatus: {
    hasSchema: boolean;
    typesFound: string[];
    jsonLdValid: boolean;
  };
  contentQuality: {
    wordCount: number;
    tableCount: number;
    faqSectionDetected: boolean;
    fluffRatio: number;
  };
  items: UrlScanItem[];
  quickFixPlan: string[];
}

// ================= MODULE D: AI 爬虫防线与 robots.txt 配置器 =================
export interface AiBotPolicy {
  id: string;
  name: string;
  userAgent: string;
  company: string;
  purpose: 'search_rag' | 'training' | 'multimodal';
  action: 'allow' | 'disallow' | 'throttle';
  crawlDelay?: number;
  description: string;
}

export interface RobotsConfig {
  allowAllByDefault: boolean;
  includeLlmsTxt: boolean;
  includeSitemap: boolean;
  sitemapUrl: string;
  llmsTxtUrl: string;
  protectedPaths: string[];
  botPolicies: AiBotPolicy[];
}

// ================= STEP 1: SEO 筑基与双轨 SITEMAP 地图 =================
export interface SitemapUrlEntry {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  articleId?: string;
  title?: string;
}

export interface DualSitemapConfig {
  baseUrl: string;
  autoSyncWithArticles: boolean;
  includeLlmsTxtLink: boolean;
  enableNewsSitemap: boolean;
  entries: SitemapUrlEntry[];
  lastGenerated: string;
}

export interface BaselineSeoCheckResult {
  url: string;
  status: 'passed' | 'warning' | 'critical';
  overallScore: number;
  checks: {
    canonical: { status: 'pass' | 'fail'; value: string; tip: string };
    metaRobots: { status: 'pass' | 'warn' | 'fail'; value: string; tip: string };
    titleTag: { status: 'pass' | 'warn'; length: number; value: string; tip: string };
    metaDescription: { status: 'pass' | 'warn'; length: number; value: string; tip: string };
    openGraph: { status: 'pass' | 'fail'; ogTitle: boolean; ogImage: boolean; ogType: boolean; tip: string };
    ssrHtmlRenderability: {
      status: 'pass' | 'warn' | 'fail';
      isSpaBlankDom: boolean;
      rawHtmlH1Present: boolean;
      rawTextBytes: number;
      tip: string;
    };
    headingsHierarchy: { status: 'pass' | 'warn'; h1Count: number; tip: string };
  };
}

// ================= STEP 2: 品牌实体消歧与 E-E-A-T 权威锚定 =================
export interface SameAsLink {
  id: string;
  platform: 'wikipedia' | 'baike' | 'crunchbase' | 'github' | 'linkedin' | 'weibo' | 'zhihu' | 'gov_record';
  platformName: string;
  url: string;
  verified: boolean;
  authorityWeight: number; // 1-100
}

export interface BrandEntityConfig {
  organizationName: string;
  alternateName: string;
  legalName: string;
  foundingDate: string;
  officialDomain: string;
  logoUrl: string;
  description: string;
  sameAsLinks: SameAsLink[];
  founders: { name: string; title: string; profileUrl?: string }[];
  awardsAndCertifications: string[];
  contactEmail: string;
}

export interface EeatAuditReport {
  brandOverallScore: number; // 0-100
  dimensions: {
    experience: { score: number; verdict: string; highlights: string[]; gaps: string[] };
    expertise: { score: number; verdict: string; highlights: string[]; gaps: string[] };
    authoritativeness: { score: number; verdict: string; highlights: string[]; gaps: string[] };
    trustworthiness: { score: number; verdict: string; highlights: string[]; gaps: string[] };
  };
  jsonLdScriptPreview: string;
}

// ================= STEP 3: AI 引流归因与咨询转化漏斗 =================
export interface AiReferralSourceMetric {
  engine: 'Perplexity' | 'ChatGPT / SearchGPT' | 'Claude' | 'Gemini' | 'Kimi' | 'Doubao' | 'Others';
  iconColor: string;
  referralClicks: number;
  bounceRate: number; // 0 - 100%
  avgDwellSeconds: number;
  inquiriesGenerated: number;
  conversionRate: number; // 0 - 100%
  pipelineRevenue: number; // in RMB/currency
}

export interface AiTrafficFunnelStage {
  stage: string;
  count: number;
  conversionRateFromPrev: number;
  dropoffNote: string;
}

export interface UtmCampaignPreset {
  id: string;
  campaignName: string;
  targetEngine: string;
  landingPage: string;
  fullUtmUrl: string;
  generatedClicks: number;
  inquiries: number;
}

// ================= SEO 综合决策大盘 =================
export interface SeoDashboardActionItem {
  id: string;
  priority: 'P0' | 'P1' | 'P2';
  category: 'competitor' | 'query' | 'sitemap' | 'entity';
  title: string;
  description: string;
  impactScore: number;
  completed: boolean;
  actionLabel: string;
  targetTab: string;
  prefillQuery?: string;
}

export interface SeoDashboardAggregateData {
  healthScore: number;
  healthGrade: string;
  competitorSummary: {
    ownShare: number;
    winRate: number;
    leadMargin: number;
    rivalCount: number;
    blindspotsCount: number;
  };
  queryRadarSummary: {
    totalQueries: number;
    highPotentialCount: number;
    avgCitationGap: number;
    avgOpportunityScore: number;
  };
  sitemapSummary: {
    totalUrls: number;
    lastSynced: string;
    autoSyncEnabled: boolean;
    llmsTxtLinked: boolean;
    crawlersAllowedCount: number;
  };
}

