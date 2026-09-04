import React, { useState } from 'react';
import { Eye, Globe, ExternalLink, Flame, Clock, BookOpen, Search, ArrowRight } from 'lucide-react';
import { Article, Category } from '../types';

interface SitePreviewViewProps {
  articles: Article[];
  categories: Category[];
  onSelectArticle: (article: Article) => void;
  lang: 'zh' | 'en';
}

export const SitePreviewView: React.FC<SitePreviewViewProps> = ({
  articles,
  categories,
  onSelectArticle,
  lang,
}) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [theme, setTheme] = useState<'toutiao' | 'editorial'>('toutiao');

  const published = articles.filter((a) => a.status === 'published');
  const filtered = activeCategory === 'all'
    ? published
    : published.filter((a) => a.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header & Theme Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Eye className="w-6 h-6 text-red-500" />
            {lang === 'zh' ? '公开站点前台实时渲染' : 'Live Front-End Site Preview'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'zh'
              ? '即时预览远端站点接收到已发布 GEO 文章后的渲染样式、排版与信源标注。'
              : 'Preview how published GEO articles render in real-world public themes.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setTheme('toutiao')}
            className={`text-xs px-3 py-1.5 rounded-lg font-bold transition ${
              theme === 'toutiao' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'zh' ? '今日头条 / 资讯流风' : 'Newsfeed Theme'}
          </button>
          <button
            onClick={() => setTheme('editorial')}
            className={`text-xs px-3 py-1.5 rounded-lg font-bold transition ${
              theme === 'editorial' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'zh' ? '极简深度智库风' : 'Editorial Tech Theme'}
          </button>
        </div>
      </div>

      {/* Embedded Live Site Frame */}
      <div className={`rounded-2xl border shadow-2xl overflow-hidden transition-all ${
        theme === 'toutiao' ? 'bg-white text-slate-900 border-slate-200' : 'bg-slate-950 text-slate-100 border-slate-800'
      }`}>
        {/* Site Header */}
        <header className={`px-4 sm:px-8 py-3.5 border-b flex items-center justify-between ${
          theme === 'toutiao' ? 'bg-white border-red-100' : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-base ${
              theme === 'toutiao' ? 'bg-red-600 shadow-md shadow-red-500/30' : 'bg-indigo-600'
            }`}>
              {theme === 'toutiao' ? '头' : 'T'}
            </div>
            <div>
              <div className={`font-black text-base tracking-tight ${theme === 'toutiao' ? 'text-red-600' : 'text-white'}`}>
                {theme === 'toutiao' ? '今日科技头条' : 'TechMatrix Insights'}
              </div>
              <div className="text-[10px] text-slate-400">
                {theme === 'toutiao' ? '桐灼GEO 实时信源分发节点' : 'AI-Optimized Knowledge Hub'}
              </div>
            </div>
          </div>

          {/* Categories Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1 text-xs font-bold rounded-full transition ${
                activeCategory === 'all'
                  ? theme === 'toutiao' ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white'
                  : theme === 'toutiao' ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {lang === 'zh' ? '推荐' : 'Featured'}
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.name)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition ${
                  activeCategory === c.name
                    ? theme === 'toutiao' ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white'
                    : theme === 'toutiao' ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                {c.name}
              </button>
            ))}
          </nav>
        </header>

        {/* Site Body */}
        <div className="p-4 sm:p-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Feed (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className={`text-xs font-bold uppercase tracking-wider pb-2 border-b ${
              theme === 'toutiao' ? 'text-slate-600 border-slate-200' : 'text-slate-400 border-slate-800'
            }`}>
              {activeCategory === 'all' ? (lang === 'zh' ? '实时快讯流' : 'Latest Feed') : activeCategory} ({filtered.length})
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filtered.map((art) => (
                <article
                  key={art.id}
                  onClick={() => onSelectArticle(art)}
                  className={`py-4 group cursor-pointer transition flex flex-col justify-between ${
                    theme === 'toutiao' ? 'hover:bg-slate-50/80' : 'hover:bg-slate-900/40'
                  } p-3 rounded-xl`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        theme === 'toutiao' ? 'bg-red-50 text-red-600' : 'bg-indigo-500/20 text-indigo-300'
                      }`}>
                        {art.category}
                      </span>
                      <span className="text-xs text-slate-400">{art.author}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-400">{art.createdAt}</span>
                    </div>

                    <h2 className={`text-base sm:text-lg font-bold leading-snug group-hover:text-red-600 transition line-clamp-2 ${
                      theme === 'toutiao' ? 'text-slate-900' : 'text-white'
                    }`}>
                      {art.title}
                    </h2>

                    <p className={`text-xs line-clamp-2 leading-relaxed ${
                      theme === 'toutiao' ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      {art.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/40 text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      {art.seoKeywords.slice(0, 3).map((kw) => (
                        <span key={kw} className={`px-1.5 py-0.5 rounded text-[10px] ${
                          theme === 'toutiao' ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'
                        }`}>
                          #{kw}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <span>{art.views || 0} {lang === 'zh' ? '阅读' : 'views'}</span>
                      <span className="text-red-500 font-semibold group-hover:underline">
                        {lang === 'zh' ? '阅读全文' : 'Read'} →
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Right Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Trending Box */}
            <div className={`p-4 rounded-2xl border ${
              theme === 'toutiao' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
            } space-y-3`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className={`text-xs font-black flex items-center gap-1.5 ${
                  theme === 'toutiao' ? 'text-slate-900' : 'text-white'
                }`}>
                  <Flame className="w-4 h-4 text-red-500" />
                  <span>{lang === 'zh' ? '24小时热度与 AI 引用榜' : 'Trending Citations'}</span>
                </h3>
                <span className="text-[10px] text-red-500 font-bold font-mono">HOT</span>
              </div>

              <div className="space-y-3">
                {published.slice(0, 4).map((art, idx) => (
                  <div
                    key={art.id}
                    onClick={() => onSelectArticle(art)}
                    className="flex items-start gap-2.5 cursor-pointer group"
                  >
                    <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0 ${
                      idx === 0
                        ? 'bg-red-600 text-white'
                        : idx === 1
                        ? 'bg-amber-500 text-white'
                        : idx === 2
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-red-600 line-clamp-2 transition leading-tight">
                      {art.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GEO LLMs.txt info */}
            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              theme === 'toutiao' ? 'bg-red-50/60 border-red-100 text-slate-700' : 'bg-slate-900/60 border-slate-800 text-slate-300'
            }`}>
              <div className="font-bold flex items-center gap-1.5 text-red-600">
                <Globe className="w-4 h-4" />
                <span>/llms.txt & Sitemap Ready</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                {lang === 'zh'
                  ? '本站点公开节点支持轻量化大语言模型直接消费，自动维护纯文本 Markdown 索引与结构化 Schema。'
                  : 'Exposes raw markdown endpoints and /llms.txt for real-time agent extraction.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
