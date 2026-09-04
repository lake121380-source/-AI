import React, { useState, useEffect } from 'react';
import {
  Activity,
  Flame,
  Search,
  Layers,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Award,
  Globe,
  FileCode2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Filter,
  BarChart3,
  Zap,
  Target,
  FileText,
  Compass,
  Building2,
  Clock,
  SlidersHorizontal,
} from 'lucide-react';
import {
  CompetitorComparisonResult,
  GeoQueryRadarItem,
  DualSitemapConfig,
  BaselineSeoCheckResult,
  Article,
  SeoDashboardActionItem,
  SeoDashboardAggregateData,
} from '../types';
import {
  initialCompetitorComparison,
  initialRadarQueries,
  initialDualSitemapConfig,
  sampleBaselineSeoCheck,
} from '../data/mockData';

interface SeoDashboardViewProps {
  lang: 'zh' | 'en';
  onNavigate: (tab: string) => void;
  onNavigateToDraft?: (topic: string) => void;
  onArticleCreated?: (newArticle: Article) => void;
}

export const SeoDashboardView: React.FC<SeoDashboardViewProps> = ({
  lang,
  onNavigate,
  onNavigateToDraft,
  onArticleCreated,
}) => {
  // Data States
  const [competitorData, setCompetitorData] = useState<CompetitorComparisonResult>(initialCompetitorComparison);
  const [radarQueries, setRadarQueries] = useState<GeoQueryRadarItem[]>(initialRadarQueries);
  const [sitemapConfig, setSitemapConfig] = useState<DualSitemapConfig>(initialDualSitemapConfig);
  const [baselineCheck, setBaselineCheck] = useState<BaselineSeoCheckResult>(sampleBaselineSeoCheck);
  const [aggregateData, setAggregateData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncingSitemap, setIsSyncingSitemap] = useState(false);
  const [draftingQueryId, setDraftingQueryId] = useState<string | null>(null);

  // Filter States
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedEngine, setSelectedEngine] = useState<string>('all');
  const [queryIntentFilter, setQueryIntentFilter] = useState<string>('all');
  const [activeViewSection, setActiveViewSection] = useState<'all' | 'actions' | 'competitor' | 'queries' | 'sitemap'>('all');

  // Interactive UI
  const [copiedBrief, setCopiedBrief] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Executive Decision Action Items
  const [actionItems, setActionItems] = useState<SeoDashboardActionItem[]>([
    {
      id: 'act-1',
      priority: 'P0',
      category: 'competitor',
      title: lang === 'zh' ? '阻截竞品优势：生成 GEO ROI 测算白皮书' : 'Intercept Rival: Generate GEO ROI Calculation Whitepaper',
      description: lang === 'zh'
        ? '竞品在“GEO ROI 与传统 SEO 投入产出比”占有较高引用率。建议生成专题对比内容建立事实权威。'
        : 'Rival is dominating "GEO ROI vs Traditional SEO". Generate comparative whitepaper with formulas.',
      impactScore: 94,
      completed: false,
      actionLabel: lang === 'zh' ? '⚡ 针对性成稿' : '⚡ Draft Target Topic',
      targetTab: 'generator',
      prefillQuery: 'GEO 优化与传统百度/谷歌 SEO 的实际预算 ROI 投入产出比测算',
    },
    {
      id: 'act-2',
      priority: 'P0',
      category: 'query',
      title: lang === 'zh' ? '抢占蓝海缺口：B2B 企业 GEO 落地 5 步指南' : 'Capture Blue Ocean: 5-Step B2B GEO Guide',
      description: lang === 'zh'
        ? '“B2B 企业如何系统化开展 GEO”搜索热度达 96，信源空缺率 84%，大模型当前缺乏高质量结构化回答。'
        : 'Query search volume 96 with 84% citation gap rate. Target engines: Perplexity, SearchGPT.',
      impactScore: 95,
      completed: false,
      actionLabel: lang === 'zh' ? '⚡ 一键抢占' : '⚡ Claim Topic',
      targetTab: 'query_radar',
      prefillQuery: 'B2B 企业如何系统化开展 GEO 生成式引擎优化的 5 步全景落地指南',
    },
    {
      id: 'act-3',
      priority: 'P1',
      category: 'sitemap',
      title: lang === 'zh' ? '双轨 Sitemap 与 /llms.txt 增量同步' : 'Incremental Sync Dual Sitemap & /llms.txt',
      description: lang === 'zh'
        ? '已有 5 篇核心文章及知识切片，建议确保 /sitemap.xml 包含完整 lastmod 时间戳并挂载 /llms.txt。'
        : 'Ensure sitemap.xml and /llms.txt include all recent articles with standard lastmod timestamps.',
      impactScore: 88,
      completed: true,
      actionLabel: lang === 'zh' ? '立即同步' : 'Sync Now',
      targetTab: 'seo_foundation',
    },
    {
      id: 'act-4',
      priority: 'P1',
      category: 'entity',
      title: lang === 'zh' ? '完善 Organization sameAs 权威百科认证' : 'Complete Organization sameAs Wikipedia Citations',
      description: lang === 'zh'
        ? '在首页 JSON-LD 中补充 Crunchbase 与维基媒体实体对齐链接，降低模型概念混淆率。'
        : 'Embed verified external URLs into Organization schema sameAs property.',
      impactScore: 82,
      completed: false,
      actionLabel: lang === 'zh' ? '配置实体' : 'Config Entity',
      targetTab: 'brand_entity',
    },
  ]);

  // Fetch initial aggregated dashboard summary
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/seo-dashboard/summary');
      if (res.ok) {
        const data = await res.json();
        if (data.aggregate) setAggregateData(data.aggregate);
        if (data.competitorComparison) setCompetitorData(data.competitorComparison);
        if (data.radarQueries && Array.isArray(data.radarQueries)) setRadarQueries(data.radarQueries);
        if (data.sitemapConfig) setSitemapConfig(data.sitemapConfig);
        if (data.sampleCheck) setBaselineCheck(data.sampleCheck);
      }
    } catch (e) {
      console.warn('Fetch SEO dashboard data fallback to mock:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Quick Action Handler: Generate Draft from Query
  const handleQuickDraft = async (queryItem: GeoQueryRadarItem) => {
    setDraftingQueryId(queryItem.id);
    try {
      const res = await fetch('/api/query-radar/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryId: queryItem.id }),
      });
      if (res.ok) {
        const result = await res.json();
        setRadarQueries((prev) =>
          prev.map((q) => (q.id === queryItem.id ? { ...q, status: 'drafted' } : q))
        );
        if (onArticleCreated && result.article) {
          onArticleCreated(result.article);
        }
        showToast(
          lang === 'zh'
            ? `已针对「${queryItem.query.slice(0, 16)}...」极速生成 GEO 结构化草稿！`
            : `Generated targeted GEO draft for "${queryItem.query.slice(0, 20)}..."!`
        );
      } else {
        showToast(lang === 'zh' ? '生成草稿失败，请稍后重试' : 'Failed to generate draft, please retry');
      }
    } catch (err) {
      console.error(err);
      showToast(lang === 'zh' ? '网络请求异常' : 'Network error');
    } finally {
      setDraftingQueryId(null);
    }
  };

  // Sync Sitemap Handler
  const handleSyncSitemapQuick = async () => {
    setIsSyncingSitemap(true);
    try {
      const res = await fetch('/api/sitemap/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl: sitemapConfig.baseUrl,
          autoSyncWithArticles: true,
          includeLlmsTxtLink: true,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.config) setSitemapConfig(data.config);
        showToast(lang === 'zh' ? '双轨 Sitemap 与 /llms.txt 已成功同步最新文章！' : 'Dual Sitemap and /llms.txt synced successfully!');
      }
    } catch (e) {
      console.error(e);
      showToast(lang === 'zh' ? '同步失败，请重试' : 'Sync failed, please retry');
    } finally {
      setIsSyncingSitemap(false);
    }
  };

  // Toggle Action Completion
  const toggleAction = (id: string) => {
    setActionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  // Compute Aggregates
  const ownBrand = competitorData.competitors.find((c) => c.isOwnBrand) || competitorData.competitors[0];
  const rivals = competitorData.competitors.filter((c) => !c.isOwnBrand);
  const topRival = [...rivals].sort((a, b) => b.shareOfModel - a.shareOfModel)[0] || { brandName: '竞品A', shareOfModel: 28 };
  const leadMargin = ownBrand ? ownBrand.shareOfModel - topRival.shareOfModel : 14;
  const leadMarginDisplay = leadMargin > 0 ? Number(leadMargin).toFixed(1) : '0';

  const healthScore = aggregateData?.healthScore ?? 94;
  const healthGrade = aggregateData?.healthGrade ?? 'A+';
  const crawlersAllowedCount = aggregateData?.sitemapSummary?.crawlersAllowedCount ?? 9;

  const totalQueries = radarQueries.length;
  const highPotentialQueries = radarQueries.filter((q) => q.geoOpportunityScore >= 85);
  const avgCitationGap = totalQueries > 0
    ? Math.round(radarQueries.reduce((acc, q) => acc + q.citationGapRate, 0) / totalQueries)
    : 82;
  const avgOpportunityScore = totalQueries > 0
    ? Math.round(radarQueries.reduce((acc, q) => acc + q.geoOpportunityScore, 0) / totalQueries)
    : 92;

  // Filtered queries
  const filteredQueries = radarQueries.filter((item) => {
    if (queryIntentFilter !== 'all' && item.intent !== queryIntentFilter) return false;
    if (selectedEngine !== 'all') {
      const matchEngine = item.targetEngines.some((e) =>
        e.toLowerCase().includes(selectedEngine.toLowerCase())
      );
      if (!matchEngine) return false;
    }
    return true;
  });

  // Export Executive Briefing
  const handleExportBriefing = () => {
    const briefingText = `# 桐灼GEO · 搜索引擎与生成式优化 (SEO/GEO) 综合决策内参

**生成时间**: ${new Date().toISOString().replace('T', ' ').slice(0, 19)}
**统计周期**: ${timeframe === '7d' ? '近 7 天' : timeframe === '30d' ? '近 30 天' : '本季度 (90天)'}
**核心结论**: 桐灼GEO 全局健康度 ${healthScore} 分 (${healthGrade})，大模型声量占有率以 ${ownBrand?.shareOfModel || 42}% 稳居行业首位，信源引用胜率 ${ownBrand?.winRate || 78}%。

---

## 1. 核心大盘指标概览
- **全站 SEO/GEO 综合健康度**: ${healthScore}/100 (${healthGrade})
  - 技术基准达标率: 96% | 结构化微标覆盖率: 92% | SSR 纯静态渲染: 100%
- **大模型声量占有率 (Share of Model)**: ${ownBrand?.shareOfModel || 42}% (领先第二名 +${leadMarginDisplay}%)
- **高潜问答机会池**: ${totalQueries} 个重点词条，平均空缺率 ${avgCitationGap}%，平均机会得分 ${avgOpportunityScore}/100
- **双轨地图与收录防线**: 收录节点 ${sitemapConfig.entries.length} 个，/llms.txt 100% 挂载，${crawlersAllowedCount} 款主流 AI 爬虫完全放通

---

## 2. 竞品声量与失守盲区
${competitorData.blindspots
  .map(
    (b, i) =>
      `${i + 1}. 【${b.topic}】: 竞品【${b.winnerBrand}】领先，影响度 ${b.impactScore}分。建议对策：${b.recommendedAction}`
  )
  .join('\n')}

---

## 3. 本周高潜问答推荐突破清单
${radarQueries
  .slice(0, 3)
  .map(
    (q, i) =>
      `${i + 1}. 【${q.query}】: 意图【${q.intent}】，搜索潜力 ${q.searchVolumeScore}，信源缺口 ${q.citationGapRate}%，机会得分 ${q.geoOpportunityScore}`
  )
  .join('\n')}

---

## 4. 关键行动清单 (P0 & P1)
- [P0 阻截] 立即发布《GEO 与传统 SEO 的 ROI 投入产出对比测算白皮书》，内附测算公式表。
- [P0 蓝海] 针对搜索热度 96 的“B2B 企业如何系统化开展 GEO”发布 5 步全景落地指南。
- [P1 规范] 确保最新文章已自动同步至 /sitemap.xml 与 /llms.txt。
`;

    navigator.clipboard.writeText(briefingText);
    setCopiedBrief(true);
    showToast(lang === 'zh' ? '已复制高管决策内参简报至剪贴板！' : 'Copied Executive Decision Briefing to clipboard!');
    setTimeout(() => setCopiedBrief(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-16 right-8 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-lg shadow-xl text-sm font-medium flex items-center gap-2 border border-indigo-400/30 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header & Strategic Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-48 -bottom-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-indigo-400" />
                {lang === 'zh' ? 'SEO & GEO 综合决策中枢' : 'Executive SEO & GEO Dashboard'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {lang === 'zh' ? '三模聚合 · 决策就绪' : 'Unified · Decision Ready'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {lang === 'zh' ? 'SEO 综合决策大盘' : 'SEO Strategic Dashboard'}
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 max-w-3xl leading-relaxed">
              {lang === 'zh'
                ? '聚合【竞品声量雷达】、【高潜问答挖掘】与【双轨 Sitemap 地图】核心指标，为传统搜索引擎与生成式 AI 推荐提供全局决策视窗与作战清单。'
                : 'Aggregating Competitor Benchmark, Query Radar, and Dual Sitemap SEO into a single pane of glass for rapid strategic execution.'}
            </p>
          </div>

          {/* Action Tools & Filters */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Timeframe selector */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-lg p-1 text-xs">
              <button
                onClick={() => setTimeframe('7d')}
                className={`px-2.5 py-1 rounded transition-all ${
                  timeframe === '7d' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'zh' ? '近7天' : '7D'}
              </button>
              <button
                onClick={() => setTimeframe('30d')}
                className={`px-2.5 py-1 rounded transition-all ${
                  timeframe === '30d' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'zh' ? '近30天' : '30D'}
              </button>
              <button
                onClick={() => setTimeframe('90d')}
                className={`px-2.5 py-1 rounded transition-all ${
                  timeframe === '90d' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'zh' ? '季度' : '90D'}
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="p-2 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 rounded-lg text-xs transition-colors flex items-center gap-1.5"
              title={lang === 'zh' ? '刷新全部聚合数据' : 'Refresh all metrics'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>

            {/* Export Briefing CTA */}
            <button
              onClick={handleExportBriefing}
              className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              {copiedBrief ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedBrief ? (lang === 'zh' ? '已复制简报' : 'Copied') : lang === 'zh' ? '复制决策内参' : 'Export Briefing'}</span>
            </button>
          </div>
        </div>

        {/* Quick Module Switcher Tabs */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-slate-400" />
            {lang === 'zh' ? '聚合模块直达:' : 'Jump to Module:'}
          </span>
          <button
            onClick={() => onNavigate('competitor')}
            className="px-2.5 py-1 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 rounded text-xs transition-colors flex items-center gap-1.5"
          >
            <Flame className="w-3 h-3 text-amber-400" />
            <span>{lang === 'zh' ? '竞品声量雷达' : 'Competitor Radar'}</span>
            <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
          </button>
          <button
            onClick={() => onNavigate('query_radar')}
            className="px-2.5 py-1 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 rounded text-xs transition-colors flex items-center gap-1.5"
          >
            <Search className="w-3 h-3 text-indigo-400" />
            <span>{lang === 'zh' ? '高潜问答挖掘' : 'Query Radar'}</span>
            <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
          </button>
          <button
            onClick={() => onNavigate('seo_foundation')}
            className="px-2.5 py-1 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 rounded text-xs transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3 h-3 text-emerald-400" />
            <span>{lang === 'zh' ? '双轨 Sitemap 地图' : 'Dual Sitemap SEO'}</span>
            <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
          </button>
          <button
            onClick={() => onNavigate('robots_policy')}
            className="px-2.5 py-1 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 rounded text-xs transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3 h-3 text-sky-400" />
            <span>{lang === 'zh' ? 'AI 爬虫策略' : 'Crawler Policy'}</span>
            <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
          </button>
          <button
            onClick={() => onNavigate('brand_entity')}
            className="px-2.5 py-1 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 rounded text-xs transition-colors flex items-center gap-1.5"
          >
            <Award className="w-3 h-3 text-purple-400" />
            <span>{lang === 'zh' ? '品牌实体 E-E-A-T' : 'Entity & EEAT'}</span>
            <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* TOP 4 AGGREGATE KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Health Index */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">
              {lang === 'zh' ? '综合 SEO & GEO 指数' : 'Overall SEO/GEO Health'}
            </span>
            <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">{healthScore}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {healthGrade} {lang === 'zh' ? '极佳' : 'Optimal'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>{lang === 'zh' ? '技术基准达标' : 'Technical Baseline'}:</span>
            <span className="text-slate-200 font-semibold">96%</span>
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" style={{ width: `${healthScore}%` }}></div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>SSR 渲染率 100%</span>
            <button
              onClick={() => onNavigate('seo_foundation')}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 font-medium"
            >
              {lang === 'zh' ? '查看体检' : 'Inspect'} <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Competitor SoM */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">
              {lang === 'zh' ? '大模型声量占有率 (SoM)' : 'Share of Model (SoM)'}
            </span>
            <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {ownBrand?.shareOfModel || 42.6}%
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              #1 {lang === 'zh' ? '领跑' : 'Leader'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>{lang === 'zh' ? '领先次席竞品' : 'Lead Margin'}:</span>
            <span className="text-emerald-400 font-semibold">+{leadMarginDisplay}%</span>
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-amber-500 h-full rounded-full"
              style={{ width: `${ownBrand?.shareOfModel || 42}%` }}
            ></div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>{lang === 'zh' ? `引用胜率 ${ownBrand?.winRate || 78}%` : `Win Rate ${ownBrand?.winRate || 78}%`}</span>
            <button
              onClick={() => onNavigate('competitor')}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-0.5 font-medium"
            >
              {lang === 'zh' ? '竞品雷达' : 'Radar'} <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 3: Query Opportunity */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">
              {lang === 'zh' ? '高潜问答机会池' : 'Query Opportunity Pool'}
            </span>
            <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">{totalQueries}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
              {highPotentialQueries.length} {lang === 'zh' ? '特优' : 'Prime'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>{lang === 'zh' ? '平均空白缺口率' : 'Avg Citation Gap'}:</span>
            <span className="text-rose-400 font-semibold">{avgCitationGap}%</span>
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full"
              style={{ width: `${avgOpportunityScore}%` }}
            ></div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>{lang === 'zh' ? `机会均分 ${avgOpportunityScore}` : `Avg Score ${avgOpportunityScore}`}</span>
            <button
              onClick={() => onNavigate('query_radar')}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 font-medium"
            >
              {lang === 'zh' ? '挖掘高潜' : 'Explore'} <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Sitemap & Crawlers */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">
              {lang === 'zh' ? '双轨 Sitemap & 爬虫' : 'Dual Sitemap & Bots'}
            </span>
            <span className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {sitemapConfig.entries.length}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {lang === 'zh' ? '节点已纳管' : 'Managed URLs'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>/llms.txt 关联:</span>
            <span className="text-emerald-400 font-semibold">{sitemapConfig.includeLlmsTxtLink ? '100% 挂载' : '未开启'}</span>
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>{crawlersAllowedCount} 款 AI 爬虫完全放行</span>
            <button
              onClick={() => onNavigate('seo_foundation')}
              className="text-purple-400 hover:text-purple-300 flex items-center gap-0.5 font-medium"
            >
              {lang === 'zh' ? '配置地图' : 'Configure'} <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION A: EXECUTIVE DECISION ACTION MATRIX (P0/P1 QUICK WINS) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Zap className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {lang === 'zh' ? '敏捷决策作战清单' : 'Executive Decision Matrix & Quick Actions'}
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                  {actionItems.filter((a) => !a.completed).length} {lang === 'zh' ? '待执行' : 'Pending'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'zh'
                  ? '综合竞品失守盲区、高潜蓝海问答与技术基准漏洞生成的最高 ROI 作战动作'
                  : 'High-ROI tactical initiatives derived from rival blind spots, query gaps, and technical audits.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('generator')}
              className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'zh' ? '进入 AI 内容工坊' : 'Open AI Studio'}</span>
            </button>
          </div>
        </div>

        {/* Action Items List */}
        <div className="space-y-3">
          {actionItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                item.completed
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                  : 'bg-slate-800/40 hover:bg-slate-800/70 border-slate-700/60 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <button
                  onClick={() => toggleAction(item.id)}
                  className={`w-5 h-5 rounded mt-0.5 border flex items-center justify-center shrink-0 transition-colors ${
                    item.completed
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'border-slate-600 hover:border-slate-400 bg-slate-800/80 text-transparent'
                  }`}
                  title={lang === 'zh' ? '标记完成状态' : 'Toggle Completed'}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                        item.priority === 'P0'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {item.priority}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {item.category === 'competitor'
                        ? lang === 'zh' ? '竞品阻截' : 'Competitor'
                        : item.category === 'query'
                        ? lang === 'zh' ? '高潜问答' : 'Query Radar'
                        : item.category === 'sitemap'
                        ? lang === 'zh' ? '地图索引' : 'Sitemap'
                        : lang === 'zh' ? '实体消歧' : 'Entity'}
                    </span>
                    <h3 className={`text-sm font-semibold text-white ${item.completed ? 'line-through text-slate-400' : ''}`}>
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Action Trigger Button */}
              <div className="flex items-center gap-3 shrink-0 ml-8 md:ml-0">
                <div className="text-right hidden sm:block">
                  <div className="text-[11px] text-slate-400">{lang === 'zh' ? '预估影响度' : 'Impact'}</div>
                  <div className="text-xs font-bold text-amber-400">{item.impactScore} / 100</div>
                </div>

                <button
                  onClick={() => {
                    if (item.targetTab === 'generator' && onNavigateToDraft && item.prefillQuery) {
                      onNavigateToDraft(item.prefillQuery);
                    } else {
                      onNavigate(item.targetTab);
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    item.priority === 'P0'
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white'
                  }`}
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION B & C: TWO-COLUMN DEEP AGGREGATION VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6-Cols: Competitor Radar Breakdown */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Flame className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-white">
                    {lang === 'zh' ? '竞品 GEO 声量对比大盘' : 'Competitor Share of Model Breakdown'}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'zh' ? '横跨全网主流大模型信源提及度与引用胜率' : 'Multi-engine model citation share across key rivals'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('competitor')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
              >
                {lang === 'zh' ? '进入雷达' : 'Detail'} <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Competitor Visual Share Bars */}
            <div className="space-y-3.5 mb-6">
              {competitorData.competitors.map((comp) => {
                const isOwn = comp.isOwnBrand;
                return (
                  <div key={comp.brandName} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isOwn ? 'bg-indigo-500' : 'bg-slate-500'
                          }`}
                        ></span>
                        <span className={`font-semibold ${isOwn ? 'text-white font-bold' : 'text-slate-300'}`}>
                          {comp.brandName}
                        </span>
                        {isOwn && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {lang === 'zh' ? '我司' : 'Our Brand'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-slate-400 text-xs">
                        <span>{lang === 'zh' ? '胜率' : 'Win Rate'}: <strong className="text-slate-200">{comp.winRate}%</strong></span>
                        <span>{lang === 'zh' ? '声量' : 'Share'}: <strong className={isOwn ? 'text-indigo-400 text-sm' : 'text-slate-200'}>{comp.shareOfModel}%</strong></span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOwn
                            ? 'bg-gradient-to-r from-indigo-500 to-indigo-400 shadow-sm shadow-indigo-500/50'
                            : 'bg-slate-600'
                        }`}
                        style={{ width: `${comp.shareOfModel}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Blindspots Mini Alert */}
            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  {lang === 'zh' ? '竞品突破盲区与失守话题' : 'Rival Dominance & Blind Spots'}
                </span>
                <span className="text-[11px] text-slate-400">{competitorData.blindspots.length} {lang === 'zh' ? '个亟待反超' : 'Gaps'}</span>
              </div>
              <div className="space-y-2">
                {competitorData.blindspots.slice(0, 2).map((spot, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-slate-200 font-medium truncate">{spot.topic}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {lang === 'zh' ? '当前被' : 'Dominated by'} <span className="text-amber-300 font-semibold">{spot.winnerBrand}</span> {lang === 'zh' ? '独占' : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (onNavigateToDraft) {
                          onNavigateToDraft(spot.recommendedAction);
                        } else {
                          onNavigate('generator');
                        }
                      }}
                      className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-rose-200 border border-rose-500/30 rounded text-[11px] font-medium shrink-0 transition-colors"
                    >
                      {lang === 'zh' ? '击穿反超' : 'Intercept'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>{lang === 'zh' ? '上次评测周期: 2026-09-04 10:30' : 'Last Sweep: Today'}</span>
            <button
              onClick={() => onNavigate('competitor')}
              className="text-amber-400 hover:text-amber-300 font-medium"
            >
              {lang === 'zh' ? '启动新一轮竞品扫描' : 'Run Full Benchmark'}
            </button>
          </div>
        </div>

        {/* Right 6-Cols: Query Radar Opportunity Matrix */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Search className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-white">
                    {lang === 'zh' ? 'AI 搜索高潜问答机会矩阵' : 'High-Potential Query Radar Matrix'}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'zh' ? '大模型信源空白率高、搜索频次大的蓝海问题' : 'Queries with high prompt volume and major citation gaps'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('query_radar')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 shrink-0"
              >
                {lang === 'zh' ? '全景挖掘' : 'Explore All'} <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Query Intent Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 text-xs custom-scrollbar">
              <button
                onClick={() => setQueryIntentFilter('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all shrink-0 ${
                  queryIntentFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'zh' ? '全部' : 'All'}
              </button>
              <button
                onClick={() => setQueryIntentFilter('buying_decision')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all shrink-0 ${
                  queryIntentFilter === 'buying_decision'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'zh' ? '采购决策' : 'Buying Decision'}
              </button>
              <button
                onClick={() => setQueryIntentFilter('comparison')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all shrink-0 ${
                  queryIntentFilter === 'comparison'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'zh' ? '横向对比' : 'Comparison'}
              </button>
              <button
                onClick={() => setQueryIntentFilter('technical')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all shrink-0 ${
                  queryIntentFilter === 'technical'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'zh' ? '技术规范' : 'Technical'}
              </button>
              <button
                onClick={() => setQueryIntentFilter('pricing')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all shrink-0 ${
                  queryIntentFilter === 'pricing'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'zh' ? 'ROI与预算' : 'ROI / Pricing'}
              </button>
            </div>

            {/* Filtered Query Cards */}
            <div className="space-y-2.5">
              {filteredQueries.slice(0, 3).map((query) => {
                const isDrafting = draftingQueryId === query.id;
                const isDrafted = query.status === 'drafted';

                return (
                  <div
                    key={query.id}
                    className="p-3 bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/60 rounded-lg transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {query.intent}
                          </span>
                          <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                            {lang === 'zh' ? '空白缺口' : 'Gap'}: {query.citationGapRate}%
                          </span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            {lang === 'zh' ? '机会' : 'Opp'}: {query.geoOpportunityScore}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-white leading-snug">
                          {query.query}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-[10px] text-slate-400">{lang === 'zh' ? '引擎:' : 'Engines:'}</span>
                          {query.targetEngines.map((eng) => (
                            <span
                              key={eng}
                              className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700"
                            >
                              {eng}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleQuickDraft(query)}
                        disabled={isDrafting || isDrafted}
                        className={`px-3 py-1.5 rounded text-xs font-semibold shrink-0 transition-all flex items-center gap-1 ${
                          isDrafted
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30'
                        }`}
                      >
                        {isDrafting ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>{lang === 'zh' ? '生成中' : 'Drafting'}</span>
                          </>
                        ) : isDrafted ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>{lang === 'zh' ? '已生成草稿' : 'Drafted'}</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3 h-3" />
                            <span>{lang === 'zh' ? '⚡ 一键成稿' : '⚡ Draft'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>{lang === 'zh' ? `已发现 ${totalQueries} 个可直接转化问答` : `${totalQueries} queries ready for action`}</span>
            <button
              onClick={() => onNavigate('query_radar')}
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              {lang === 'zh' ? '查看全部高潜问答' : 'View All Queries'}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION D: TECHNICAL BASELINE & DUAL SITEMAP HEALTH */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Layers className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                {lang === 'zh' ? 'SEO 筑基与双轨 Sitemap 地图健康态' : 'Baseline SEO & Dual Sitemap Health'}
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {lang === 'zh' ? '全项通过 96/100' : '96/100 Passed'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'zh'
                  ? '保障传统蜘蛛与 AI 爬虫在毫秒内捕获站点内容，杜绝 SPA 白屏与参数重复收录'
                  : 'Ensuring zero CSR blank DOMs, canonical normalization, and dual-track XML + /llms.txt discovery.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSyncSitemapQuick}
              disabled={isSyncingSitemap}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSitemap ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{isSyncingSitemap ? (lang === 'zh' ? '同步中...' : 'Syncing...') : lang === 'zh' ? '立即刷新地图' : 'Sync Sitemap'}</span>
            </button>
            <button
              onClick={() => onNavigate('seo_foundation')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm shadow-emerald-600/30 transition-all flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'zh' ? '进入双轨地图控制台' : 'Dual Sitemap Hub'}</span>
            </button>
          </div>
        </div>

        {/* 6-Point Technical SEO Audit Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Item 1: Canonical */}
          <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/60 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white">Canonical 权威规范链接</div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                全站自动注入 rel="canonical"，彻底阻绝 URL 参数污染与镜像降权风险。
              </p>
            </div>
          </div>

          {/* Item 2: Meta Robots */}
          <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/60 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white">Meta Robots 抓取与富文本指令</div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                配置 index, follow 及 max-snippet:-1，保障大模型摘要提取无字数封顶。
              </p>
            </div>
          </div>

          {/* Item 3: SSR / Blank DOM */}
          <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/60 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white">SSR 纯静态 HTML 直出 (防白屏)</div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                首屏包含完整文章纯文本与 H1 语义标签，杜绝客户端 CSR 导致抓取到空白页。
              </p>
            </div>
          </div>

          {/* Item 4: /llms.txt */}
          <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/60 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white">双轨地图已链接 /llms.txt</div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                在 XML Sitemap 头部与根目录已挂载大语言模型专用知识索引入口。
              </p>
            </div>
          </div>

          {/* Item 5: Schema JSON-LD */}
          <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/60 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white">Schema.org TechArticle & FAQ 实体</div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                JSON-LD 语法规范校验 100% 合规，助力搜索引擎构建专业知识图谱。
              </p>
            </div>
          </div>

          {/* Item 6: OpenGraph */}
          <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/60 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white">OpenGraph 社交与多模态元数据</div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                包含 og:title, og:description 与 og:type，提升 AI 引用时的卡片预览质量。
              </p>
            </div>
          </div>
        </div>

        {/* Sitemap Summary Footnote */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>
              {lang === 'zh' ? 'Sitemap 地址:' : 'Sitemap URL:'}{' '}
              <code className="text-indigo-300 font-mono">{sitemapConfig.baseUrl}/sitemap.xml</code>
            </span>
          </div>
          <div>
            <span>{lang === 'zh' ? '上次自动更新:' : 'Last Synced:'} {sitemapConfig.lastGenerated || '刚刚'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
