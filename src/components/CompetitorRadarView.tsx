import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  TrendingUp,
  Award,
  Sparkles,
  RefreshCw,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Flame,
  FileText,
  Building2,
  Cpu,
  Layers,
} from 'lucide-react';
import { CompetitorComparisonResult, CompetitorBenchmarkItem, CompetitorBlindspot } from '../types';
import { initialCompetitorComparison } from '../data/mockData';

interface CompetitorRadarViewProps {
  lang: 'zh' | 'en';
  onNavigateToDraft?: (topic: string) => void;
}

export const CompetitorRadarView: React.FC<CompetitorRadarViewProps> = ({
  lang,
  onNavigateToDraft,
}) => {
  const [data, setData] = useState<CompetitorComparisonResult>(initialCompetitorComparison);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompetitorName, setNewCompetitorName] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'dimensions' | 'blindspots'>('overview');
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/competitor/benchmark')
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData) setData(resData);
      })
      .catch((err) => console.warn('Fetch competitor benchmark error:', err));
  }, []);

  const handleRefreshBenchmark = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/competitor/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: data.industry }),
      });
      if (res.ok) {
        const updated = await res.json();
        setData(updated);
        showAlert(lang === 'zh' ? '已完成全网 AI 搜索声量最新轮次扫描评测！' : 'Completed latest AI search benchmark sweep!');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCompetitor = async () => {
    if (!newCompetitorName.trim()) return;
    setIsLoading(true);
    const existingNames = data.competitors.filter((c) => !c.isOwnBrand).map((c) => c.brandName);
    const updatedNames = [...existingNames, newCompetitorName.trim()];

    try {
      const res = await fetch('/api/competitor/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: data.industry,
          customCompetitors: updatedNames,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setData(updated);
        setNewCompetitorName('');
        setShowAddModal(false);
        showAlert(lang === 'zh' ? `已将竞品【${newCompetitorName}】加入监控雷达并完成重算！` : `Added ${newCompetitorName} to tracking radar!`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const showAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 3500);
  };

  const ownBrand = data.competitors.find((c) => c.isOwnBrand) || data.competitors[0];

  return (
    <div className="space-y-6" id="competitor-radar-container">
      {/* Toast alert */}
      {alertMsg && (
        <div
          id="competitor-radar-toast"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 shadow-lg dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-950/60 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-800/50">
              <Sparkles className="h-3.5 w-3.5" />
              {lang === 'zh' ? '模块 A · 竞品声量雷达' : 'Module A · Competitor Radar'}
            </span>
            <span className="text-xs text-slate-400">
              {lang === 'zh' ? `上次评测: ${data.simulatedAt}` : `Last sweep: ${data.simulatedAt}`}
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            {lang === 'zh' ? '竞品 GEO 声量对比雷达' : 'Competitor GEO Voice & Citation Radar'}
          </h2>
          <p className="text-sm text-slate-300">
            {lang === 'zh'
              ? '实时监控大语言模型（Perplexity / SearchGPT / Gemini / Kimi）在行业关键问答中的品牌推荐占比与盲区。'
              : 'Track Share of Model across major LLMs, head-to-head citation win rates, and blindspots.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-add-competitor"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            {lang === 'zh' ? '添加监控竞品' : 'Add Competitor'}
          </button>

          <button
            id="btn-rescan-radar"
            onClick={handleRefreshBenchmark}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading
              ? lang === 'zh'
                ? '大模型交叉推演中...'
                : 'Evaluating Engines...'
              : lang === 'zh'
              ? '全网声量重新扫描'
              : 'Sweep Voice Share'}
          </button>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">{lang === 'zh' ? '我方模型推荐胜率 (Win Rate)' : 'Our Win Rate'}</span>
            <Award className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-white">
              {ownBrand.winRate}%
            </span>
            <span className="text-xs font-medium text-emerald-400">
              +{Number((ownBrand.winRate - 50).toFixed(1))}% vs 均线
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {lang === 'zh' ? '在测试行业提问中被首位或次位权威推荐的概率' : 'Probability of top-tier recommendation'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">{lang === 'zh' ? '模型声量占有率 (Share of Model)' : 'Share of Model'}</span>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-indigo-400">
              {ownBrand.shareOfModel}%
            </span>
            <span className="rounded bg-indigo-500/20 border border-indigo-500/30 px-1.5 py-0.5 text-xs font-medium text-indigo-300">
              {lang === 'zh' ? '全行业第 1 名' : 'Rank #1'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {lang === 'zh' ? '总引用权重领先竞品最高者 +17.8%' : 'Leads closest competitor by +17.8%'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">{lang === 'zh' ? '平均引用推荐顺位' : 'Avg Citation Rank'}</span>
            <Building2 className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-white">
              #{ownBrand.avgCitationRank}
            </span>
            <span className="text-xs font-medium text-emerald-400">
              {lang === 'zh' ? '前置推荐' : 'Front placement'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {lang === 'zh' ? '多模型平均在回答第 1~2 段即作为事实出处引用' : 'Cited in first two paragraphs'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">{lang === 'zh' ? '待攻坚知识盲区' : 'Identified Blindspots'}</span>
            <ShieldAlert className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-amber-400">
              {data.blindspots.length}
            </span>
            <span className="text-xs font-medium text-slate-400">
              {lang === 'zh' ? '处竞品优势场景' : 'competitor leads'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {lang === 'zh' ? '竞品被大模型广泛采纳但我方缺席的细分赛道' : 'Topics where competitors get cited instead'}
          </p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          id="tab-benchmark-overview"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          {lang === 'zh' ? '品牌声量大盘对比' : 'Voice & Citation Matrix'}
        </button>

        <button
          id="tab-benchmark-dimensions"
          onClick={() => setActiveTab('dimensions')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === 'dimensions'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Cpu className="h-3.5 w-3.5" />
          {lang === 'zh' ? '多维横向硬核对决 (5大指标)' : 'Head-to-Head Dimensions'}
        </button>

        <button
          id="tab-benchmark-blindspots"
          onClick={() => setActiveTab('blindspots')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === 'blindspots'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Flame className="h-3.5 w-3.5 text-amber-500" />
          {lang === 'zh' ? `竞品优势盲区攻坚 (${data.blindspots.length})` : `Blindspots & Counteractions (${data.blindspots.length})`}
        </button>
      </div>

      {/* TAB 1: OVERVIEW TABLE */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90 shadow-sm">
            <div className="border-b border-slate-800 bg-slate-800/60 px-5 py-3">
              <h3 className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
                {lang === 'zh' ? '全网 AI 搜索声量与胜率排行榜' : 'LLM Citation & Share of Model Benchmark'}
              </h3>
            </div>
            <div className="divide-y divide-slate-800">
              {data.competitors.map((comp) => (
                <div
                  key={comp.brandName}
                  className={`p-5 transition-colors ${
                    comp.isOwnBrand
                      ? 'bg-indigo-950/20'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1 lg:max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {comp.brandName}
                        </span>
                        {comp.isOwnBrand && (
                          <span className="rounded bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                            {lang === 'zh' ? '我方品牌' : 'OUR BRAND'}
                          </span>
                        )}
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                            comp.sentiment === 'positive'
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                              : comp.sentiment === 'neutral'
                              ? 'bg-slate-800 text-slate-300 border border-slate-700'
                              : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {comp.sentiment === 'positive'
                            ? lang === 'zh'
                              ? '积极推荐'
                              : 'Positive'
                            : comp.sentiment === 'neutral'
                            ? lang === 'zh'
                              ? '客观中立'
                              : 'Neutral'
                            : lang === 'zh'
                            ? '警示提及'
                            : 'Critical'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {lang === 'zh' ? '高频引用场景: ' : 'Top topics: '}
                        {comp.topCitedTopics.join(' · ')}
                      </p>
                    </div>

                    {/* Bars for Share of Model & Win Rate */}
                    <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-md">
                      <div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-400">
                            {lang === 'zh' ? '声量占比 (Share of Model)' : 'Share of Model'}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {comp.shareOfModel}%
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className={`h-full rounded-full ${
                              comp.isOwnBrand ? 'bg-indigo-600' : 'bg-slate-400 dark:bg-slate-600'
                            }`}
                            style={{ width: `${comp.shareOfModel}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-400">
                            {lang === 'zh' ? '问答首推胜率' : 'Win Rate'}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {comp.winRate}%
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className={`h-full rounded-full ${
                              comp.isOwnBrand ? 'bg-emerald-500' : 'bg-amber-400'
                            }`}
                            style={{ width: `${comp.winRate}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Strengths & Weaknesses Chips */}
                    <div className="flex flex-col gap-1.5 text-xs lg:w-72">
                      <div className="flex items-start gap-1 text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        <span className="line-clamp-1">{comp.strengths.join(', ')}</span>
                      </div>
                      <div className="flex items-start gap-1 text-slate-500 dark:text-slate-400">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
                        <span className="line-clamp-1">{comp.weaknesses.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HEAD TO HEAD DIMENSIONS */}
      {activeTab === 'dimensions' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-white">
              {lang === 'zh' ? '5 大 GEO 关键工程指标硬核对决' : '5 Core Engineering Metrics Comparison'}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              {lang === 'zh'
                ? '通过对主流 AI 搜索引擎爬虫协议、Schema.org 解析率与 GFM 表格召回率进行标准化评分 (0-100)。'
                : 'Standardized 0-100 benchmark across crawler friendliness, schema parity and structured content.'}
            </p>

            <div className="mt-6 space-y-6">
              {data.headToHead.map((dim, idx) => (
                <div key={idx} className="space-y-2 rounded-lg border border-slate-800/80 bg-slate-800/40 p-4">
                  <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                    <span className="font-semibold text-white text-sm">
                      {dim.dimension}
                    </span>
                    <span className="rounded bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-xs font-medium text-indigo-300">
                      {dim.verdict}
                    </span>
                  </div>

                  <div className="space-y-2 pt-2">
                    {/* Own Brand */}
                    <div className="flex items-center gap-3 text-xs">
                      <span className="w-36 shrink-0 font-medium text-indigo-400">
                        {ownBrand.brandName}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-indigo-600"
                          style={{ width: `${dim.ownScore}%` }}
                        />
                      </div>
                      <span className="w-10 text-right font-bold text-white">
                        {dim.ownScore}分
                      </span>
                    </div>

                    {/* Competitors */}
                    {Object.entries(dim.compScores).map(([compName, score]) => (
                      <div key={compName} className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="w-36 shrink-0 truncate">{compName}</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-slate-600"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="w-10 text-right font-medium">{score}分</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BLINDSPOTS & COUNTERACTION */}
      {activeTab === 'blindspots' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-900/50 bg-amber-950/20 p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
              <div>
                <h4 className="text-sm font-semibold text-amber-200">
                  {lang === 'zh' ? '高潜知识盲区：竞品领先但我方缺席的场景' : 'Knowledge Blindspots: Where Competitors Win'}
                </h4>
                <p className="mt-0.5 text-xs text-amber-300">
                  {lang === 'zh'
                    ? '大语言模型在回答以下主题时，大量引用了竞品发布的内容，而我方知识库中尚未建立针对性的事实切片与对比表格。点击“一键生成反制白皮书”即可立即在内容库补齐这一知识缺口！'
                    : 'LLMs currently cite competitor resources for these topics. Click generate to create counter-whitepapers with structured tables and FAQs.'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {data.blindspots.map((b, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm transition-all hover:border-slate-700 md:flex-row md:items-center"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-white text-sm">
                      {b.topic}
                    </span>
                    <span className="rounded bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                      {lang === 'zh' ? `优势竞品: ${b.winnerBrand}` : `Leader: ${b.winnerBrand}`}
                    </span>
                    <span className="rounded bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                      {lang === 'zh' ? `影响指数 ${b.impactScore}` : `Impact ${b.impactScore}`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    <strong className="text-slate-200">
                      {lang === 'zh' ? '建议反制策略: ' : 'Recommended Action: '}
                    </strong>
                    {b.recommendedAction}
                  </p>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => {
                      if (onNavigateToDraft) {
                        onNavigateToDraft(b.topic);
                      } else {
                        showAlert(lang === 'zh' ? `已启动《${b.topic}》的反制草稿生成！` : `Draft generated for ${b.topic}!`);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    {lang === 'zh' ? '一键生成反制白皮书' : 'Generate Counter Draft'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add competitor modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              {lang === 'zh' ? '添加监控竞品品牌' : 'Add Competitor Brand'}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              {lang === 'zh'
                ? '输入竞品公司名称或产品名，系统将调度大模型抓取该竞品在 AI 搜索中的引用声量。'
                : 'Enter competitor name to benchmark citation shares and sentiment across LLMs.'}
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-300">
                {lang === 'zh' ? '竞品品牌/产品名称' : 'Competitor Brand Name'}
              </label>
              <input
                type="text"
                value={newCompetitorName}
                onChange={(e) => setNewCompetitorName(e.target.value)}
                placeholder={lang === 'zh' ? '例如: 某某营销云 / ABC-SaaS' : 'e.g. Acme CRM / Competitor X'}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition cursor-pointer"
              >
                {lang === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                onClick={handleAddCompetitor}
                disabled={!newCompetitorName.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer"
              >
                {lang === 'zh' ? '确认添加并评测' : 'Add & Benchmark'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
