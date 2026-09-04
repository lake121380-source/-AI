import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  MousePointerClick,
  Filter,
  Users,
  DollarSign,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { AiReferralSourceMetric, AiTrafficFunnelStage, UtmCampaignPreset } from '../types';
import {
  initialAiReferralSources,
  initialTrafficFunnelStages,
  initialUtmPresets,
} from '../data/mockData';

interface AiAttributionFunnelViewProps {
  lang: 'zh' | 'en';
}

export const AiAttributionFunnelView: React.FC<AiAttributionFunnelViewProps> = ({ lang }) => {
  const [sources, setSources] = useState<AiReferralSourceMetric[]>(initialAiReferralSources);
  const [funnel, setFunnel] = useState<AiTrafficFunnelStage[]>(initialTrafficFunnelStages);
  const [utmPresets, setUtmPresets] = useState<UtmCampaignPreset[]>(initialUtmPresets);
  const [summary, setSummary] = useState({
    totalClicks: 13850,
    totalInquiries: 462,
    totalPipeline: 1845000,
    avgConversionRate: 3.34,
  });

  // UTM generator states
  const [campaignName, setCampaignName] = useState('GEO白皮书-AI引用');
  const [targetEngine, setTargetEngine] = useState('Perplexity AI');
  const [landingPage, setLandingPage] = useState('https://tongzhuo-geo.local/articles/hubspot-vs-crm-geo-content-trust');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/attribution/funnel')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.sources) setSources(data.sources);
          if (data.funnel) setFunnel(data.funnel);
          if (data.utmPresets) setUtmPresets(data.utmPresets);
          if (data.summary) setSummary(data.summary);
        }
      })
      .catch((err) => console.warn('Fetch attribution error:', err));
  }, []);

  const handleGenerateUtm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim() || !landingPage.trim()) return;

    try {
      const res = await fetch('/api/attribution/utm-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignName, targetEngine, landingPage }),
      });
      if (res.ok) {
        const newPreset = await res.json();
        setUtmPresets((prev) => [newPreset, ...prev]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyLink = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6" id="attribution-funnel-container">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
              <TrendingUp className="h-3.5 w-3.5" />
              {lang === 'zh' ? '阶段 3 · 价值闭环' : 'Phase 3 · Business Value'}
            </span>
            <span className="text-xs text-slate-400">
              {lang === 'zh' ? 'AI 流量引流归因与高意向商机转化全链路' : 'AI Referral & Conversion Funnel'}
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            {lang === 'zh' ? 'AI 引流归因与咨询转化漏斗分析' : 'AI Referral Attribution & Conversion Funnel'}
          </h2>
          <p className="text-sm text-slate-400">
            {lang === 'zh'
              ? '做好官网 SEO 与 GEO 优化的终极目的，是捕获来自 Perplexity、ChatGPT、Kimi 等新一代生成式引擎的高意向商业流量，并精准归因至线索与成单。'
              : 'Track and attribute every high-intent visit referred by Perplexity, SearchGPT, Kimi, and Gemini citations directly into revenue pipeline.'}
          </p>
        </div>
      </div>

      {/* KPI Cards with Tabular Nums */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              {lang === 'zh' ? '大模型引用带来独立访客' : 'AI Referral Visits'}
            </span>
            <MousePointerClick className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono tabular-nums">
            {summary.totalClicks.toLocaleString()}
          </div>
          <p className="mt-1 text-xs text-emerald-400 font-mono tabular-nums">
            ↑ 48.5% {lang === 'zh' ? '较传统自然搜索增幅' : 'vs Organic Search'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              {lang === 'zh' ? 'AI 意向商机与咨询数' : 'Qualified AI Leads'}
            </span>
            <Users className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono tabular-nums">
            {summary.totalInquiries.toLocaleString()}
          </div>
          <p className="mt-1 text-xs text-indigo-400">
            {lang === 'zh' ? '高意向精准决策者' : 'High Purchase Intent'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              {lang === 'zh' ? '平均咨询转化率' : 'Avg Conversion Rate'}
            </span>
            <Filter className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono tabular-nums">
            {summary.avgConversionRate}%
          </div>
          <p className="mt-1 text-xs text-slate-400 font-mono tabular-nums">
            {lang === 'zh' ? '传统SEO引流通常仅为 1.1%' : 'Industry benchmark ~1.1%'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              {lang === 'zh' ? '已促成商机管道金额' : 'Influenced Pipeline'}
            </span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            ¥{(summary.totalPipeline / 10000).toFixed(1)}万
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {lang === 'zh' ? '累计 18 个企业级合同' : '18 enterprise contracts'}
          </p>
        </div>
      </div>

      {/* 5-Stage Visual Conversion Funnel with High Contrast */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">
              {lang === 'zh' ? 'AI 引用全链路转化漏斗' : 'End-to-End AI Citation Funnel'}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              {lang === 'zh'
                ? '从大模型生成答案中曝光 [1] 引用角标，到用户点击回流并最终留下咨询联系方式的全流程损耗分析。'
                : 'Step-by-step conversion drop-off analysis from AI citation answer impression to business lead.'}
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold font-mono tabular-nums">
            {lang === 'zh' ? '综合转化率 3.34%' : '3.34% Overall'}
          </span>
        </div>

        <div className="mt-6 space-y-3">
          {funnel.map((stage, idx) => {
            const widthPct = Math.max(12, Math.round((stage.count / (funnel[0]?.count || 1)) * 100));
            const uniqueStageKey = `funnel-stage-${idx}-${stage.stage}`;
            return (
              <div key={uniqueStageKey} className="space-y-1 text-xs">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-[10px] text-slate-300 font-semibold">
                      {idx + 1}
                    </span>
                    <span>{stage.stage}</span>
                  </span>
                  <div className="flex items-center gap-3 font-mono tabular-nums">
                    <span className="font-bold text-white">
                      {stage.count.toLocaleString()} 次
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      (环节转化率 {stage.conversionRateFromPrev}%)
                    </span>
                  </div>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Breakdown by AI Source with Tabular Nums */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-white">
          {lang === 'zh' ? '各 AI 搜索引擎引流与成单贡献榜' : 'Traffic & Inquiries by Engine'}
        </h3>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400">
              <tr>
                <th className="pb-3 font-semibold">{lang === 'zh' ? '搜索引擎来源' : 'Engine'}</th>
                <th className="pb-3 font-semibold font-mono">{lang === 'zh' ? '引流点击数' : 'Clicks'}</th>
                <th className="pb-3 font-semibold font-mono">{lang === 'zh' ? '平均停留时间' : 'Dwell Time'}</th>
                <th className="pb-3 font-semibold font-mono">{lang === 'zh' ? '意向咨询数' : 'Inquiries'}</th>
                <th className="pb-3 font-semibold font-mono">{lang === 'zh' ? '咨询转化率' : 'Conv. Rate'}</th>
                <th className="pb-3 font-semibold font-mono">{lang === 'zh' ? '促成商机金额' : 'Pipeline'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {sources.map((item, idx) => {
                const uniqueSourceKey = `source-engine-${idx}-${item.engine}`;
                return (
                  <tr key={uniqueSourceKey} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.iconColor || '#6366f1' }}
                        />
                        <span>{item.engine}</span>
                      </div>
                    </td>
                    <td className="py-3 font-semibold text-indigo-400 font-mono tabular-nums">
                      {item.referralClicks.toLocaleString()}
                    </td>
                    <td className="py-3 font-mono tabular-nums">{item.avgDwellSeconds} 秒</td>
                    <td className="py-3 font-bold text-white font-mono tabular-nums">
                      {item.inquiriesGenerated}
                    </td>
                    <td className="py-3 font-mono tabular-nums">
                      <span className="rounded bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                        {item.conversionRate}%
                      </span>
                    </td>
                    <td className="py-3 font-medium text-emerald-400 font-mono tabular-nums">
                      ¥{(item.pipelineRevenue / 10000).toFixed(1)}万
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* UTM Campaign Generator for AI Citation */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-white">
          {lang === 'zh' ? 'AI 引用专用 UTM 跟踪短链生成器' : 'AI Citation UTM Tracking Link Generator'}
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          {lang === 'zh'
            ? '将带专属追踪标签的落地页链接嵌入 /llms.txt 或发布在白皮书中，大模型在引用该文章时将保留这些参数，从而在 Google Analytics 或神策数据中准确追踪 AI 来源。'
            : 'Generate standardized URLs tagged with utm_medium=ai_citation to track attribution across your analytics platform.'}
        </p>

        <form onSubmit={handleGenerateUtm} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
          <div>
            <label className="font-semibold text-slate-300">
              {lang === 'zh' ? '推广活动 / 页面名称' : 'Campaign Name'}
            </label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300">
              {lang === 'zh' ? '目标大模型搜索引擎' : 'Target AI Engine'}
            </label>
            <select
              value={targetEngine}
              onChange={(e) => setTargetEngine(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none transition"
            >
              <option value="Perplexity AI">Perplexity AI</option>
              <option value="OpenAI SearchGPT">OpenAI SearchGPT</option>
              <option value="Kimi (Moonshot)">Kimi (月之暗面)</option>
              <option value="Google Gemini">Google Gemini</option>
              <option value="Claude 3.7">Claude 3.7</option>
              <option value="ByteDance Doubao">字节跳动 豆包</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-sm transition cursor-pointer"
            >
              {lang === 'zh' ? '生成带标追踪链接' : 'Generate Tracked URL'}
            </button>
          </div>
        </form>

        {/* List of active UTM campaigns with Tabular Nums */}
        <div className="mt-6 space-y-2">
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {lang === 'zh' ? '已生成的 AI 引流监测预设：' : 'Generated AI Presets:'}
          </h4>
          {utmPresets.map((preset, idx) => {
            const uniqueUtmKey = `utm-preset-${preset.id || idx}-${preset.campaignName}`;
            return (
              <div
                key={uniqueUtmKey}
                className="flex flex-col gap-2 rounded-lg border border-slate-100 p-3 text-xs dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-0.5 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {preset.campaignName}
                    </span>
                    <span className="rounded bg-indigo-50 px-1.5 py-0.2 text-[10px] text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {preset.targetEngine}
                    </span>
                  </div>
                  <div className="truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {preset.fullUtmUrl}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                    {preset.generatedClicks} 点击 · {preset.inquiries} 咨询
                  </div>
                  <button
                    onClick={() => handleCopyLink(preset.fullUtmUrl, preset.id || `utm-${idx}`)}
                    className="inline-flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {copiedId === (preset.id || `utm-${idx}`) ? (
                      <Check className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    {copiedId === (preset.id || `utm-${idx}`)
                      ? lang === 'zh'
                        ? '已复制'
                        : 'Copied'
                      : lang === 'zh'
                      ? '复制链接'
                      : 'Copy'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
