import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  ExternalLink,
  Plus,
  Trash2,
  Copy,
  Download,
  Save,
  Check,
  Building2,
  Terminal,
  Code2,
} from 'lucide-react';
import { BrandEntityConfig, SameAsLink, EeatAuditReport } from '../types';
import { initialBrandEntityConfig, sampleEeatAuditReport } from '../data/mockData';

interface BrandEntityEeatViewProps {
  lang: 'zh' | 'en';
}

export const BrandEntityEeatView: React.FC<BrandEntityEeatViewProps> = ({ lang }) => {
  const [config, setConfig] = useState<BrandEntityConfig>(initialBrandEntityConfig);
  const [eeatReport, setEeatReport] = useState<EeatAuditReport>(sampleEeatAuditReport);
  const [jsonLdScript, setJsonLdScript] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlatformName, setNewPlatformName] = useState('');
  const [newPlatformUrl, setNewPlatformUrl] = useState('');
  const [activeCodeView, setActiveCodeView] = useState<'jsonld' | 'nextjs' | 'html'>('jsonld');
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/brand-entity')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.config) setConfig(data.config);
          if (data.eeatReport) setEeatReport(data.eeatReport);
          if (data.jsonLdScript) setJsonLdScript(data.jsonLdScript);
        }
      })
      .catch((err) => console.warn('Fetch brand entity error:', err));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/brand-entity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.jsonLdScript) setJsonLdScript(data.jsonLdScript);
        if (data.eeatReport) setEeatReport(data.eeatReport);
        showToast(
          lang === 'zh'
            ? '品牌实体消歧元数据与 Schema.org sameAs 已全网更新！'
            : 'Brand entity Schema & sameAs anchors updated!'
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSameAs = () => {
    if (!newPlatformName.trim() || !newPlatformUrl.trim()) return;
    const newLink: SameAsLink = {
      id: `sameas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      platform: 'baike',
      platformName: newPlatformName.trim(),
      url: newPlatformUrl.trim(),
      verified: true,
      authorityWeight: 85,
    };
    setConfig((prev) => ({
      ...prev,
      sameAsLinks: [...prev.sameAsLinks, newLink],
    }));
    setNewPlatformName('');
    setNewPlatformUrl('');
    setShowAddModal(false);
    showToast(lang === 'zh' ? '已添加权威外部信源节点！' : 'Added external authority node!');
  };

  const handleRemoveSameAs = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      sameAsLinks: prev.sameAsLinks.filter((l) => l.id !== id),
    }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonLdScript], { type: 'application/ld+json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'brand-organization-schema.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const nextJsSnippet = `// app/layout.tsx (Next.js 14+ App Router 品牌实体注入)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const brandJsonLd = ${jsonLdScript.trim() || '{}'};

  return (
    <html lang="zh-CN">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(brandJsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}`;

  const htmlSnippet = `<!-- 放置于官网 index.html <head> 标签内部 -->
<script type="application/ld+json">
${jsonLdScript}
</script>`;

  const getCodeSnippet = () => {
    if (activeCodeView === 'nextjs') return nextJsSnippet;
    if (activeCodeView === 'html') return htmlSnippet;
    return jsonLdScript;
  };

  return (
    <div className="space-y-6" id="brand-entity-container">
      {/* Toast */}
      {toastMsg && (
        <div
          id="brand-toast"
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
              <Award className="h-3.5 w-3.5" />
              {lang === 'zh' ? '阶段 2 · 知识图谱对齐' : 'Phase 2 · Entity Disambiguation'}
            </span>
            <span className="text-xs text-slate-400">
              {lang === 'zh' ? 'Schema.org sameAs 实体锚定' : 'E-E-A-T & Knowledge Graph'}
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            {lang === 'zh' ? '品牌实体消歧与 E-E-A-T 权威锚定中心' : 'Brand Entity Disambiguation & E-E-A-T Hub'}
          </h2>
          <p className="text-sm text-slate-400">
            {lang === 'zh'
              ? '大模型在生成答案时，优先信任具备清晰实体拓扑的企业。通过 sameAs 将官网与百科、工信部、Crunchbase 权威节点强绑定，消除实体歧义并激活顶级可信度。'
              : 'Anchor your organization entity with external authoritative knowledge bases (Baidu Baike, Wikipedia, Crunchbase, Gov registries) to maximize LLM citation confidence.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving
              ? lang === 'zh'
                ? '保存并生成 Schema 中...'
                : 'Saving...'
              : lang === 'zh'
              ? '保存并应用实体配置'
              : 'Save Entity'}
          </button>
        </div>
      </div>

      {/* E-E-A-T 4-Dimension Highlight Cards with Tabular Nums */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Experience */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">
              {lang === 'zh' ? 'E · 一线实操经验 (Experience)' : 'Experience'}
            </span>
            <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-xs font-bold text-indigo-300 border border-indigo-500/30 font-mono tabular-nums">
              {eeatReport.dimensions.experience.score}分
            </span>
          </div>
          <div className="mt-2 text-xs font-medium text-white">
            {eeatReport.dimensions.experience.verdict}
          </div>
          <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
            {eeatReport.dimensions.experience.highlights.join('；')}
          </p>
        </div>

        {/* Expertise */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">
              {lang === 'zh' ? 'E · 技术领域专业度 (Expertise)' : 'Expertise'}
            </span>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/30 font-mono tabular-nums">
              {eeatReport.dimensions.expertise.score}分
            </span>
          </div>
          <div className="mt-2 text-xs font-medium text-white">
            {eeatReport.dimensions.expertise.verdict}
          </div>
          <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
            {eeatReport.dimensions.expertise.highlights.join('；')}
          </p>
        </div>

        {/* Authoritativeness */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">
              {lang === 'zh' ? 'A · 外部权威性 (Authoritativeness)' : 'Authoritativeness'}
            </span>
            <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-xs font-bold text-indigo-300 border border-indigo-500/30 font-mono tabular-nums">
              {eeatReport.dimensions.authoritativeness.score}分
            </span>
          </div>
          <div className="mt-2 text-xs font-medium text-white">
            {eeatReport.dimensions.authoritativeness.verdict}
          </div>
          <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
            {eeatReport.dimensions.authoritativeness.highlights.join('；')}
          </p>
        </div>

        {/* Trustworthiness */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">
              {lang === 'zh' ? 'T · 综合可信赖度 (Trustworthiness)' : 'Trustworthiness'}
            </span>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/30 font-mono tabular-nums">
              {eeatReport.dimensions.trustworthiness.score}分
            </span>
          </div>
          <div className="mt-2 text-xs font-medium text-white">
            {eeatReport.dimensions.trustworthiness.verdict}
          </div>
          <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
            {eeatReport.dimensions.trustworthiness.highlights.join('；')}
          </p>
        </div>
      </div>

      {/* Main Grid: Form on Left (6 cols), Preview & DevOps on Right (6 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column (6 cols) */}
        <div className="space-y-6 lg:col-span-6">
          {/* Base Entity Profile */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">
                {lang === 'zh' ? '企业实体基础信息档案' : 'Organization Entity Profile'}
              </h3>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 text-xs">
              <div>
                <label className="font-semibold text-slate-300">
                  {lang === 'zh' ? '企业品牌通用名称' : 'Organization Name'}
                </label>
                <input
                  type="text"
                  value={config.organizationName}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, organizationName: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300">
                  {lang === 'zh' ? '简称或代称 (Alternate Name)' : 'Alternate Name'}
                </label>
                <input
                  type="text"
                  value={config.alternateName}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, alternateName: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300">
                  {lang === 'zh' ? '工商注册法人全称 (Legal Name)' : 'Legal Name'}
                </label>
                <input
                  type="text"
                  value={config.legalName}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, legalName: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300">
                  {lang === 'zh' ? '官方唯一根域名' : 'Official Domain'}
                </label>
                <input
                  type="url"
                  value={config.officialDomain}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, officialDomain: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* SameAs Authority Anchors */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  {lang === 'zh' ? 'Schema sameAs 外部权威信源锚定列表' : 'sameAs Authority Node Anchors'}
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  {lang === 'zh'
                    ? '大模型知识图谱会定期交叉比对以下外部实体，确认你的品牌真实存在且权威可信。'
                    : 'Entities cross-referenced by LLMs to verify organizational authenticity.'}
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
              >
                <Plus className="h-3 w-3" />
                {lang === 'zh' ? '添加节点' : 'Add Node'}
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {config.sameAsLinks.map((item, idx) => (
                <div
                  key={item.id || `sameas-item-${idx}`}
                  className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/60 p-3 text-xs hover:bg-slate-800/40 transition"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">
                        {item.platformName}
                      </span>
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-medium text-emerald-300 border border-emerald-500/30 font-mono tabular-nums">
                        权重 {item.authorityWeight}
                      </span>
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:underline"
                    >
                      <span className="truncate max-w-[280px]">{item.url}</span>
                      <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                    </a>
                  </div>

                  <button
                    onClick={() => handleRemoveSameAs(item.id)}
                    className="text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Schema.org JSON-LD Code & DevOps Injection (6 cols) */}
        <div className="space-y-4 lg:col-span-6">
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => setActiveCodeView('jsonld')}
                    className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                      activeCodeView === 'jsonld'
                        ? 'bg-slate-800 text-indigo-400 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Schema.jsonld
                  </button>
                  <button
                    onClick={() => setActiveCodeView('nextjs')}
                    className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                      activeCodeView === 'nextjs'
                        ? 'bg-slate-800 text-indigo-400 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Next.js (layout.tsx)
                  </button>
                  <button
                    onClick={() => setActiveCodeView('html')}
                    className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                      activeCodeView === 'html'
                        ? 'bg-slate-800 text-indigo-400 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    HTML Head
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(getCodeSnippet())}
                  className="inline-flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300 border border-slate-700 hover:bg-slate-700"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copied ? (lang === 'zh' ? '已复制' : 'Copied') : (lang === 'zh' ? '复制' : 'Copy')}
                </button>
                {activeCodeView === 'jsonld' && (
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300 border border-slate-700 hover:bg-slate-700"
                  >
                    <Download className="h-3 w-3" />
                    {lang === 'zh' ? '下载' : 'Download'}
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-950 font-mono text-xs text-indigo-300/90 overflow-x-auto max-h-[500px] leading-relaxed select-all">
              <pre className="whitespace-pre">
                {getCodeSnippet()
                  .split('\n')
                  .map((line, idx) => (
                    <div key={idx} className="hover:bg-slate-900/60 px-1 rounded flex">
                      <span className="w-8 select-none text-slate-400 text-right pr-3 tabular-nums">
                        {idx + 1}
                      </span>
                      <span>{line}</span>
                    </div>
                  ))}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Add SameAs Node Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              {lang === 'zh' ? '添加权威外部实体节点 (sameAs)' : 'Add Authority Node'}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              {lang === 'zh'
                ? '例如维基百科、百度百科、企查查、Crunchbase、GitHub 或官方社交媒体机构主页。'
                : 'Enter authoritative external profile URL to anchor.'}
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300">
                  {lang === 'zh' ? '平台名称与类型' : 'Platform Name'}
                </label>
                <input
                  type="text"
                  value={newPlatformName}
                  onChange={(e) => setNewPlatformName(e.target.value)}
                  placeholder={lang === 'zh' ? '例如: 维基百科英文词条 / 企查查官方核准' : 'e.g. Wikipedia / Crunchbase'}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">
                  {lang === 'zh' ? '权威主页或词条 URL' : 'Entity URL'}
                </label>
                <input
                  type="url"
                  value={newPlatformUrl}
                  onChange={(e) => setNewPlatformUrl(e.target.value)}
                  placeholder="https://en.wikipedia.org/wiki/..."
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition cursor-pointer"
              >
                {lang === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                onClick={handleAddSameAs}
                disabled={!newPlatformName.trim() || !newPlatformUrl.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer"
              >
                {lang === 'zh' ? '确认添加' : 'Add Node'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
