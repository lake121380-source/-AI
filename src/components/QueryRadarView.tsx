import React, { useState, useEffect } from 'react';
import {
  Compass,
  Sparkles,
  Search,
  FileText,
  TrendingUp,
  Table,
  CheckCircle2,
  Cpu,
  ArrowRight,
  Filter,
  Check,
  Zap,
} from 'lucide-react';
import { GeoQueryRadarItem, Article } from '../types';
import { initialRadarQueries } from '../data/mockData';

interface QueryRadarViewProps {
  lang: 'zh' | 'en';
  onArticleCreated?: (newArticle: Article) => void;
  onOpenArticleModal?: (article: Article) => void;
}

export const QueryRadarView: React.FC<QueryRadarViewProps> = ({
  lang,
  onArticleCreated,
  onOpenArticleModal,
}) => {
  const [queries, setQueries] = useState<GeoQueryRadarItem[]>(initialRadarQueries);
  const [activeIntent, setActiveIntent] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [loadingQueryId, setLoadingQueryId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/query-radar')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setQueries(data);
      })
      .catch((err) => console.warn('Fetch query radar error:', err));
  }, []);

  const handleGenerateDraft = async (queryItem: GeoQueryRadarItem) => {
    setLoadingQueryId(queryItem.id);
    try {
      const res = await fetch('/api/query-radar/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryId: queryItem.id }),
      });
      if (res.ok) {
        const result = await res.json();
        setQueries((prev) =>
          prev.map((q) => (q.id === queryItem.id ? { ...q, status: 'drafted' } : q))
        );
        if (onArticleCreated && result.article) {
          onArticleCreated(result.article);
        }
        showToast(
          lang === 'zh'
            ? `已成功生成《${result.article.title}》GEO 标准草稿！`
            : `Draft created: ${result.article.title}!`
        );
        if (onOpenArticleModal && result.article) {
          onOpenArticleModal(result.article);
        }
      }
    } catch (e) {
      console.error('Generate draft error:', e);
    } finally {
      setLoadingQueryId(null);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const filteredQueries = queries.filter((q) => {
    const matchesIntent = activeIntent === 'all' || q.intent === activeIntent;
    const matchesSearch =
      !searchFilter.trim() ||
      q.query.toLowerCase().includes(searchFilter.toLowerCase()) ||
      q.recommendedStructure.titleTemplate.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesIntent && matchesSearch;
  });

  const avgGap = Math.round(
    queries.reduce((acc, q) => acc + q.citationGapRate, 0) / queries.length
  );
  const avgOpportunity = Math.round(
    queries.reduce((acc, q) => acc + q.geoOpportunityScore, 0) / queries.length
  );

  return (
    <div className="space-y-6" id="query-radar-container">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          id="query-radar-toast"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 shadow-lg dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-950/60 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-800/50">
              <Compass className="h-3.5 w-3.5" />
              {lang === 'zh' ? '模块 B · 高潜问答挖掘' : 'Module B · Intent Query Radar'}
            </span>
            <span className="text-xs text-slate-400">
              {lang === 'zh' ? '实时连接 Perplexity、SearchGPT、Kimi' : 'Live intent feeds'}
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            {lang === 'zh' ? 'AI 搜索高潜问答挖掘器' : 'AI Search Intent Query Radar'}
          </h2>
          <p className="text-sm text-slate-300">
            {lang === 'zh'
              ? '发掘真实用户在主流大语言模型中高频提问、但现有网络信源质量极低（高引用缺口率）的黄金决策问题，一键生成结构化内容！'
              : 'Discover high-volume, low-competition decision queries asked by real users on LLMs.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-slate-800 bg-slate-800/50 px-3.5 py-2 text-center">
            <div className="text-xs text-slate-400">{lang === 'zh' ? '平均引用缺口' : 'Avg Citation Gap'}</div>
            <div className="text-base font-bold text-amber-400">{avgGap}%</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-800/50 px-3.5 py-2 text-center">
            <div className="text-xs text-slate-400">{lang === 'zh' ? '平均获客潜能' : 'Opportunity Score'}</div>
            <div className="text-base font-bold text-indigo-400">{avgOpportunity}/100</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: lang === 'zh' ? '全部场景' : 'All Queries' },
            { id: 'buying_decision', label: lang === 'zh' ? '选型落地' : 'Decisions' },
            { id: 'comparison', label: lang === 'zh' ? '方案对比' : 'Comparisons' },
            { id: 'technical', label: lang === 'zh' ? '原理解析' : 'Technical' },
            { id: 'pricing', label: lang === 'zh' ? '成本与ROI' : 'Pricing & ROI' },
            { id: 'faq', label: lang === 'zh' ? '常见疑难' : 'FAQ' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveIntent(item.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeIntent === item.id
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={lang === 'zh' ? '筛选查询词或标题...' : 'Search query keywords...'}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Query Cards */}
      <div className="space-y-4">
        {filteredQueries.map((q) => (
          <div
            key={q.id}
            id={`query-card-${q.id}`}
            className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm transition hover:border-slate-700"
          >
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              <div className="space-y-2.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-bold text-white">
                    {q.query}
                  </span>
                  <span className="rounded bg-indigo-950/60 border border-indigo-800/50 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                    {q.intent === 'buying_decision'
                      ? lang === 'zh'
                        ? '选型决策'
                        : 'Decision'
                      : q.intent === 'comparison'
                      ? lang === 'zh'
                        ? '横向对比'
                        : 'Comparison'
                      : q.intent === 'technical'
                      ? lang === 'zh'
                        ? '技术架构'
                        : 'Technical'
                      : q.intent === 'pricing'
                      ? lang === 'zh'
                        ? '成本与ROI'
                        : 'Pricing'
                      : 'FAQ'}
                  </span>
                  {q.status === 'drafted' && (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      <Check className="h-3 w-3" />
                      {lang === 'zh' ? '已转写为草稿' : 'Drafted'}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
                    <span>{lang === 'zh' ? '提问热度: ' : 'Volume: '}</span>
                    <strong className="text-slate-200">{q.searchVolumeScore}</strong>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                    <span>{lang === 'zh' ? '引用缺口率: ' : 'Citation Gap: '}</span>
                    <strong className="text-amber-400">{q.citationGapRate}% (竞争空白)</strong>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    <span>{lang === 'zh' ? 'GEO 机会指数: ' : 'GEO Opportunity: '}</span>
                    <strong className="text-indigo-400">{q.geoOpportunityScore}/100</strong>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{lang === 'zh' ? '高发平台: ' : 'Engines: '}</span>
                    <span className="text-slate-300">{q.targetEngines.join(', ')}</span>
                  </div>
                </div>

                {/* Structured Blueprint Box */}
                <div className="rounded-lg border border-slate-800 bg-slate-800/40 p-3.5">
                  <div className="text-xs font-semibold text-slate-300">
                    {lang === 'zh' ? '💡 推荐 GEO 文章架构蓝图：' : '💡 Recommended GEO Content Blueprint:'}
                  </div>
                  <div className="mt-1.5 text-xs text-white font-medium">
                    {q.recommendedStructure.titleTemplate}
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-2 text-[11px] text-slate-400 sm:grid-cols-2">
                    <div>
                      <span className="font-semibold text-slate-300">
                        {lang === 'zh' ? '必填事实表格: ' : 'Required Table: '}
                      </span>
                      {q.recommendedStructure.requiredTable}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-300">
                        {lang === 'zh' ? 'Schema 实体: ' : 'Schema Microdata: '}
                      </span>
                      {q.recommendedStructure.schemaType}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 pt-2 lg:pt-0">
                <button
                  id={`btn-draft-${q.id}`}
                  onClick={() => handleGenerateDraft(q)}
                  disabled={loadingQueryId === q.id}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition disabled:opacity-50 sm:w-auto cursor-pointer"
                >
                  <FileText className={`h-3.5 w-3.5 ${loadingQueryId === q.id ? 'animate-spin' : ''}`} />
                  {loadingQueryId === q.id
                    ? lang === 'zh'
                      ? '智能转写标准草稿中...'
                      : 'Converting to Draft...'
                    : q.status === 'drafted'
                    ? lang === 'zh'
                      ? '重新生成/查看草稿'
                      : 'Regenerate Draft'
                    : lang === 'zh'
                    ? '一键转写为 GEO 标准草稿'
                    : 'Convert to GEO Draft'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
