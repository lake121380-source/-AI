import React, { useState } from 'react';
import { BarChart3, Bot, TrendingUp, Eye, Globe, ShieldCheck, Zap, Layers, Sparkles } from 'lucide-react';
import { AnalyticsOverview } from '../types';
import { GeoPerformanceDashboard } from './GeoPerformanceDashboard';

interface AnalyticsViewProps {
  analytics: AnalyticsOverview;
  lang: 'zh' | 'en';
  defaultSubView?: 'geo-performance' | 'crawlers';
  onNavigateToArticle?: (slugOrTitle: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analytics,
  lang,
  defaultSubView = 'geo-performance',
  onNavigateToArticle,
}) => {
  const [activeSubView, setActiveSubView] = useState<'geo-performance' | 'crawlers'>(defaultSubView);

  return (
    <div className="space-y-6">
      {/* Top Navigation Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubView('geo-performance')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubView === 'geo-performance'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Zap className="w-4 h-4 text-rose-300" />
            <span>{lang === 'zh' ? 'GEO 引擎表现大盘' : 'GEO Performance'}</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-white/20 text-white font-bold ml-1">
              PRO
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubView('crawlers')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubView === 'crawlers'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Bot className="w-4 h-4 text-amber-300" />
            <span>{lang === 'zh' ? 'AI 爬虫画像与日志' : 'Crawler Telemetry'}</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-mono hidden md:block">
          {activeSubView === 'geo-performance'
            ? lang === 'zh'
              ? '实时收录大模型：Perplexity · ChatGPT · Gemini · Claude · DeepSeek'
              : 'Indexed Engines: Perplexity · ChatGPT · Gemini · Claude · DeepSeek'
            : lang === 'zh'
            ? '日志监控：GPTBot · ClaudeBot · Bytespider · PerplexityBot'
            : 'Bot Telemetry: GPTBot · ClaudeBot · Bytespider'}
        </div>
      </div>

      {/* Sub-view 1: GEO Performance Metrics Dashboard */}
      {activeSubView === 'geo-performance' && (
        <GeoPerformanceDashboard lang={lang} onNavigateToArticle={onNavigateToArticle} />
      )}

      {/* Sub-view 2: AI Crawler Telemetry & Access Overview */}
      {activeSubView === 'crawlers' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-rose-500" />
              {lang === 'zh' ? '数据观测与 AI 爬虫画像' : 'Analytics & AI Crawler Telemetry'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'zh'
                ? '精准监控各大生成式 AI 搜索引擎爬虫（GPTBot、ClaudeBot 等）对站内信源的访问频次与引用表现。'
                : 'Track bot requests from GPTBot, ClaudeBot, Perplexity and observe citation rates.'}
            </p>
          </div>

          {/* Top Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">{lang === 'zh' ? '全网累计访问 (PV)' : 'Total Pageviews'}</div>
              <div className="text-2xl font-black text-white">{analytics.totalPvs.toLocaleString()}</div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>+14.2% {lang === 'zh' ? '环比上周' : 'vs last week'}</span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">{lang === 'zh' ? '独立访客 (UV)' : 'Unique Visitors'}</div>
              <div className="text-2xl font-black text-white">{analytics.totalUvs.toLocaleString()}</div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>+9.8% {lang === 'zh' ? '环比上周' : 'vs last week'}</span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">{lang === 'zh' ? 'AI 爬虫抓取总量' : 'AI Crawler Hits'}</div>
              <div className="text-2xl font-black text-rose-400">{analytics.aiCrawlersCount.toLocaleString()}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                {lang === 'zh' ? '占总请求约 14%' : '~14% of total traffic'}
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">{lang === 'zh' ? '今日生成文章' : 'Articles Today'}</div>
              <div className="text-2xl font-black text-indigo-400">{analytics.articlesGeneratedToday}</div>
              <div className="text-[11px] text-indigo-400 mt-1">
                {lang === 'zh' ? '流水线自动完成' : 'Auto-generated'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: AI Crawler Breakdown (6 cols) */}
            <div className="lg:col-span-6 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-rose-400" />
                  <span>{lang === 'zh' ? 'AI 搜索爬虫分布画像' : 'AI Crawler Breakdown'}</span>
                </h3>
                <span className="text-[11px] text-slate-400">User-Agent Log Telemetry</span>
              </div>

              <div className="space-y-3 pt-1">
                {analytics.crawlerBreakdown.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">{item.name}</span>
                      <span className="font-mono text-slate-400">
                        {item.count.toLocaleString()} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                <strong className="text-slate-300">{lang === 'zh' ? 'GEO 优化洞察：' : 'GEO Insight: '}</strong>
                {lang === 'zh'
                  ? 'GPTBot 与 ClaudeBot 的抓取深度集中在已发布的 Markdown 结构化页面与 /llms.txt。建议保持每日更新频次以提升索引新鲜度。'
                  : 'GPTBot and ClaudeBot target pure Markdown URLs and /llms.txt. Keep content updated for fresh citation share.'}
              </div>
            </div>

            {/* Right Column: Top Cited Articles (6 cols) */}
            <div className="lg:col-span-6 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'zh' ? 'AI 大模型高频引用内容' : 'Top Cited by AI Engines'}</span>
                </h3>
                <span className="text-[11px] text-slate-400">{lang === 'zh' ? '引用预估' : 'Est. Citations'}</span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {analytics.topArticles.map((art, idx) => (
                  <div key={art.title} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                        0{idx + 1}
                      </span>
                      <div className="text-xs font-bold text-slate-200 line-clamp-1">{art.title}</div>
                    </div>
                    <div className="flex items-center gap-4 text-xs shrink-0">
                      <span className="text-slate-400">{art.views} {lang === 'zh' ? '浏览' : 'views'}</span>
                      <span className="text-emerald-400 font-bold font-mono">
                        {art.citations} {lang === 'zh' ? '次引用' : 'cites'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 7-Day Trend Table */}
              <div className="pt-2">
                <div className="text-xs font-bold text-slate-300 mb-2">{lang === 'zh' ? '近期访问趋势' : 'Recent Trend'}</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] text-slate-400">
                    <thead className="bg-slate-800/40 text-slate-300">
                      <tr>
                        <th className="py-1.5 px-2">{lang === 'zh' ? '日期' : 'Date'}</th>
                        <th className="py-1.5 px-2">PV</th>
                        <th className="py-1.5 px-2">UV</th>
                        <th className="py-1.5 px-2 text-right">AI Bot</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {analytics.dailyTraffic.slice(-5).map((row) => (
                        <tr key={row.date}>
                          <td className="py-1.5 px-2 font-mono">{row.date}</td>
                          <td className="py-1.5 px-2">{row.pv}</td>
                          <td className="py-1.5 px-2">{row.uv}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-rose-400">{row.aiBot}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

