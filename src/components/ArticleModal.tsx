import React, { useState } from 'react';
import { FileText, Eye, Radio, Send, CheckCircle2, X, Tag, ShieldCheck } from 'lucide-react';
import { Article } from '../types';
import { GeoAuditorModal } from './GeoAuditorModal';
import { auditGeoReadiness } from '../utils/geoAuditor';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
  onPublish: (id: string) => void;
  onDistribute: (id: string) => void;
  onUpdateArticle?: (updated: Article) => void;
  lang: 'zh' | 'en';
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  onPublish,
  onDistribute,
  onUpdateArticle,
  lang,
}) => {
  const [showAuditor, setShowAuditor] = useState(false);

  if (!article) return null;

  const audit = auditGeoReadiness(article.title, article.content, article.seoKeywords || []);

  const handleApplyOptimized = (updated: Article) => {
    if (onUpdateArticle) {
      onUpdateArticle(updated);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
          {/* Modal Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                {article.category}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  article.status === 'published'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                {article.status}
              </span>
              <button
                onClick={() => setShowAuditor(true)}
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border transition hover:opacity-90 ${
                  audit.overallScore >= 85
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : audit.overallScore >= 70
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>GEO 体检: {audit.overallScore}分 ({audit.grade})</span>
              </button>
              <span className="text-xs text-slate-400 ml-1">{article.createdAt}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
            <div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {article.title}
                </h1>
                <button
                  onClick={() => setShowAuditor(true)}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                  <span>{lang === 'zh' ? '开启 GEO 深度体检' : 'Open GEO Auditor'}</span>
                </button>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                <span>{lang === 'zh' ? '作者' : 'Author'}: {article.author}</span>
                <span>{lang === 'zh' ? '阅读量' : 'Views'}: {article.views || 0}</span>
                {article.distributedTo?.length > 0 && (
                  <span className="text-purple-400">
                    {lang === 'zh' ? '已分发至' : 'Synced to'} {article.distributedTo.length} {lang === 'zh' ? '个渠道' : 'channels'}
                  </span>
                )}
              </div>
            </div>

            {/* Keywords */}
            {article.seoKeywords?.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <Tag className="w-3.5 h-3.5 text-red-400 mr-1" />
                {article.seoKeywords.map((kw) => (
                  <span key={kw} className="text-[11px] px-2 py-0.5 bg-slate-800/80 rounded-md border border-slate-700/60 text-slate-300">
                    {kw}
                  </span>
                ))}
              </div>
            )}

            {/* Markdown Content Display */}
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 prose prose-invert max-w-none text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
              {article.content}
            </div>

            {/* SEO Metadata Box */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-xs space-y-2">
              <div className="font-bold text-slate-300">{lang === 'zh' ? 'SEO / GEO 元信息' : 'SEO & GEO Metadata'}</div>
              <div className="text-slate-400">
                <strong className="text-slate-300">Summary: </strong>
                {article.summary}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
            <div className="text-xs text-slate-400">ID: {article.id}</div>
            <div className="flex items-center gap-2">
              {article.status !== 'published' && (
                <button
                  onClick={() => {
                    onPublish(article.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{lang === 'zh' ? '通过终审并上线' : 'Approve & Publish'}</span>
                </button>
              )}
              <button
                onClick={() => {
                  onDistribute(article.id);
                  onClose();
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition flex items-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{lang === 'zh' ? '一键推送到多站点' : 'Distribute to Sites'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded GEO Auditor Modal */}
      <GeoAuditorModal
        article={article}
        isOpen={showAuditor}
        onClose={() => setShowAuditor(false)}
        onApplyOptimizedArticle={handleApplyOptimized}
        lang={lang}
      />
    </>
  );
};
