import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Eye,
  Trash2,
  Radio,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit,
  Sparkles,
  Tag,
  X,
  Loader2,
  Lightbulb,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { Article, Category, DistributionChannel } from '../types';
import { GeoAuditorModal } from './GeoAuditorModal';
import { auditGeoReadiness } from '../utils/geoAuditor';

interface ArticlesViewProps {
  articles: Article[];
  categories: Category[];
  channels: DistributionChannel[];
  onSelectArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => void;
  onDistributeArticle: (id: string, channelIds: string[]) => void;
  onCreateArticle: (art: Partial<Article>) => void;
  lang: 'zh' | 'en';
}

export const ArticlesView: React.FC<ArticlesViewProps> = ({
  articles,
  categories,
  channels,
  onSelectArticle,
  onDeleteArticle,
  onDistributeArticle,
  onCreateArticle,
  lang,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'review' | 'draft'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [distributeTargetArticle, setDistributeTargetArticle] = useState<Article | null>(null);
  const [auditTargetArticle, setAuditTargetArticle] = useState<Article | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New Article Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('科技资讯');
  const [newContent, setNewContent] = useState('');

  // Automated Tagging & SEO Keywords state
  const [newTags, setNewTags] = useState<string[]>(['GEO优化']);
  const [tagInput, setTagInput] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [suggestionReasoning, setSuggestionReasoning] = useState<string | null>(null);
  const [tagError, setTagError] = useState<string | null>(null);

  const filteredArticles = articles.filter((art) => {
    if (selectedStatus !== 'all' && art.status !== selectedStatus) return false;
    if (selectedCategory !== 'all' && art.category !== selectedCategory) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        art.title.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        art.seoKeywords.some((k) => k.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleSuggestTags = async () => {
    if (!newTitle.trim() && !newContent.trim()) {
      setTagError(
        lang === 'zh'
          ? '请先填写文章标题或正文内容，以便 AI 提炼 SEO 关键词。'
          : 'Please enter a title or content first to suggest keywords.'
      );
      return;
    }
    setTagError(null);
    setIsSuggestingTags(true);

    try {
      const res = await fetch('/api/articles/suggest-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.keywords) && data.keywords.length > 0) {
          const incoming: string[] = data.keywords;
          // If tags list is default or empty, prefill all
          if (newTags.length === 0 || (newTags.length === 1 && newTags[0] === 'GEO优化')) {
            setNewTags(incoming);
            setSuggestedTags([]);
          } else {
            // Otherwise offer unselected suggestions
            const unselected = incoming.filter((k: string) => !newTags.includes(k));
            setSuggestedTags(unselected);
          }
          if (data.reasoning) {
            setSuggestionReasoning(data.reasoning);
          }
        }
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed' }));
        setTagError(err.error || (lang === 'zh' ? '关键词提取失败' : 'Failed to suggest tags'));
      }
    } catch (err) {
      console.error('Suggest tags error:', err);
      setTagError(lang === 'zh' ? '网络请求异常，请稍后重试' : 'Network error, please retry');
    } finally {
      setIsSuggestingTags(false);
    }
  };

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || newTags.includes(trimmed)) return;
    setNewTags([...newTags, trimmed]);
    setSuggestedTags((prev) => prev.filter((t) => t !== trimmed));
    setTagInput('');
    setTagError(null);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewTags(newTags.filter((t) => t !== tagToRemove));
  };

  const handleAddAllSuggestions = () => {
    const combined = Array.from(new Set([...newTags, ...suggestedTags]));
    setNewTags(combined);
    setSuggestedTags([]);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    onCreateArticle({
      title: newTitle,
      category: newCategory,
      content: newContent,
      summary: newContent.slice(0, 140) + '...',
      author: '桐灼GEO 团队',
      status: 'draft',
      seoKeywords: newTags.length > 0 ? newTags : ['GEO优化', newCategory],
    });

    setNewTitle('');
    setNewContent('');
    setNewTags(['GEO优化']);
    setTagInput('');
    setSuggestedTags([]);
    setSuggestionReasoning(null);
    setTagError(null);
    setIsNewModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-red-500" />
            {lang === 'zh' ? '内容库与质量审核' : 'Content Management & Review'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'zh'
              ? '管理已生成文章、把关人工审核道闸（防幻觉），并一键分发到远端 GEO 节点与博客。'
              : 'Audit generated articles, verify factual grounding, and distribute to multi-site endpoints.'}
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'zh' ? '新建内容' : 'New Article'}</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 overflow-x-auto">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedStatus === 'all' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'zh' ? '全部' : 'All'} ({articles.length})
          </button>
          <button
            onClick={() => setSelectedStatus('published')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedStatus === 'published' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'zh' ? '已发布' : 'Published'} ({articles.filter((a) => a.status === 'published').length})
          </button>
          <button
            onClick={() => setSelectedStatus('review')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedStatus === 'review' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'zh' ? '待审核' : 'Review'} ({articles.filter((a) => a.status === 'review').length})
          </button>
          <button
            onClick={() => setSelectedStatus('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedStatus === 'draft' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'zh' ? '草稿' : 'Drafts'} ({articles.filter((a) => a.status === 'draft').length})
          </button>
        </div>

        {/* Search & Category */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-red-500 transition"
          >
            <option value="all">{lang === 'zh' ? '全部分类' : 'All Categories'}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === 'zh' ? '搜索标题、关键词...' : 'Search articles...'}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl pl-8 pr-3 py-2 w-48 sm:w-60 focus:outline-none focus:border-red-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">{lang === 'zh' ? '文章标题' : 'Title'}</th>
                <th className="py-3 px-3">{lang === 'zh' ? '分类' : 'Category'}</th>
                <th className="py-3 px-3">{lang === 'zh' ? '状态' : 'Status'}</th>
                <th className="py-3 px-3">{lang === 'zh' ? 'GEO 体检' : 'GEO Score'}</th>
                <th className="py-3 px-3">{lang === 'zh' ? '分发渠道' : 'Distributed'}</th>
                <th className="py-3 px-3">{lang === 'zh' ? '浏览' : 'Views'}</th>
                <th className="py-3 px-3">{lang === 'zh' ? '更新日期' : 'Date'}</th>
                <th className="py-3 px-4 text-right">{lang === 'zh' ? '操作' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    {lang === 'zh' ? '没有找到符合条件的内容' : 'No articles found'}
                  </td>
                </tr>
              ) : (
                filteredArticles.map((art) => {
                  const audit = auditGeoReadiness(art.title, art.content, art.seoKeywords || []);
                  return (
                    <tr
                      key={art.id}
                      className="hover:bg-slate-800/40 transition group"
                    >
                      <td className="py-3.5 px-4 font-medium text-slate-100 max-w-sm">
                        <div
                          onClick={() => onSelectArticle(art)}
                          className="cursor-pointer group-hover:text-red-400 transition font-bold line-clamp-1"
                        >
                          {art.title}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {art.summary}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {art.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            art.status === 'published'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : art.status === 'review'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-slate-700/60 text-slate-300'
                          }`}
                        >
                          {art.status === 'published' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{lang === 'zh' ? '已上线' : 'Live'}</span>
                            </>
                          ) : art.status === 'review' ? (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>{lang === 'zh' ? '待审核' : 'Review'}</span>
                            </>
                          ) : (
                            <span>{lang === 'zh' ? '草稿' : 'Draft'}</span>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <button
                          onClick={() => setAuditTargetArticle(art)}
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border transition hover:opacity-80 ${
                            audit.overallScore >= 85
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : audit.overallScore >= 70
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                          title={lang === 'zh' ? '点击查看 GEO 深度体检报告' : 'Click to view GEO audit report'}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>{audit.overallScore} ({audit.grade})</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {art.distributedTo && art.distributedTo.length > 0 ? (
                          <span className="text-purple-400 flex items-center gap-1 font-semibold">
                            <Radio className="w-3 h-3" />
                            <span>{art.distributedTo.length} {lang === 'zh' ? '个渠道' : 'nodes'}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">{lang === 'zh' ? '未分发' : 'None'}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                        {art.views || 0}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                        {art.createdAt}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => setAuditTargetArticle(art)}
                          className="text-red-400 hover:text-red-300 p-1 hover:bg-slate-800 rounded transition"
                          title={lang === 'zh' ? 'GEO 深度体检与一键优化' : 'GEO Auditor'}
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onSelectArticle(art)}
                          className="text-slate-300 hover:text-white p-1 hover:bg-slate-800 rounded transition"
                          title={lang === 'zh' ? '查看与阅读' : 'Read'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDistributeTargetArticle(art)}
                          className="text-purple-400 hover:text-purple-300 p-1 hover:bg-slate-800 rounded transition"
                          title={lang === 'zh' ? '一键分发到渠道' : 'Distribute'}
                        >
                          <Radio className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteArticle(art.id)}
                          className="text-slate-400 hover:text-rose-400 p-1 hover:bg-slate-800 rounded transition"
                          title={lang === 'zh' ? '删除' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribute Modal */}
      {distributeTargetArticle && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-purple-400" />
                <span>{lang === 'zh' ? '多端渠道分发' : 'Distribute Article'}</span>
              </h3>
              <button
                onClick={() => setDistributeTargetArticle(null)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300">
              {lang === 'zh' ? '目标文章：' : 'Target:'}{' '}
              <strong className="text-white">{distributeTargetArticle.title}</strong>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">
                {lang === 'zh' ? '选择要分发的目标节点：' : 'Select Target Channels:'}
              </label>
              {channels.map((ch) => (
                <div
                  key={ch.id}
                  className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-200">{ch.name}</div>
                    <div className="text-[11px] text-slate-400">{ch.targetUrl}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {ch.type}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setDistributeTargetArticle(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                {lang === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  onDistributeArticle(distributeTargetArticle.id, channels.map((c) => c.id));
                  setDistributeTargetArticle(null);
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-sm"
              >
                {lang === 'zh' ? '立即全网分发' : 'Push to Channels'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Article Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-red-500" />
                <span>{lang === 'zh' ? '手动新建内容' : 'Create Article'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  {lang === 'zh' ? '标题' : 'Title'} *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition"
                  placeholder="e.g. 2026年企业级知识库向量化实战"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  {lang === 'zh' ? '分类' : 'Category'}
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  {lang === 'zh' ? '文章内容 (支持 GFM Markdown)' : 'Content (Markdown)'} *
                </label>
                <textarea
                  required
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition font-mono resize-none"
                  placeholder="# 一级标题&#10;&#10;输入正文 Markdown 内容..."
                />
              </div>

              {/* SEO Keywords & Automated Tagging */}
              <div className="space-y-2.5 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-bold text-slate-200">
                      {lang === 'zh' ? 'SEO / GEO 关键词标签' : 'SEO / GEO Keywords & Tags'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ({newTags.length})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSuggestTags}
                    disabled={isSuggestingTags}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-50 text-white shadow-md shadow-red-950/40 transition cursor-pointer self-start sm:self-auto"
                    title={lang === 'zh' ? '基于标题与正文通过 Gemini 自动提炼高意图 SEO 关键词' : 'Extract high-intent SEO keywords using Gemini'}
                  >
                    {isSuggestingTags ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{lang === 'zh' ? 'Gemini 智能分析中...' : 'Gemini Analyzing...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{lang === 'zh' ? 'AI 智能生成标签' : 'Suggest SEO Tags'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Tag Error notification */}
                {tagError && (
                  <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900/50 p-2 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{tagError}</span>
                  </div>
                )}

                {/* Active tags display & tag input */}
                <div className="flex flex-wrap items-center gap-1.5 min-h-[38px] p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                  {newTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700/80 group"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-slate-400 hover:text-red-400 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  <div className="flex items-center gap-1 flex-1 min-w-[140px]">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      placeholder={lang === 'zh' ? '输入标签按回车添加...' : 'Type tag & press Enter...'}
                      className="w-full bg-transparent text-xs text-white placeholder:text-slate-400 focus:outline-none px-1 py-0.5"
                    />
                    {tagInput.trim() && (
                      <button
                        type="button"
                        onClick={() => handleAddTag(tagInput)}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-white transition whitespace-nowrap"
                      >
                        {lang === 'zh' ? '添加' : 'Add'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Suggested tags shelf */}
                {suggestedTags.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-amber-400/90 flex items-center gap-1 font-medium">
                        <Lightbulb className="w-3 h-3" />
                        <span>{lang === 'zh' ? 'AI 候选建议标签 (点击快速加入)' : 'Suggested Tags (Click to add)'}:</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleAddAllSuggestions}
                        className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 transition cursor-pointer"
                      >
                        {lang === 'zh' ? '一键采纳全部' : 'Add All'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedTags.map((stag) => (
                        <button
                          type="button"
                          key={stag}
                          onClick={() => handleAddTag(stag)}
                          className="text-xs px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-red-950/40 text-slate-300 hover:text-red-300 border border-slate-700/80 hover:border-red-500/50 flex items-center gap-1 transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3 text-red-400" />
                          <span>{stag}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Reasoning */}
                {suggestionReasoning && (
                  <div className="text-[11px] text-slate-400 bg-slate-900/40 p-2 rounded-lg border border-slate-800/60 flex items-start gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>{suggestionReasoning}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                {lang === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-sm"
              >
                {lang === 'zh' ? '保存草稿' : 'Save Draft'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GEO Auditor Modal */}
      <GeoAuditorModal
        article={auditTargetArticle}
        isOpen={Boolean(auditTargetArticle)}
        onClose={() => setAuditTargetArticle(null)}
        onApplyOptimizedArticle={(updated) => {
          onCreateArticle(updated);
          setAuditTargetArticle(null);
        }}
        lang={lang}
      />
    </div>
  );
};
