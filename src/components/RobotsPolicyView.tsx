import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Bot,
  Sliders,
  Copy,
  Download,
  Save,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Lock,
  Plus,
  Trash2,
  Check,
  Sparkles,
} from 'lucide-react';
import { RobotsConfig, AiBotPolicy } from '../types';
import { initialRobotsConfig } from '../data/mockData';

interface RobotsPolicyViewProps {
  lang: 'zh' | 'en';
}

export const RobotsPolicyView: React.FC<RobotsPolicyViewProps> = ({ lang }) => {
  const [config, setConfig] = useState<RobotsConfig>(initialRobotsConfig);
  const [rawRobotsTxt, setRawRobotsTxt] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newProtectedPath, setNewProtectedPath] = useState('');

  useEffect(() => {
    fetch('/api/robots-policy')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.config) {
          setConfig(data.config);
          setRawRobotsTxt(data.rawRobotsTxt || '');
        }
      })
      .catch((err) => console.warn('Fetch robots policy error:', err));
  }, []);

  // Update raw robots text dynamically whenever config changes
  useEffect(() => {
    const lines: string[] = [];
    lines.push('# =========================================================================');
    lines.push('# 桐灼GEO AI 爬虫防线与授权策略配置文件');
    lines.push('# 遵循各大主流 LLM 知识检索、RAG 与模型回流训练爬虫协议规范');
    lines.push('# =========================================================================\n');

    if (config.includeLlmsTxt && config.llmsTxtUrl) {
      lines.push('# 大模型权威知识索引与语料入口 (LLM Curated Directives)');
      lines.push(`Llms-txt: ${config.llmsTxtUrl}`);
      lines.push(`Llms-full-txt: ${config.llmsTxtUrl.replace('/llms.txt', '/llms-full.txt')}\n`);
    }

    if (config.includeSitemap && config.sitemapUrl) {
      lines.push(`Sitemap: ${config.sitemapUrl}\n`);
    }

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

    lines.push('# 全局通用默认规则');
    lines.push('User-agent: *');
    if (config.allowAllByDefault) {
      lines.push('Allow: /');
    }
    for (const p of config.protectedPaths) {
      lines.push(`Disallow: ${p}`);
    }

    setRawRobotsTxt(lines.join('\n'));
  }, [config]);

  const handleUpdateBotAction = (botId: string, action: 'allow' | 'disallow' | 'throttle') => {
    setConfig((prev) => ({
      ...prev,
      botPolicies: prev.botPolicies.map((b) =>
        b.id === botId
          ? {
              ...b,
              action,
              crawlDelay: action === 'throttle' ? b.crawlDelay || 5 : b.crawlDelay,
            }
          : b
      ),
    }));
  };

  const handleUpdateCrawlDelay = (botId: string, delay: number) => {
    setConfig((prev) => ({
      ...prev,
      botPolicies: prev.botPolicies.map((b) => (b.id === botId ? { ...b, crawlDelay: delay } : b)),
    }));
  };

  const handleAddProtectedPath = () => {
    const p = newProtectedPath.trim();
    if (!p) return;
    const formatted = p.startsWith('/') ? p : `/${p}`;
    if (!config.protectedPaths.includes(formatted)) {
      setConfig((prev) => ({
        ...prev,
        protectedPaths: [...prev.protectedPaths, formatted],
      }));
    }
    setNewProtectedPath('');
  };

  const handleRemoveProtectedPath = (pathToRemove: string) => {
    setConfig((prev) => ({
      ...prev,
      protectedPaths: prev.protectedPaths.filter((p) => p !== pathToRemove),
    }));
  };

  const handleSavePolicy = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/robots-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
      if (res.ok) {
        showToast(
          lang === 'zh'
            ? '已成功应用并更新全站 /robots.txt 配置！'
            : 'Successfully updated live /robots.txt policy!'
        );
      }
    } catch (e) {
      console.error('Save policy error:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rawRobotsTxt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([rawRobotsTxt], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'robots.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="space-y-6" id="robots-policy-container">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          id="robots-toast"
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
            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
              <ShieldCheck className="h-3.5 w-3.5" />
              {lang === 'zh' ? '模块 D · AI 爬虫防线' : 'Module D · AI Crawler Policy'}
            </span>
            <span className="text-xs text-slate-400">
              {lang === 'zh' ? '可直接访问 /robots.txt 生效' : 'Live at /robots.txt'}
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            {lang === 'zh' ? 'AI 爬虫防线与 robots.txt 可视化配置器' : 'AI Crawler Policy & robots.txt Builder'}
          </h2>
          <p className="text-sm text-slate-400">
            {lang === 'zh'
              ? '针对 GPTBot、ClaudeBot、Perplexity、字节跳动等主流爬虫，可视化配置“允许检索、限速抓取、或禁止训练回流”，一键同步生效。'
              : 'Configure granular allow, throttle and disallow policies for all major AI search and training crawlers.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {lang === 'zh' ? '查看线上 /robots.txt' : 'View Live /robots.txt'}
          </a>

          <button
            onClick={handleSavePolicy}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving
              ? lang === 'zh'
                ? '保存并同步中...'
                : 'Saving...'
              : lang === 'zh'
              ? '一键同步并应用'
              : 'Save & Apply'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Visual Controls (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Global Directives Box */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-white">
              {lang === 'zh' ? '全局元数据与索引声明' : 'Global Indexes & Discovery'}
            </h3>

            <div className="mt-4 space-y-3.5">
              <label className="flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-300 font-medium">
                  {lang === 'zh' ? '在 robots.txt 中显式声明 /llms.txt 入口' : 'Declare /llms.txt in robots.txt'}
                </span>
                <input
                  type="checkbox"
                  checked={config.includeLlmsTxt}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, includeLlmsTxt: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-500 accent-indigo-500 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-300 font-medium">
                  {lang === 'zh' ? '声明 Sitemap.xml 网站地图路径' : 'Declare Sitemap.xml'}
                </span>
                <input
                  type="checkbox"
                  checked={config.includeSitemap}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, includeSitemap: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-500 accent-indigo-500 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-300 font-medium">
                  {lang === 'zh' ? '默认对未声明爬虫全局放行 (Allow: /)' : 'Default Allow for other bots'}
                </span>
                <input
                  type="checkbox"
                  checked={config.allowAllByDefault}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, allowAllByDefault: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-500 accent-indigo-500 focus:ring-indigo-500"
                />
              </label>
            </div>

            {/* Protected Paths */}
            <div className="mt-5 border-t border-slate-800 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">
                  {lang === 'zh' ? '保护禁止抓取路径 (Disallow Paths)' : 'Protected Disallow Paths'}
                </span>
              </div>

              <div className="mt-2.5 flex flex-wrap gap-2">
                {config.protectedPaths.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1 rounded-md bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs text-slate-300"
                  >
                    <Lock className="h-3 w-3 text-slate-400" />
                    {p}
                    <button
                      onClick={() => handleRemoveProtectedPath(p)}
                      className="ml-1 text-slate-400 hover:text-rose-400 transition"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={newProtectedPath}
                  onChange={(e) => setNewProtectedPath(e.target.value)}
                  placeholder="/secret-folder"
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition"
                />
                <button
                  onClick={handleAddProtectedPath}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {lang === 'zh' ? '添加' : 'Add'}
                </button>
              </div>
            </div>
          </div>

          {/* AI Bots Matrix */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-white">
              {lang === 'zh' ? '主流 AI 爬虫细粒度访问控制矩阵' : 'Granular AI Bot Access Matrix'}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              {lang === 'zh'
                ? '支持针对每个大模型官方爬虫独立设置放行、限速或封禁：'
                : 'Set allow, throttle or block individually for each official crawler:'}
            </p>

            <div className="mt-4 space-y-4">
              {config.botPolicies.map((bot) => (
                <div
                  key={bot.id}
                  className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3.5 transition-colors hover:border-slate-700"
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-xs">
                          {bot.name}
                        </span>
                        <span className="rounded bg-slate-800 border border-slate-700 px-1.5 py-0.2 text-[10px] text-slate-300 font-mono">
                          {bot.userAgent}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {bot.description}
                      </p>
                    </div>

                    {/* Policy Radio Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleUpdateBotAction(bot.id, 'allow')}
                        className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                          bot.action === 'allow'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        {lang === 'zh' ? '放行检索' : 'Allow'}
                      </button>

                      <button
                        onClick={() => handleUpdateBotAction(bot.id, 'throttle')}
                        className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                          bot.action === 'throttle'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        {lang === 'zh' ? '适度限速' : 'Throttle'}
                      </button>

                      <button
                        onClick={() => handleUpdateBotAction(bot.id, 'disallow')}
                        className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                          bot.action === 'disallow'
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        {lang === 'zh' ? '完全封禁' : 'Block'}
                      </button>
                    </div>
                  </div>

                  {/* Throttle delay input if throttled */}
                  {bot.action === 'throttle' && (
                    <div className="mt-2 flex items-center gap-2 pt-2 text-xs text-slate-300 border-t border-slate-800">
                      <span>Crawl-delay (抓取延时秒数):</span>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={bot.crawlDelay || 5}
                        onChange={(e) => handleUpdateCrawlDelay(bot.id, Number(e.target.value))}
                        className="w-16 rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                      <span>秒/请求</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Code Preview & Export (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-3">
              <span className="font-mono text-xs font-semibold text-slate-300">
                robots.txt 实时生成预览
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-200 border border-slate-700 hover:bg-slate-700 transition"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copied ? (lang === 'zh' ? '已复制' : 'Copied') : (lang === 'zh' ? '复制' : 'Copy')}
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-200 border border-slate-700 hover:bg-slate-700 transition"
                >
                  <Download className="h-3 w-3" />
                  {lang === 'zh' ? '下载' : 'Download'}
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-950 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[580px] leading-relaxed select-all">
              <pre>{rawRobotsTxt}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
