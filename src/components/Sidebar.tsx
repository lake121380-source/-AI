import React, { useState } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  FileText,
  Workflow,
  Database,
  Radio,
  BarChart3,
  Sliders,
  Eye,
  FileCode2,
  Compass,
  Flame,
  Search,
  Globe,
  ShieldCheck,
  Layers,
  Award,
  TrendingUp,
  CheckCircle2,
  ChevronDown,
  Activity,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  lang: 'zh' | 'en';
  badgeCounts: {
    articles: number;
    tasks: number;
    channels: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  lang,
  badgeCounts,
}) => {
  // 3-Stage Workflow Grouping
  const workflowGroups = [
    {
      groupKey: 'foundation',
      title: lang === 'zh' ? '阶段一 · 底层基准与合规' : 'Phase 1 · Foundation & Crawlers',
      subtitle: lang === 'zh' ? 'SEO筑基、爬虫策略与实体消歧' : 'SEO, Robots & Entity EEAT',
      items: [
        {
          id: 'seo_dashboard',
          label: lang === 'zh' ? 'SEO 综合决策大盘' : 'SEO Dashboard',
          icon: Activity,
          badgeText: lang === 'zh' ? '聚合' : 'Hub',
        },
        {
          id: 'seo_foundation',
          label: lang === 'zh' ? 'SEO 筑基与双轨地图' : 'SEO & Dual Sitemap',
          icon: Layers,
          badgeText: lang === 'zh' ? '核心' : 'Core',
        },
        {
          id: 'robots_policy',
          label: lang === 'zh' ? 'AI 爬虫访问防线' : 'Crawler Policy',
          icon: ShieldCheck,
        },
        {
          id: 'brand_entity',
          label: lang === 'zh' ? '品牌实体与 E-E-A-T' : 'Entity & EEAT',
          icon: Award,
          badgeText: 'Schema',
        },
        {
          id: 'url_scanner',
          label: lang === 'zh' ? '全站 URL 渲染体检' : 'URL Inspector',
          icon: Globe,
        },
      ],
    },
    {
      groupKey: 'content_engine',
      title: lang === 'zh' ? '阶段二 · 核心语料与生产' : 'Phase 2 · Content Engine',
      subtitle: lang === 'zh' ? '原子切片、知识库与/llms.txt' : 'Chunks, Knowledge & /llms.txt',
      items: [
        {
          id: 'dashboard',
          label: lang === 'zh' ? '概览大盘' : 'Dashboard',
          icon: LayoutDashboard,
        },
        {
          id: 'generator',
          label: lang === 'zh' ? 'AI 内容工坊' : 'AI Studio',
          icon: Sparkles,
        },
        {
          id: 'articles',
          label: lang === 'zh' ? '内容与审核' : 'Content & Review',
          icon: FileText,
          badge: badgeCounts.articles,
        },
        {
          id: 'llmstxt',
          label: lang === 'zh' ? '/llms.txt 规范管理' : '/llms.txt Hub',
          icon: FileCode2,
          badgeText: 'Spec',
        },
        {
          id: 'knowledge',
          label: lang === 'zh' ? '知识库与 RAG' : 'Knowledge & RAG',
          icon: Database,
        },
        {
          id: 'tasks',
          label: lang === 'zh' ? '任务与调度' : 'Tasks & Pipeline',
          icon: Workflow,
          badge: badgeCounts.tasks,
        },
        {
          id: 'distribution',
          label: lang === 'zh' ? '多端分发中台' : 'Distribution Hub',
          icon: Radio,
          badge: badgeCounts.channels,
        },
      ],
    },
    {
      groupKey: 'intelligence',
      title: lang === 'zh' ? '阶段三 · 监测洞察与归因' : 'Phase 3 · Intelligence & Attribution',
      subtitle: lang === 'zh' ? '问答雷达、沙盒与转化漏斗' : 'Radar, Sandbox & Funnel',
      items: [
        {
          id: 'attribution_funnel',
          label: lang === 'zh' ? 'AI 转化漏斗与归因' : 'AI Traffic Funnel',
          icon: TrendingUp,
          badgeText: lang === 'zh' ? '闭环' : 'ROI',
        },
        {
          id: 'query_radar',
          label: lang === 'zh' ? '高潜问答挖掘' : 'Query Radar',
          icon: Search,
        },
        {
          id: 'competitor',
          label: lang === 'zh' ? '竞品声量雷达' : 'Competitor Radar',
          icon: Flame,
        },
        {
          id: 'sandbox',
          label: lang === 'zh' ? 'AI 命中模拟沙盒' : 'AI Citation Sandbox',
          icon: Compass,
        },
        {
          id: 'analytics',
          label: lang === 'zh' ? 'GEO 指标与大盘' : 'GEO & Analytics',
          icon: BarChart3,
        },
        {
          id: 'ai-models',
          label: lang === 'zh' ? '模型与提示词' : 'Models & Prompts',
          icon: Sliders,
        },
        {
          id: 'preview',
          label: lang === 'zh' ? '前台站点预览' : 'Site Preview',
          icon: Eye,
        },
      ],
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/90 p-3 flex flex-col justify-between shrink-0 h-full overflow-hidden select-none">
      {/* Scrollable Workflow Navigation List */}
      <div className="space-y-4 overflow-y-auto pr-1 flex-1 custom-scrollbar">
        {workflowGroups.map((group, groupIdx) => (
          <div key={group.groupKey} className="space-y-1">
            {/* Section Header */}
            <div className="px-2 pt-2 pb-1 border-b border-slate-800/80 mb-1.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-300 tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                  <span>{group.title}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-normal pl-3">
                  {group.subtitle}
                </div>
              </div>
            </div>

            {/* Menu Items within Group */}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      {/* Badge counter */}
                      {item.badge !== undefined && item.badge > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums ${
                            isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Pill Tag (e.g. Core, Schema, ROI) */}
                      {item.badgeText && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded tracking-tight font-semibold uppercase ${
                            isActive
                              ? 'bg-indigo-700/80 text-white'
                              : 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60'
                          }`}
                        >
                          {item.badgeText}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* System Status Footer */}
      <div className="pt-3 border-t border-slate-800 shrink-0">
        <div className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-200 font-semibold text-xs">
                {lang === 'zh' ? 'GEO 引擎运行中' : 'GEO Engine Active'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
              v2.5
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            {lang === 'zh'
              ? 'SEO筑基 → 原子切片 → AI引流归因'
              : 'SEO Base → Atomic Chunks → Attribution'}
          </p>
        </div>
      </div>
    </aside>
  );
};
