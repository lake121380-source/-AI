import React, { useState, useEffect } from 'react';
import {
  FileCode2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Download,
  ExternalLink,
  RefreshCw,
  Search,
  Layers,
  Globe,
  Check,
  Zap,
  Terminal,
  Code2,
} from 'lucide-react';
import { DualSitemapConfig, BaselineSeoCheckResult } from '../types';
import { initialDualSitemapConfig, sampleBaselineSeoCheck } from '../data/mockData';

interface DualSitemapSeoViewProps {
  lang: 'zh' | 'en';
}

export const DualSitemapSeoView: React.FC<DualSitemapSeoViewProps> = ({ lang }) => {
  const [sitemapConfig, setSitemapConfig] = useState<DualSitemapConfig>(initialDualSitemapConfig);
  const [rawXml, setRawXml] = useState('');
  const [activeTab, setActiveTab] = useState<'sitemap' | 'seo_audit' | 'devops'>('sitemap');
  const [devopsSnippetType, setDevopsSnippetType] = useState<'nginx' | 'nextjs' | 'cloudflare'>('nginx');
  const [isSyncing, setIsSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // SEO Audit states
  const [auditUrl, setAuditUrl] = useState('https://tongzhuo-geo.local/articles/hubspot-vs-crm-geo-content-trust');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<BaselineSeoCheckResult>(sampleBaselineSeoCheck);

  useEffect(() => {
    fetch('/api/sitemap/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.config) setSitemapConfig(data.config);
          if (data.rawXml) setRawXml(data.rawXml);
        }
      })
      .catch((err) => console.warn('Fetch sitemap config error:', err));
  }, []);

  const handleSyncSitemap = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sitemap/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sitemapConfig),
      });
      if (res.ok) {
        const data = await res.json();
        setSitemapConfig(data.config);
        setRawXml(data.rawXml);
        showToast(
          lang === 'zh'
            ? '双轨 Sitemap.xml 与 /llms.txt 已完成同步，并已发布至根目录！'
            : 'Sitemap.xml and /llms.txt synchronized!'
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRunSeoAudit = async (targetUrl?: string) => {
    const urlToTest = targetUrl || auditUrl;
    if (!urlToTest.trim()) return;
    setIsAuditing(true);
    try {
      const res = await fetch('/api/seo-inspector/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToTest }),
      });
      if (res.ok) {
        const data = await res.json();
        setAuditResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleCopyCode = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadXml = () => {
    const blob = new Blob([rawXml], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    link.click();
    URL.revokeObjectURL(url);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // DevOps code snippets
  const nginxSnippet = `# ========================================================
# Nginx 生产环境双轨 sitemap.xml 与 /llms.txt 路由配置
# ========================================================
server {
    listen 80;
    server_name ${sitemapConfig.baseUrl.replace(/^https?:\/\//, '')};

    # 1. 传统搜索引擎 Sitemap XML
    location = /sitemap.xml {
        alias /var/www/dist/sitemap.xml;
        default_type application/xml;
        add_header Cache-Control "public, max-age=3600";
        access_log off;
    }

    # 2. 大模型专属索引规范 /llms.txt
    location = /llms.txt {
        alias /var/www/dist/llms.txt;
        default_type text/plain;
        charset utf-8;
        add_header Access-Control-Allow-Origin "*";
        add_header Cache-Control "public, max-age=1800";
    }

    # 3. 拦截单页应用 CSR 空白问题，强制反向代理至 Node SSR 服务
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}`;

  const nextjsSnippet = `// app/sitemap.ts (Next.js 14+ App Router 双轨路由导出)
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = '${sitemapConfig.baseUrl}';

  return [
    {
      url: \`\${baseUrl}/\`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: \`\${baseUrl}/llms.txt\`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0, // 顶级权重向大模型推荐
    },
    // 动态渲染文章库
    ${sitemapConfig.entries
      .slice(1, 4)
      .map(
        (e) => `{
      url: '${e.url}',
      lastModified: new Date('${e.lastModified}'),
      changeFrequency: '${e.changefreq}',
      priority: ${e.priority},
    }`
      )
      .join(',\n    ')}
  ];
}`;

  const cloudflareSnippet = `// Cloudflare Workers 边缘代理: 动态路由 /sitemap.xml 与 /llms.txt
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/llms.txt') {
      const response = await fetch('${sitemapConfig.baseUrl}/llms.txt');
      const newHeaders = new Headers(response.headers);
      newHeaders.set('Access-Control-Allow-Origin', '*');
      newHeaders.set('Content-Type', 'text/plain; charset=utf-8');
      return new Response(response.body, { headers: newHeaders });
    }

    return fetch(request);
  },
};`;

  const getActiveDevopsSnippet = () => {
    switch (devopsSnippetType) {
      case 'nginx':
        return nginxSnippet;
      case 'nextjs':
        return nextjsSnippet;
      case 'cloudflare':
        return cloudflareSnippet;
    }
  };

  return (
    <div className="space-y-6" id="dual-sitemap-container">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          id="sitemap-toast"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-lg border border-emerald-500/30 bg-slate-900 px-4 py-3 text-sm font-medium text-emerald-300 shadow-2xl backdrop-blur-md"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
              <Layers className="h-3.5 w-3.5" />
              {lang === 'zh' ? '阶段 1 · SEO 筑基工程' : 'Phase 1 · SEO Foundation'}
            </span>
            <span className="text-xs text-slate-400">
              {lang === 'zh' ? '面向传统蜘蛛 (XML) 与大模型 (/llms.txt) 的双轨映射' : 'Dual-track Indexing'}
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            {lang === 'zh' ? 'SEO 基础规范与双轨 Sitemap 站点地图中心' : 'Baseline SEO & Dual-Track Sitemap Hub'}
          </h2>
          <p className="text-sm text-slate-400">
            {lang === 'zh'
              ? '先做好官网传统 SEO 基础收录（Canonical、Meta、SSR纯HTML可读性），才能让大模型在初阶检索中顺利召回，进而由 GEO 完成深度事实提取与引用。'
              : 'Establish bulletproof SEO indexing & static HTML readability so LLM RAG pipelines can discover and cite you without rendering barriers.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {lang === 'zh' ? '预览实时 /sitemap.xml' : 'View /sitemap.xml'}
          </a>

          <button
            onClick={handleSyncSitemap}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing
              ? lang === 'zh'
                ? '双轨同步中...'
                : 'Syncing...'
              : lang === 'zh'
              ? '一键全量同步双轨地图'
              : 'Sync Dual Sitemaps'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('sitemap')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === 'sitemap'
              ? 'border-indigo-400 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode2 className="h-3.5 w-3.5" />
          {lang === 'zh' ? '双轨 Sitemap.xml 生成与配置' : 'Dual-Track Sitemap Engine'}
        </button>

        <button
          onClick={() => setActiveTab('seo_audit')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === 'seo_audit'
              ? 'border-indigo-400 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="h-3.5 w-3.5" />
          {lang === 'zh' ? '基础 SEO 与 CSR/SSR 静态渲染体检' : 'Baseline SEO & SSR Static Inspector'}
        </button>

        <button
          onClick={() => setActiveTab('devops')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === 'devops'
              ? 'border-indigo-400 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="h-3.5 w-3.5" />
          {lang === 'zh' ? '研发一键上线代码 (Nginx / Next.js / Cloudflare)' : 'DevOps Deployment Snippets'}
        </button>
      </div>

      {/* TAB 1: SITEMAP ENGINE */}
      {activeTab === 'sitemap' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Controls (5 cols) */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-white">
                {lang === 'zh' ? '双轨站点地图同步策略' : 'Sitemap Synchronization Settings'}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                {lang === 'zh'
                  ? '同时向 Google/Bing 提供标准 XML，并向 Perplexity/SearchGPT 提供 /llms.txt。'
                  : 'Delivers XML to traditional search engines while linking to /llms.txt for AI agents.'}
              </p>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">
                    {lang === 'zh' ? '站点基准域名 (Base URL)' : 'Base URL'}
                  </label>
                  <input
                    type="url"
                    value={sitemapConfig.baseUrl}
                    onChange={(e) =>
                      setSitemapConfig((prev) => ({ ...prev, baseUrl: e.target.value }))
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition"
                  />
                </div>

                <div className="space-y-2.5 pt-2">
                  <label className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">
                      {lang === 'zh'
                        ? '内容库有新文章发布时自动增量写入 sitemap.xml'
                        : 'Auto-sync with published articles'}
                    </span>
                    <input
                      type="checkbox"
                      checked={sitemapConfig.autoSyncWithArticles}
                      onChange={(e) =>
                        setSitemapConfig((prev) => ({
                          ...prev,
                          autoSyncWithArticles: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-500 accent-indigo-500 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">
                      {lang === 'zh'
                        ? '在 sitemap.xml 中将 /llms.txt 设为最高权重优先收录条目'
                        : 'Include /llms.txt with high priority'}
                    </span>
                    <input
                      type="checkbox"
                      checked={sitemapConfig.includeLlmsTxtLink}
                      onChange={(e) =>
                        setSitemapConfig((prev) => ({
                          ...prev,
                          includeLlmsTxtLink: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-500 accent-indigo-500 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Architecture Explainer */}
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/30 p-5">
              <div className="flex items-start gap-3">
                <Zap className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-indigo-200">
                    {lang === 'zh' ? '双轨地图协同工作流架构' : 'Dual-Track Architecture'}
                  </h4>
                  <p className="text-xs text-indigo-300/80 leading-relaxed">
                    传统搜索引擎蜘蛛（Googlebot / Baiduspider）通过 <code>sitemap.xml</code> 建立全站 URL 索引底座；
                    而新一代大模型爬虫（GPTBot / PerplexityBot）在访问站点后，会优先抓取 <code>/llms.txt</code>，直接获得零营销废话、高精度的结构化原子切片语料。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* XML Live Viewer with Syntax Highlights (7 cols) */}
          <div className="space-y-4 lg:col-span-7">
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-300 ml-2">
                    sitemap.xml 实时源码 ({sitemapConfig.entries.length} 规范 URL)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyCode(rawXml)}
                    className="inline-flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300 border border-slate-700 hover:bg-slate-700"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    {copied ? (lang === 'zh' ? '已复制' : 'Copied') : (lang === 'zh' ? '复制 XML' : 'Copy')}
                  </button>
                  <button
                    onClick={handleDownloadXml}
                    className="inline-flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300 border border-slate-700 hover:bg-slate-700"
                  >
                    <Download className="h-3 w-3" />
                    {lang === 'zh' ? '下载' : 'Download'}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed select-all">
                <pre className="text-emerald-400/90 whitespace-pre">
                  {rawXml.split('\n').map((line, idx) => {
                    return (
                      <div key={idx} className="hover:bg-slate-900/60 px-1 rounded flex">
                        <span className="w-8 select-none text-slate-400 text-right pr-3 tabular-nums">
                          {idx + 1}
                        </span>
                        <span>{line}</span>
                      </div>
                    );
                  })}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SEO AUDIT & SSR RENDERABILITY */}
      {activeTab === 'seo_audit' && (
        <div className="space-y-6">
          {/* URL Input */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
            <label className="block text-xs font-semibold text-slate-300">
              {lang === 'zh' ? '待诊断网页或官网落地页 URL' : 'Page URL to Audit'}
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="url"
                  value={auditUrl}
                  onChange={(e) => setAuditUrl(e.target.value)}
                  placeholder="https://example.com/page"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>
              <button
                onClick={() => handleRunSeoAudit()}
                disabled={isAuditing}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer"
              >
                <Search className={`h-3.5 w-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                {isAuditing
                  ? lang === 'zh'
                    ? '深度探测中...'
                    : 'Auditing...'
                  : lang === 'zh'
                  ? '开始基础 SEO 审计'
                  : 'Run Audit'}
              </button>
            </div>

            <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-400">
              <span>{lang === 'zh' ? '一键预设：' : 'Presets:'}</span>
              <button
                onClick={() => {
                  const u = 'https://tongzhuo-geo.local/articles/hubspot-vs-crm-geo-content-trust';
                  setAuditUrl(u);
                  handleRunSeoAudit(u);
                }}
                className="text-indigo-400 hover:underline"
              >
                {lang === 'zh' ? '桐灼GEO 标杆落地页 (Pass)' : 'Our Benchmark Page (Pass)'}
              </button>
              <span>·</span>
              <button
                onClick={() => {
                  const u = 'https://external-spa-sample.com/dashboard';
                  setAuditUrl(u);
                  handleRunSeoAudit(u);
                }}
                className="text-slate-300 hover:underline"
              >
                {lang === 'zh' ? '单页应用纯CSR空白DOM风险样本 (Warn)' : 'Pure CSR Blank SPA Sample'}
              </button>
            </div>
          </div>

          {/* Audit Results Dashboard */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {lang === 'zh' ? 'SEO 基础与渲染可读性检查清单' : 'Checklist & SSR Renderability Matrix'}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  {lang === 'zh' ? '基础得分：' : 'Score: '}
                </span>
                <span
                  className={`text-lg font-bold font-mono tabular-nums ${
                    auditResult.overallScore >= 85
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                >
                  {auditResult.overallScore} / 100
                </span>
              </div>
            </div>

            {/* Crucial SSR Warning Card with low-saturation refined styling */}
            {auditResult.checks.ssrHtmlRenderability.isSpaBlankDom && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-slate-200">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-300">
                      {lang === 'zh' ? '致命缺陷：检测到纯客户端渲染 (CSR) 空白 DOM' : 'Critical Failure: Blank Client-Side SPA'}
                    </h4>
                    <p className="mt-0.5 text-xs text-slate-300 leading-relaxed">
                      {auditResult.checks.ssrHtmlRenderability.tip}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Checklist Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* SSR Renderability */}
              <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {lang === 'zh' ? 'SSR 纯 HTML 文本可读性' : 'SSR Static HTML Delivery'}
                  </span>
                  {auditResult.checks.ssrHtmlRenderability.status === 'pass' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-400" />
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  {auditResult.checks.ssrHtmlRenderability.tip}
                </p>
              </div>

              {/* Canonical */}
              <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {lang === 'zh' ? '规范权威网址 (Canonical Tag)' : 'Canonical Tag'}
                  </span>
                  {auditResult.checks.canonical.status === 'pass' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  {auditResult.checks.canonical.tip}
                </p>
              </div>

              {/* Meta Robots */}
              <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {lang === 'zh' ? 'Meta Robots 允许索引' : 'Meta Robots Directives'}
                  </span>
                  {auditResult.checks.metaRobots.status === 'pass' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-400" />
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  {auditResult.checks.metaRobots.tip}
                </p>
              </div>

              {/* Title & Description */}
              <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {lang === 'zh' ? 'Title & Description 事实密度' : 'Title & Meta Description'}
                  </span>
                  {auditResult.checks.titleTag.status === 'pass' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  {auditResult.checks.metaDescription.tip || auditResult.checks.titleTag.tip}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEVOPS CODE SNIPPETS */}
      {activeTab === 'devops' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span>{lang === 'zh' ? '研发一键上线工程代码模版' : 'DevOps Production Snippets'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'zh'
                  ? '直接复制以下配置文件发送给运维与研发工程师，开箱即用完成双轨 sitemap.xml 与 /llms.txt 生产部署。'
                  : 'Ready-to-use production configuration templates for infrastructure engineers.'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 p-1 rounded-lg">
              <button
                onClick={() => setDevopsSnippetType('nginx')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  devopsSnippetType === 'nginx'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Nginx
              </button>
              <button
                onClick={() => setDevopsSnippetType('nextjs')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  devopsSnippetType === 'nextjs'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Next.js (App Router)
              </button>
              <button
                onClick={() => setDevopsSnippetType('cloudflare')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  devopsSnippetType === 'cloudflare'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Cloudflare Workers
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-slate-300">
                  {devopsSnippetType === 'nginx'
                    ? '/etc/nginx/conf.d/geo-sitemap.conf'
                    : devopsSnippetType === 'nextjs'
                    ? 'src/app/sitemap.ts'
                    : 'worker.js'}
                </span>
              </div>
              <button
                onClick={() => handleCopyCode(getActiveDevopsSnippet())}
                className="inline-flex items-center gap-1 rounded bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 border border-slate-700 hover:bg-slate-700"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? (lang === 'zh' ? '已复制' : 'Copied') : (lang === 'zh' ? '复制代码' : 'Copy Code')}
              </button>
            </div>

            <div className="p-4 bg-slate-950 font-mono text-xs text-indigo-300/90 overflow-x-auto max-h-[500px] leading-relaxed select-all">
              <pre className="whitespace-pre">{getActiveDevopsSnippet()}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
