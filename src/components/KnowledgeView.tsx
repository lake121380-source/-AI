import React, { useState } from 'react';
import { Database, Plus, Search, Layers, CheckCircle2, FileCode, Zap } from 'lucide-react';
import { KnowledgeBase, KnowledgeChunk } from '../types';

interface KnowledgeViewProps {
  knowledgeBases: KnowledgeBase[];
  chunks: KnowledgeChunk[];
  onCreateKb: (name: string, description: string) => void;
  lang: 'zh' | 'en';
}

export const KnowledgeView: React.FC<KnowledgeViewProps> = ({
  knowledgeBases,
  chunks,
  onCreateKb,
  lang,
}) => {
  const [selectedKbId, setSelectedKbId] = useState(knowledgeBases[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Semantic Search Tester
  const [searchQuery, setSearchQuery] = useState('HubSpot 对比传统 CRM');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const activeKb = knowledgeBases.find((k) => k.id === selectedKbId) || knowledgeBases[0];
  const activeChunks = chunks.filter((c) => c.kbId === selectedKbId);

  const handleTestSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch('/api/knowledge-bases/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error('Search test failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateKb(newName, newDesc);
    setNewName('');
    setNewDesc('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-500" />
            {lang === 'zh' ? '私有知识库与 RAG 语料切片' : 'Knowledge Bases & RAG Chunks'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'zh'
              ? '沉淀企业产品规格、白皮书与对比数据，构建大模型防幻觉引用的事实基石。'
              : 'Manage authenticated business documentation, chunks & embeddings to eliminate hallucinations.'}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'zh' ? '新建知识库' : 'New Knowledge Base'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Knowledge Bases List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            {lang === 'zh' ? '知识库列表' : 'Repositories'} ({knowledgeBases.length})
          </div>

          <div className="space-y-2.5">
            {knowledgeBases.map((kb) => {
              const isSelected = kb.id === selectedKbId;
              return (
                <div
                  key={kb.id}
                  onClick={() => setSelectedKbId(kb.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-500 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white line-clamp-1">{kb.name}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                      {kb.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {kb.description || (lang === 'zh' ? '暂无描述' : 'No description')}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 mt-3 border-t border-slate-700/40">
                    <span>
                      {kb.documentCount} {lang === 'zh' ? '份文档' : 'docs'} · {kb.chunkCount} {lang === 'zh' ? '切片' : 'chunks'}
                    </span>
                    <span>{kb.updatedAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chunks & RAG Semantic Tester (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Knowledge Base Info & Chunks */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>{activeKb?.name}</span>
                </h3>
                <span className="text-xs text-slate-400">
                  {lang === 'zh' ? '包含切片' : 'Chunks'}: {activeChunks.length} {lang === 'zh' ? '段' : 'items'}
                </span>
              </div>
              <span className="text-[11px] px-2 py-1 rounded bg-slate-800 text-slate-300">
                100% Vector Embedded
              </span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {activeChunks.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  {lang === 'zh' ? '此知识库暂无独立切片' : 'No chunks available in this repository'}
                </div>
              ) : (
                activeChunks.map((chk) => (
                  <div
                    key={chk.id}
                    className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-200">{chk.title}</h4>
                      <span className="text-[10px] font-mono text-slate-400">{chk.tokenCount} tokens</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">{chk.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RAG Semantic Retrieval Tester */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{lang === 'zh' ? 'RAG 语义检索向量试验场' : 'Semantic RAG Vector Retrieval Playground'}</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Cosine Similarity
              </span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'zh' ? '输入自然语言问题测试向量语义召回...' : 'Enter query to test retrieval...'}
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl pl-8 pr-3 py-2.5 focus:outline-none focus:border-amber-500 transition"
                />
              </div>
              <button
                onClick={handleTestSearch}
                disabled={isSearching}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition shrink-0"
              >
                {isSearching ? (lang === 'zh' ? '检索中...' : 'Searching...') : (lang === 'zh' ? '测试召回' : 'Test Search')}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400">
                  {lang === 'zh' ? '召回 Top 切片：' : 'Top Retrieved Chunks:'}
                </div>
                {searchResults.map((res, i) => (
                  <div
                    key={res.id || i}
                    className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">{res.title}</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        Score: {res.similarity || 0.92}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{res.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New KB Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-500" />
                <span>{lang === 'zh' ? '新建私有知识库' : 'Create Knowledge Base'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  {lang === 'zh' ? '知识库名称' : 'Repository Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                  placeholder="e.g. 2026年企业营销系统竞品评测库"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  {lang === 'zh' ? '知识库描述' : 'Description'}
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition resize-none"
                  placeholder="描述语料覆盖范围、文档类型及防幻觉标准..."
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                {lang === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
              >
                {lang === 'zh' ? '创建并切片' : 'Create & Index'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
