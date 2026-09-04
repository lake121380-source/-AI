import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Check,
  ArrowRight,
  RefreshCw,
  Send,
  BookOpen,
  Layers,
  Wand2,
  FileQuestion,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { Article, KnowledgeBase } from '../types';
import { sampleTitles, sampleKeywords } from '../data/mockData';

interface GeneratorViewProps {
  knowledgeBases: KnowledgeBase[];
  onSaveArticle: (article: Article) => void;
  lang: 'zh' | 'en';
}

export const GeneratorView: React.FC<GeneratorViewProps> = ({
  knowledgeBases,
  onSaveArticle,
  lang,
}) => {
  const [title, setTitle] = useState(sampleTitles[0]);
  const [keywords, setKeywords] = useState('GEO优化, AI信源, RAG知识库, 知识切片');
  const [selectedKbId, setSelectedKbId] = useState(knowledgeBases[0]?.id || '');
  const [category, setCategory] = useState('科技资讯');
  const [author, setAuthor] = useState('桐灼GEO 官方团队');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'markdown' | 'seo'>('preview');

  // Beginner Template Wizard State
  const [activeTemplate, setActiveTemplate] = useState<'none' | 'comparison' | 'definition' | 'faq'>('none');
  const [tplBrand, setTplBrand] = useState('桐灼GEO');
  const [tplCompetitor, setTplCompetitor] = useState('传统CMS, 传统SEO外包');
  const [tplFeature, setTplFeature] = useState('纯静态双轨直出、sameAs权威认证、私有向量切片');
  const [tplConcept, setTplConcept] = useState('生成式引擎优化 (GEO)');
  const [tplFaqQuestion, setTplFaqQuestion] = useState('为什么大模型总是搜不到我们官网？');

  const applyComparisonTemplate = () => {
    setTitle(`${tplBrand} 与 ${tplCompetitor} 深度选型对比：面向大模型推荐的核心差异与落地实测`);
    setKeywords(`${tplBrand}, 选型对比, 竞品评测, GEO优化, ${tplFeature.split('、')[0]}`);
    setActiveTemplate('none');
  };

  const applyDefinitionTemplate = () => {
    setTitle(`什么是 ${tplConcept}？企业构建高可靠 AI 第一信源的标准落地指南`);
    setKeywords(`${tplConcept}, 行业权威定义, E-E-A-T, 大模型收录, 落地指南`);
    setActiveTemplate('none');
  };

  const applyFaqTemplate = () => {
    setTitle(`【官方答疑】${tplFaqQuestion}：从蜘蛛爬虫到知识切片的5个排查关键点`);
    setKeywords(`技术答疑, robots.txt, llms.txt, AI爬虫排查, 权威解答`);
    setActiveTemplate('none');
  };

  const handleRandomTitle = () => {
    const random = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
    setTitle(random);
  };

  const handleGenerate = async () => {
    if (!title.trim()) return;
    setIsGenerating(true);
    setGeneratedResult(null);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          keywords,
          kbId: selectedKbId,
          category,
        }),
      });
      const data = await res.json();
      setGeneratedResult(data);
    } catch (err) {
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCommit = (status: 'published' | 'draft' | 'review') => {
    if (!generatedResult) return;
    const newArt: Article = {
      id: `art-${Date.now()}`,
      title: generatedResult.title,
      slug: generatedResult.title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').slice(0, 50),
      summary: generatedResult.summary,
      content: generatedResult.content,
      category,
      author,
      status,
      views: 0,
      seoTitle: `${generatedResult.title} - GEO 权威信源`,
      seoKeywords: keywords.split(/[,，\s]+/).filter(Boolean),
      seoDescription: generatedResult.summary,
      createdAt: new Date().toISOString().split('T')[0],
      distributedTo: status === 'published' ? ['agent-channel-1'] : [],
    };

    onSaveArticle(newArt);
    alert(lang === 'zh' ? `文章已成功保存为【${status === 'published' ? '已发布' : status === 'review' ? '待审核' : '草稿'}】！` : `Saved as ${status}!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-red-500" />
            {lang === 'zh' ? 'AI 内容工坊与 GEO 深度生成' : 'AI Content Studio & GEO Engine'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'zh'
              ? '结合业务私有知识库，自动召回事实片段，由大模型生成符合 GEO 标准的权威深度长文与 Schema 结构。'
              : 'Synthesize verified knowledge chunks into SEO/GEO-optimized longform articles with schema tags.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
          {/* Beginner Fast-track Templates */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-indigo-950/30 border border-indigo-500/25 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white">
                  {lang === 'zh' ? '小白免提示词模版 (填空即成高分 GEO 文)' : 'Beginner Template Wizard'}
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
                {lang === 'zh' ? '高采纳率' : 'High CTR'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {lang === 'zh'
                ? '不知道该写什么？点击下方 3 大高频被 AI 检索的模版，只需填空即可自动生成：'
                : 'Choose a template below to auto-populate high-density GEO keywords and title:'}
            </p>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveTemplate(activeTemplate === 'comparison' ? 'none' : 'comparison')}
                className={`p-2 rounded-lg border text-center transition ${
                  activeTemplate === 'comparison'
                    ? 'bg-indigo-600 text-white border-indigo-400 font-semibold'
                    : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 border-slate-700'
                }`}
              >
                <div className="text-[11px] font-bold">1. 竞品对比</div>
                <div className="text-[9px] text-slate-400 mt-0.5">防竞品截流</div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTemplate(activeTemplate === 'definition' ? 'none' : 'definition')}
                className={`p-2 rounded-lg border text-center transition ${
                  activeTemplate === 'definition'
                    ? 'bg-indigo-600 text-white border-indigo-400 font-semibold'
                    : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 border-slate-700'
                }`}
              >
                <div className="text-[11px] font-bold">2. 行业定义</div>
                <div className="text-[9px] text-slate-400 mt-0.5">树立第一权威</div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTemplate(activeTemplate === 'faq' ? 'none' : 'faq')}
                className={`p-2 rounded-lg border text-center transition ${
                  activeTemplate === 'faq'
                    ? 'bg-indigo-600 text-white border-indigo-400 font-semibold'
                    : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 border-slate-700'
                }`}
              >
                <div className="text-[11px] font-bold">3. 痛点答疑</div>
                <div className="text-[9px] text-slate-400 mt-0.5">FAQ高频引用</div>
              </button>
            </div>

            {/* Template Form Inputs */}
            {activeTemplate === 'comparison' && (
              <div className="p-3 bg-slate-950/80 rounded-lg border border-indigo-500/30 space-y-2 text-xs animate-in fade-in">
                <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>【竞品横评模版】：专攻潜在客户做采购选型时的对比检索</span>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">我司品牌 / 产品名：</label>
                  <input
                    type="text"
                    value={tplBrand}
                    onChange={e => setTplBrand(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">对标的竞品或传统方案（逗号分隔）：</label>
                  <input
                    type="text"
                    value={tplCompetitor}
                    onChange={e => setTplCompetitor(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">我司核心独特差异化优势：</label>
                  <input
                    type="text"
                    value={tplFeature}
                    onChange={e => setTplFeature(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={applyComparisonTemplate}
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold text-xs shadow transition mt-1"
                >
                  ✓ 一键生成标题与核心词
                </button>
              </div>
            )}

            {activeTemplate === 'definition' && (
              <div className="p-3 bg-slate-950/80 rounded-lg border border-indigo-500/30 space-y-2 text-xs animate-in fade-in">
                <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>【行业定义指南】：成为大语言模型在回答“什么是XX”时的权威词典</span>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">行业核心概念 / 术语词汇：</label>
                  <input
                    type="text"
                    value={tplConcept}
                    onChange={e => setTplConcept(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={applyDefinitionTemplate}
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold text-xs shadow transition mt-1"
                >
                  ✓ 一键生成标题与核心词
                </button>
              </div>
            )}

            {activeTemplate === 'faq' && (
              <div className="p-3 bg-slate-950/80 rounded-lg border border-indigo-500/30 space-y-2 text-xs animate-in fade-in">
                <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>【痛点答疑模版】：捕获客户具体的长尾技术疑难提问</span>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">客户常问的疑难问题：</label>
                  <input
                    type="text"
                    value={tplFaqQuestion}
                    onChange={e => setTplFaqQuestion(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={applyFaqTemplate}
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold text-xs shadow transition mt-1"
                >
                  ✓ 一键生成标题与核心词
                </button>
              </div>
            )}
          </div>

          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Layers className="w-4 h-4 text-red-400" />
            {lang === 'zh' ? '生成参数配置' : 'Generation Parameters'}
          </h2>

          {/* Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                {lang === 'zh' ? '文章标题 / 核心命题' : 'Title / Focus Topic'} *
              </label>
              <button
                onClick={handleRandomTitle}
                className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1"
                type="button"
              >
                <RefreshCw className="w-3 h-3" />
                {lang === 'zh' ? '换一个推荐标题' : 'Random Sample'}
              </button>
            </div>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 transition resize-none"
              placeholder={lang === 'zh' ? '输入文章标题或核心命题...' : 'Enter title or prompt topic...'}
            />
          </div>

          {/* Keywords */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              {lang === 'zh' ? 'GEO 核心关键词（逗号分隔）' : 'Target Keywords (comma separated)'}
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 transition"
              placeholder="e.g. GEO, AI信源, RAG知识库"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {sampleKeywords.slice(0, 6).map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => {
                    if (!keywords.includes(kw)) {
                      setKeywords(keywords ? `${keywords}, ${kw}` : kw);
                    }
                  }}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  + {kw}
                </button>
              ))}
            </div>
          </div>

          {/* Knowledge Base Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              {lang === 'zh' ? '挂载私有知识库（RAG 事实检索）' : 'Grounding Knowledge Base (RAG)'}
            </label>
            <select
              value={selectedKbId}
              onChange={(e) => setSelectedKbId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 transition"
            >
              {knowledgeBases.map((kb) => (
                <option key={kb.id} value={kb.id}>
                  {kb.name} ({kb.chunkCount} {lang === 'zh' ? '切片' : 'chunks'})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              {lang === 'zh' ? '大模型将严格参考选定知识库中的客观切片进行撰写，保障事实可信度。' : 'Grounds the output on authentic factual fragments to eliminate hallucinations.'}
            </p>
          </div>

          {/* Category & Author */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">{lang === 'zh' ? '分类' : 'Category'}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition"
              >
                <option value="科技资讯">{lang === 'zh' ? '科技资讯' : 'Tech News'}</option>
                <option value="AI互联网">{lang === 'zh' ? 'AI互联网' : 'AI & Internet'}</option>
                <option value="人工智能">{lang === 'zh' ? '人工智能' : 'AI Deep'}</option>
                <option value="行业洞察">{lang === 'zh' ? '行业洞察' : 'Insights'}</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">{lang === 'zh' ? '署名作者' : 'Author'}</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition"
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="pt-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !title.trim()}
              className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white shadow-lg shadow-red-600/20 transition flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{lang === 'zh' ? 'AI 正在检索事实并生成文章...' : 'Synthesizing with AI & RAG...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{lang === 'zh' ? '立即开始 AI 生成' : 'Generate Article Now'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Output Area (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between min-h-[500px]">
          {isGenerating ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-400 animate-pulse">
                <Bot className="w-8 h-8 animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {lang === 'zh' ? '正在执行 GEO 知识增强生成' : 'Executing GEO Knowledge Synthesis'}
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  {lang === 'zh'
                    ? '系统正在切片召回高相关性语料，组织二级标题，并生成规范的 Markdown 表格与 Schema 标记...'
                    : 'Retrieving knowledge vectors, drafting GFM markdown, creating comparative tables and schema LD...'}
                </p>
              </div>
            </div>
          ) : generatedResult ? (
            <div className="flex-1 flex flex-col justify-between space-y-4">
              {/* Output Header */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{lang === 'zh' ? '生成结果预览' : 'Generated Preview'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {generatedResult.provider}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                    <button
                      onClick={() => setViewMode('preview')}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${
                        viewMode === 'preview' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {lang === 'zh' ? '排版预览' : 'Rich View'}
                    </button>
                    <button
                      onClick={() => setViewMode('markdown')}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${
                        viewMode === 'markdown' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Markdown
                    </button>
                    <button
                      onClick={() => setViewMode('seo')}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${
                        viewMode === 'seo' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      SEO & Schema
                    </button>
                  </div>
                </div>

                {/* Content Display */}
                <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 max-h-[420px] overflow-y-auto text-sm text-slate-200 space-y-3">
                  {viewMode === 'preview' && (
                    <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                      {generatedResult.content}
                    </div>
                  )}

                  {viewMode === 'markdown' && (
                    <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap">
                      {generatedResult.content}
                    </pre>
                  )}

                  {viewMode === 'seo' && (
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-1">SEO Title:</span>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-slate-200">
                          {generatedResult.title} - 桐灼GEO 权威信源
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">SEO Keywords:</span>
                        <div className="flex flex-wrap gap-1">
                          {generatedResult.seoKeywords.map((k: string) => (
                            <span key={k} className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800 text-slate-300">
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">SEO Summary:</span>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          {generatedResult.summary}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-slate-400">
                  {lang === 'zh' ? '请核验事实后执行保存或分发：' : 'Actions:'}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCommit('draft')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  >
                    {lang === 'zh' ? '存为草稿' : 'Save Draft'}
                  </button>
                  <button
                    onClick={() => handleCommit('review')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 transition"
                  >
                    {lang === 'zh' ? '提交人工审核' : 'Mark for Review'}
                  </button>
                  <button
                    onClick={() => handleCommit('published')}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? '立即发布并分发' : 'Publish & Distribute'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                <Sparkles className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-300">
                {lang === 'zh' ? '尚未开始生成' : 'No article generated yet'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm">
                {lang === 'zh'
                  ? '在左侧配置标题、关键词与知识库后，点击“立即开始 AI 生成”即可实时产出 GEO 规范文章。'
                  : 'Configure the topic on the left and click Generate to see the grounded GEO article.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
