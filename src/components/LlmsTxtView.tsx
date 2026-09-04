import React, { useState, useEffect } from 'react';
import {
  FileCode2,
  ExternalLink,
  Copy,
  Download,
  Save,
  CheckCircle2,
  RefreshCw,
  Plus,
  Trash2,
  ListFilter,
  FileText,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { Article, LlmsTxtConfig } from '../types';
import { initialLlmsTxtConfig } from '../data/mockData';

interface LlmsTxtViewProps {
  articles: Article[];
  lang: 'zh' | 'en';
}

export const LlmsTxtView: React.FC<LlmsTxtViewProps> = ({ articles, lang }) => {
  const [config, setConfig] = useState<LlmsTxtConfig>(() => ({
    ...initialLlmsTxtConfig,
    includedArticleIds:
      articles.length > 0 ? articles.map((a) => a.id) : initialLlmsTxtConfig.includedArticleIds,
  }));

  const [previewMode, setPreviewMode] = useState<'standard' | 'full'>('standard');
  const [livePreview, setLivePreview] = useState<string>('');
  const [newDirective, setNewDirective] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Fetch initial config from server safely with fallback
  useEffect(() => {
    let isMounted = true;
    fetch('/api/llmstxt/config')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (isMounted && data && data.config) {
          setConfig(data.config);
          if (data.preview) {
            setLivePreview(previewMode === 'full' ? data.previewFull : data.preview);
          }
        }
      })
      .catch((err) => {
        // Non-blocking fallback to default configuration
        console.warn('Notice: llms.txt config loaded from local fallback state:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update preview when config or mode changes
  useEffect(() => {
    const includedArticles = articles.filter((a) => config.includedArticleIds.includes(a.id));

    if (previewMode === 'standard') {
      let txt = `# ${config.siteTitle}\n\n`;
      txt += `> ${config.summary}\n\n`;

      if (config.coreDirectives.length > 0) {
        txt += `## 索引抓取与引用规范 (Directives)\n`;
        for (const dir of config.coreDirectives) {
          txt += `- ${dir}\n`;
        }
        txt += `\n`;
      }

      txt += `## 核心精选知识与白皮书 (Curated Articles)\n`;
      for (const art of includedArticles) {
        txt += `- [${art.title}](/articles/${art.slug || art.id}): ${art.summary.replace(/\n/g, ' ')}\n`;
      }
      txt += `\n`;

      txt += `## 深度推理上下文包 (Full Context Corpus)\n`;
      txt += `- [全量结构化知识包 (Full Corpus)](/llms-full.txt): 适合大模型与智能体一次性加载全站原子语料\n\n`;

      if (config.customFooterNotes) {
        txt += `> ${config.customFooterNotes}\n`;
      }
      setLivePreview(txt);
    } else {
      let txt = `# ${config.siteTitle} - 完整语料知识包 (Full Markdown Corpus)\n`;
      txt += `生成时间: ${new Date().toISOString()}\n`;
      txt += `收录篇数: ${includedArticles.length} 篇\n\n`;

      for (const art of includedArticles) {
        txt += `<document id="${art.id}" title="${art.title}" category="${art.category}" url="/articles/${art.slug || art.id}">\n`;
        txt += `${art.content}\n`;
        txt += `</document>\n\n`;
      }
      setLivePreview(txt);
    }
  }, [config, previewMode, articles]);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/llmstxt/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setNotification(
          lang === 'zh'
            ? '已成功将 /llms.txt 规范持久化至站群根路由！'
            : 'Successfully updated /llms.txt across endpoints!'
        );
      } else {
        setNotification(
          lang === 'zh' ? '保存至服务端失败，已保留本地更改' : 'Saved locally; server response failed'
        );
      }
    } catch (err) {
      console.warn('Notice: Failed to sync config with server, active locally:', err);
      setNotification(
        lang === 'zh' ? '网络稍有波动，已在本地生效' : 'Configuration active locally'
      );
    } finally {
      setIsSaving(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleAddDirective = () => {
    if (!newDirective.trim()) return;
    setConfig({
      ...config,
      coreDirectives: [...config.coreDirectives, newDirective.trim()],
    });
    setNewDirective('');
  };

  const handleRemoveDirective = (index: number) => {
    setConfig({
      ...config,
      coreDirectives: config.coreDirectives.filter((_, i) => i !== index),
    });
  };

  const handleToggleArticle = (id: string) => {
    const included = config.includedArticleIds.includes(id);
    setConfig({
      ...config,
      includedArticleIds: included
        ? config.includedArticleIds.filter((aid) => aid !== id)
        : [...config.includedArticleIds, id],
    });
  };

  const handleSelectAllArticles = () => {
    setConfig({
      ...config,
      includedArticleIds: articles.map((a) => a.id),
    });
  };

  const handleDeselectAllArticles = () => {
    setConfig({
      ...config,
      includedArticleIds: [],
    });
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(livePreview);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleDownloadTxt = () => {
    const filename = previewMode === 'full' ? 'llms-full.txt' : 'llms.txt';
    const blob = new Blob([livePreview], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <FileCode2 className="w-6 h-6 text-red-500" />
              <span>/llms.txt 知识索引与抓取规则管理</span>
            </h1>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Standard v1.0
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'zh'
              ? '为大语言模型蜘蛛（GPTBot, PerplexityBot, ClaudeBot）提供标准化机器友好索引，引导 AI 优先引用权威切片。'
              : 'Standardized machine-readable markdown index directing LLM crawlers to your canonical content.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <a
            href="/llms.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span>{lang === 'zh' ? '查看线上 /llms.txt' : 'Open /llms.txt'}</span>
          </a>

          <button
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-90 text-xs font-bold text-white shadow-md shadow-red-500/20 flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{lang === 'zh' ? '保存中...' : 'Saving...'}</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{lang === 'zh' ? '发布并更新' : 'Save & Publish'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Grid: Settings on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configuration Form (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Site Metadata Card */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sparkles className="w-4 h-4 text-red-400" />
              <span>{lang === 'zh' ? '索引基础元信息' : 'Index Metadata'}</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  {lang === 'zh' ? '站点/索引标题 (H1)' : 'Site Index Title'}
                </label>
                <input
                  type="text"
                  value={config.siteTitle}
                  onChange={(e) => setConfig({ ...config, siteTitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  {lang === 'zh' ? '面向模型的定位摘要 (Blockquote)' : 'Target Model Summary'}
                </label>
                <textarea
                  rows={3}
                  value={config.summary}
                  onChange={(e) => setConfig({ ...config, summary: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Directives Card */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>{lang === 'zh' ? '抓取指令与引用规范 (Directives)' : 'Directives'}</span>
            </h2>

            <div className="space-y-2 text-xs">
              {config.coreDirectives.map((dir, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800/80"
                >
                  <span className="text-slate-300 leading-normal">{dir}</span>
                  <button
                    onClick={() => handleRemoveDirective(i)}
                    className="p-1 text-slate-400 hover:text-rose-400 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newDirective}
                  onChange={(e) => setNewDirective(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddDirective()}
                  placeholder={lang === 'zh' ? '添加新的抓取规范指令...' : 'Add directive...'}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                />
                <button
                  onClick={handleAddDirective}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'zh' ? '添加' : 'Add'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Included Articles Card */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>
                  {lang === 'zh' ? '收录文章清单' : 'Included Articles'} ({config.includedArticleIds.length}/{articles.length})
                </span>
              </h2>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  onClick={handleSelectAllArticles}
                  className="text-red-400 hover:underline"
                >
                  {lang === 'zh' ? '全选' : 'Select all'}
                </button>
                <span className="text-slate-400">|</span>
                <button
                  onClick={handleDeselectAllArticles}
                  className="text-slate-300 hover:underline"
                >
                  {lang === 'zh' ? '清空' : 'Clear'}
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {articles.map((art) => {
                const isIncluded = config.includedArticleIds.includes(art.id);
                return (
                  <label
                    key={art.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition cursor-pointer text-xs ${
                      isIncluded
                        ? 'bg-slate-950 border-slate-700/80 text-white'
                        : 'bg-slate-900/40 border-slate-800/60 text-slate-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isIncluded}
                      onChange={() => handleToggleArticle(art.id)}
                      className="mt-0.5 rounded border-slate-700 text-red-500 accent-red-500 focus:ring-red-500 bg-slate-900"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold line-clamp-1">{art.title}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{art.category}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Real-time Markdown Code Preview (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col space-y-4">
          {/* Preview Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode('standard')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  previewMode === 'standard'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                /llms.txt (标准索引)
              </button>
              <button
                onClick={() => setPreviewMode('full')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  previewMode === 'full'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                /llms-full.txt (全量语料包)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyToClipboard}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5"
              >
                {copySuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">{lang === 'zh' ? '已复制' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? '复制代码' : 'Copy'}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadTxt}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'zh' ? '导出文件' : 'Download'}</span>
              </button>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-xs text-slate-300 overflow-y-auto max-h-[620px] whitespace-pre-wrap leading-relaxed select-text">
            {livePreview}
          </div>

          {/* Quick Notice footer */}
          <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-900/30 text-[11px] text-blue-300 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
            <span>
              {lang === 'zh'
                ? '提示：当 GPTBot、Perplexity 等爬虫访问你的域名时，首先通过 GET /llms.txt 读取本清单，然后定向对所列文章进行原子化切片提取。'
                : 'Note: AI crawlers will prioritize URLs listed in /llms.txt before indexing general pages.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
