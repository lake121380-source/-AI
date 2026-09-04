import React, { useState } from 'react';
import {
  Globe,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  Download,
  Copy,
  Sparkles,
  Bot,
  FileText,
  Table,
  Cpu,
  Layers,
  Check,
} from 'lucide-react';
import { UrlScanReport, UrlScanItem } from '../types';
import { sampleUrlScanReports } from '../data/mockData';

interface UrlScannerViewProps {
  lang: 'zh' | 'en';
}

export const UrlScannerView: React.FC<UrlScannerViewProps> = ({ lang }) => {
  const [urlInput, setUrlInput] = useState('https://tongzhuo-geo.local/articles/hubspot-vs-crm-geo-content-trust');
  const [isScanning, setIsScanning] = useState(false);
  const [report, setReport] = useState<UrlScanReport>(sampleUrlScanReports.default);
  const [copied, setCopied] = useState(false);

  const handleScan = async (overrideUrl?: string) => {
    const target = overrideUrl || urlInput;
    if (!target.trim()) return;
    setIsScanning(true);

    try {
      const res = await fetch('/api/url-scanner/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (e) {
      console.error('Scan error:', e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCopyReport = () => {
    let md = `# GEO 深度体检诊断报告\n`;
    md += `测试网址: ${report.url}\n`;
    md += `体检时间: ${report.scannedAt}\n`;
    md += `综合得分: ${report.overallScore} / 100 (评级: ${report.grade})\n\n`;
    md += `## 核心工程指标诊断\n`;
    report.items.forEach((item) => {
      md += `### [${item.status.toUpperCase()}] ${item.dimension} - ${item.score}分\n`;
      md += `- 详情: ${item.details}\n`;
      md += `- 优化建议: ${item.recommendation}\n\n`;
    });
    md += `## 优先级修复方案\n`;
    report.quickFixPlan.forEach((plan, i) => {
      md += `${i + 1}. ${plan}\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadReport = () => {
    let md = `# GEO 深度体检诊断报告\n`;
    md += `测试网址: ${report.url}\n`;
    md += `体检时间: ${report.scannedAt}\n`;
    md += `综合得分: ${report.overallScore} / 100 (评级: ${report.grade})\n\n`;
    report.items.forEach((item) => {
      md += `### [${item.status.toUpperCase()}] ${item.dimension} - ${item.score}分\n`;
      md += `- 详情: ${item.details}\n`;
      md += `- 优化建议: ${item.recommendation}\n\n`;
    });
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `geo-scan-report-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" id="url-scanner-container">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-950/60 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-800/50">
              <Globe className="h-3.5 w-3.5" />
              {lang === 'zh' ? '模块 C · 全站 GEO 体检' : 'Module C · URL Scanner'}
            </span>
            <span className="text-xs text-slate-400">
              {lang === 'zh' ? '涵盖 robots.txt / llms.txt / Schema / 表格' : 'Multi-point verification'}
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            {lang === 'zh' ? '外站/全站 URL 一键 GEO 深度体检器' : 'Universal URL GEO Deep Inspector'}
          </h2>
          <p className="text-sm text-slate-300">
            {lang === 'zh'
              ? '输入任意网址，全方位自动化探测 AI 爬虫放行、/llms.txt 规范度、Schema 微数据、GFM 表格密度与去虚词比。'
              : 'Scan any target domain or article URL to verify LLM crawler readiness, structured data, and knowledge density.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyReport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? (lang === 'zh' ? '已复制报告' : 'Copied!') : (lang === 'zh' ? '复制诊断书' : 'Copy Report')}
          </button>
          <button
            onClick={handleDownloadReport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
          >
            <Download className="h-3.5 w-3.5" />
            {lang === 'zh' ? '导出报告 (MD)' : 'Export MD'}
          </button>
        </div>
      </div>

      {/* URL Input & Presets Box */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
        <label className="block text-xs font-semibold text-slate-300">
          {lang === 'zh' ? '目标网站或落地页完整 URL' : 'Target Domain or Page URL'}
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/page-to-test"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition"
            />
          </div>
          <button
            onClick={() => handleScan()}
            disabled={isScanning || !urlInput.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer"
          >
            <Search className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning
              ? lang === 'zh'
                ? '深度诊断中...'
                : 'Inspecting...'
              : lang === 'zh'
              ? '立即深度体检'
              : 'Inspect URL'}
          </button>
        </div>

        {/* Quick presets */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span>{lang === 'zh' ? '快速测试预设：' : 'Quick Samples:'}</span>
          <button
            onClick={() => {
              const u = 'https://tongzhuo-geo.local/articles/hubspot-vs-crm-geo-content-trust';
              setUrlInput(u);
              handleScan(u);
            }}
            className="rounded bg-indigo-950/60 px-2 py-0.5 text-indigo-300 border border-indigo-800/50 hover:bg-indigo-900/60 transition"
          >
            {lang === 'zh' ? '本站规范文章 (桐灼GEO 标杆)' : 'Our Standard Article (Benchmark)'}
          </button>
          <button
            onClick={() => {
              const u = 'https://example-legacy-seo.com/blog/article-1';
              setUrlInput(u);
              handleScan(u);
            }}
            className="rounded bg-slate-800 px-2 py-0.5 text-slate-300 border border-slate-700 hover:bg-slate-700 transition"
          >
            {lang === 'zh' ? '传统SEO低分页面 (竞品/未优化站)' : 'Legacy SEO Site (Unoptimized)'}
          </button>
        </div>
      </div>

      {/* Score Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Overall Score */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm lg:col-span-1">
          <div className="text-xs font-medium text-slate-400">
            {lang === 'zh' ? '综合 GEO 就绪得分' : 'GEO Readiness Score'}
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-4xl font-extrabold tracking-tight ${
                report.overallScore >= 85
                  ? 'text-emerald-400'
                  : report.overallScore >= 70
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {report.overallScore}
            </span>
            <span className="text-sm font-semibold text-slate-400">/ 100</span>
            <span
              className={`rounded px-1.5 py-0.5 text-xs font-bold ${
                report.overallScore >= 85
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                  : report.overallScore >= 70
                  ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                  : 'bg-rose-950 text-rose-300 border border-rose-800/40'
              }`}
            >
              {report.grade}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {report.overallScore >= 85
              ? lang === 'zh'
                ? '表现卓越，极利于大模型首屏推荐引用'
                : 'Excellent, primed for LLM citations'
              : lang === 'zh'
              ? '存在明显短板，极易被大模型过滤'
              : 'Has critical gaps affecting citation'}
          </p>
        </div>

        {/* robots.txt status */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Bot className="h-3.5 w-3.5 text-slate-400" />
            <span>robots.txt 放行</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 font-bold text-white text-sm">
            {report.robotsTxtStatus.gptBotAllowed ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <XCircle className="h-4 w-4 text-rose-400" />
            )}
            <span>{report.robotsTxtStatus.gptBotAllowed ? '放行 GPT/Perplexity' : '存在阻拦'}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            ByteSpider: {report.robotsTxtStatus.bytespiderAllowed ? '已允许' : '未明确放行'}
          </p>
        </div>

        {/* llms.txt status */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <FileCheck className="h-3.5 w-3.5 text-slate-400" />
            <span>/llms.txt 规范</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 font-bold text-white text-sm">
            {report.llmsTxtStatus.present ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <XCircle className="h-4 w-4 text-rose-400" />
            )}
            <span>{report.llmsTxtStatus.present ? '已规范部署' : '未检测到索引'}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {report.llmsTxtStatus.present
              ? `${report.llmsTxtStatus.urlCount} 篇语料 · 指令完备`
              : '大模型需耗巨量Token抓取'}
          </p>
        </div>

        {/* Schema.org status */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Layers className="h-3.5 w-3.5 text-slate-400" />
            <span>Schema.org 标记</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 font-bold text-white text-sm">
            {report.schemaStatus.hasSchema ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            )}
            <span>{report.schemaStatus.hasSchema ? 'JSON-LD 完备' : '标记缺失'}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {report.schemaStatus.typesFound.join(', ')}
          </p>
        </div>

        {/* Tables & Fluff */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Table className="h-3.5 w-3.5 text-slate-400" />
            <span>表格与废话比</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 font-bold text-white text-sm">
            <span>{report.contentQuality.tableCount} 个GFM表格</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            废话虚词占比: {report.contentQuality.fluffRatio}% ({report.contentQuality.fluffRatio < 10 ? '优' : '偏高'})
          </p>
        </div>
      </div>

      {/* Detailed Diagnostic Items */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white">
          {lang === 'zh' ? '5 维度细粒度体检结果与诊断' : 'Detailed Dimension Diagnostics'}
        </h3>

        <div className="space-y-3">
          {report.items.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  {item.status === 'pass' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : item.status === 'warning' ? (
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-400" />
                  )}
                  <span className="font-semibold text-white text-sm">
                    {item.dimension}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                      item.status === 'pass'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                        : item.status === 'warning'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                        : 'bg-rose-950 text-rose-300 border border-rose-800/40'
                    }`}
                  >
                    {item.score}分
                  </span>
                </div>
              </div>

              <div className="mt-2 text-xs font-medium text-slate-200">
                {item.title}
              </div>

              <div className="mt-1.5 text-xs text-slate-400">
                {item.details}
              </div>

              <div className="mt-2.5 rounded-lg bg-slate-800/60 p-2.5 text-xs border border-slate-800">
                <span className="font-semibold text-indigo-400">
                  {lang === 'zh' ? '💡 针对性修复建议: ' : '💡 Recommendation: '}
                </span>
                <span className="text-slate-300">{item.recommendation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Action Plan */}
      <div className="rounded-xl border border-indigo-900/50 bg-indigo-950/20 p-5">
        <h4 className="text-sm font-bold text-indigo-200">
          {lang === 'zh' ? '优先级修复行动清单 (Action Plan)' : 'Remediation Action Plan'}
        </h4>
        <ul className="mt-3 space-y-2 text-xs text-indigo-300">
          {report.quickFixPlan.map((plan, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                {i + 1}
              </span>
              <span>{plan}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
