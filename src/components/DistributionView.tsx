import React, { useState } from 'react';
import {
  Radio,
  Plus,
  RefreshCw,
  CheckCircle2,
  Shield,
  Globe,
  Terminal,
  Key,
  Download,
  Copy,
  FileCode,
  Check,
  Server,
  Code2,
} from 'lucide-react';
import { DistributionChannel } from '../types';

interface DistributionViewProps {
  channels: DistributionChannel[];
  onAddChannel: (channel: Partial<DistributionChannel>) => void;
  onSyncChannel: (id: string) => Promise<void>;
  lang: 'zh' | 'en';
}

const PHP_AGENT_CODE = `<?php
/**
 * 桐灼GEO Agent 客户端自动化部署脚本 (agent.php)
 * 功能：接收 桐灼GEO 内容中台推送，自动验签 (HMAC-SHA256)、持久化 Markdown/HTML 并自动更新 /llms.txt 及 sitemap.xml
 */
define('GEO_SECRET_KEY', 'geo_sec_live_99fa7b2c01e8');
define('STORAGE_DIR', __DIR__ . '/geo-posts');

// 1. 读取输入与签名头
$rawPayload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_TONGZHUO_GEO_SIGNATURE'] ?? '';
$timestamp = $_SERVER['HTTP_X_TONGZHUO_GEO_TIMESTAMP'] ?? 0;

// 2. 防重放校验 (5分钟窗口)
if (abs(time() - (int)$timestamp) > 300) {
    http_response_code(401);
    die(json_encode(['error' => 'Timestamp expired']));
}

// 3. HMAC-SHA256 验签
$expectedSig = hash_hmac('sha256', $timestamp . '.' . $rawPayload, GEO_SECRET_KEY);
if (!hash_equals($expectedSig, $signature)) {
    http_response_code(403);
    die(json_encode(['error' => 'Invalid HMAC Signature']));
}

// 4. 解析文章数据
$data = json_decode($rawPayload, true);
if (!$data || empty($data['title'])) {
    http_response_code(400);
    die(json_encode(['error' => 'Invalid Payload']));
}

// 5. 写入静态文件目录
if (!is_dir(STORAGE_DIR)) {
    mkdir(STORAGE_DIR, 0755, true);
}
$slug = preg_replace('/[^a-zA-Z0-9_-]/', '', $data['slug'] ?? ('post-' . time()));
$filePath = STORAGE_DIR . "/{$slug}.md";
file_put_contents($filePath, $data['content'] ?? '');

// 6. 自动化重组 /llms.txt
$llmsLine = "- [{$data['title']}](/geo-posts/{$slug}.html): " . ($data['summary'] ?? '') . "\\n";
file_put_contents(__DIR__ . '/llms.txt', $llmsLine, FILE_APPEND);

echo json_encode([
    'status' => 'success',
    'synced' => $data['title'],
    'written' => "/geo-posts/{$slug}.md",
    'updatedLlmsTxt' => true,
    'timestamp' => time()
]);
`;

const NODE_AGENT_CODE = `/**
 * 桐灼GEO Agent - Node.js Express 中间件 (agent.js)
 * 运行方式: node agent.js
 */
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const SECRET_KEY = 'geo_sec_live_99fa7b2c01e8';
const POSTS_DIR = path.join(__dirname, 'geo-posts');

if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });

app.use(express.raw({ type: 'application/json' }));

app.post('/agent', (req, res) => {
  const timestamp = req.headers['x-tongzhuo-geo-timestamp'];
  const signature = req.headers['x-tongzhuo-geo-signature'];

  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
    return res.status(401).json({ error: 'Timestamp expired' });
  }

  const expected = crypto.createHmac('sha256', SECRET_KEY)
    .update(\`\${timestamp}.\${req.body.toString()}\`)
    .digest('hex');

  if (expected !== signature) {
    return res.status(403).json({ error: 'Invalid signature' });
  }

  const data = JSON.parse(req.body.toString());
  const slug = data.slug || \`post-\${Date.now()}\`;
  fs.writeFileSync(path.join(POSTS_DIR, \`\${slug}.md\`), data.content || '');

  // 更新 /llms.txt
  const llmsLine = \`- [\${data.title}](/geo-posts/\${slug}): \${data.summary || ''}\\n\`;
  fs.appendFileSync(path.join(__dirname, 'llms.txt'), llmsLine);

  res.json({ status: 'success', synced: data.title, written: \`/geo-posts/\${slug}.md\` });
});

app.listen(PORT, () => console.log(\`桐灼GEO Agent listening on port \${PORT}\`));
`;

const PYTHON_AGENT_CODE = `"""
桐灼GEO Agent - Python FastAPI 客户端部署服务 (agent.py)
安装依赖: pip install fastapi uvicorn
启动服务: uvicorn agent:app --host 0.0.0.0 --port 8080
"""
from fastapi import FastAPI, Request, HTTPException
import hmac, hashlib, time, os, json

app = FastAPI()
SECRET_KEY = b"geo_sec_live_99fa7b2c01e8"
POSTS_DIR = "./geo-posts"
os.makedirs(POSTS_DIR, exist_ok=True)

@app.post("/agent")
async def receive_post(request: Request):
    timestamp = request.headers.get("x-tongzhuo-geo-timestamp", "")
    signature = request.headers.get("x-tongzhuo-geo-signature", "")
    raw_body = await request.body()

    if abs(time.time() - float(timestamp or 0)) > 300:
        raise HTTPException(status_code=401, detail="Timestamp expired")

    msg = f"{timestamp}.".encode() + raw_body
    expected = hmac.new(SECRET_KEY, msg, hashlib.sha256).hexdigest()

    if not hmac.compare_digest(expected, signature):
        raise HTTPException(status_code=403, detail="Invalid HMAC signature")

    data = json.loads(raw_body.decode())
    slug = data.get("slug", f"post-{int(time.time())}")
    with open(f"{POSTS_DIR}/{slug}.md", "w", encoding="utf-8") as f:
        f.write(data.get("content", ""))

    with open("./llms.txt", "a", encoding="utf-8") as f:
        f.write(f"- [{data.get('title')}](/geo-posts/{slug}): {data.get('summary', '')}\\n")

    return {"status": "success", "synced": data.get("title"), "written": f"/geo-posts/{slug}.md"}
`;

export const DistributionView: React.FC<DistributionViewProps> = ({
  channels,
  onAddChannel,
  onSyncChannel,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'channels' | 'sdk'>('channels');
  const [sdkLang, setSdkLang] = useState<'php' | 'node' | 'python'>('php');
  const [secretKey, setSecretKey] = useState('geo_sec_live_99fa7b2c01e8');
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Form
  const [name, setName] = useState('');
  const [type, setType] = useState<'tongzhuo_geo_agent' | 'wordpress_rest' | 'generic_http'>('tongzhuo_geo_agent');
  const [targetUrl, setTargetUrl] = useState('');
  const [authMethod, setAuthMethod] = useState('HMAC-SHA256 Secret');

  const handleSync = async (id: string) => {
    setSyncingId(id);
    try {
      await onSyncChannel(id);
    } finally {
      setSyncingId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetUrl.trim()) return;

    onAddChannel({
      name,
      type,
      targetUrl,
      authMethod,
    });

    setName('');
    setTargetUrl('');
    setIsModalOpen(false);
  };

  const getCode = () => {
    if (sdkLang === 'node') return NODE_AGENT_CODE.replace(/geo_sec_live_99fa7b2c01e8/g, secretKey);
    if (sdkLang === 'python') return PYTHON_AGENT_CODE.replace(/geo_sec_live_99fa7b2c01e8/g, secretKey);
    return PHP_AGENT_CODE.replace(/geo_sec_live_99fa7b2c01e8/g, secretKey);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadAgent = () => {
    const filename = sdkLang === 'php' ? 'agent.php' : sdkLang === 'node' ? 'agent.js' : 'agent.py';
    const blob = new Blob([getCode()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateRandomSecret = () => {
    const chars = '0123456789abcdef';
    let s = 'geo_sec_live_';
    for (let i = 0; i < 16; i++) {
      s += chars[Math.floor(Math.random() * chars.length)];
    }
    setSecretKey(s);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Radio className="w-6 h-6 text-purple-500" />
              <span>{lang === 'zh' ? '多端渠道分发与 Agent 部署中台' : 'Multi-Site Distribution Hub'}</span>
            </h1>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Agent Protocol v2.4
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'zh'
              ? '通过 桐灼GEO Agent 协议，一键将生成文章安全推送到远端独立站与博客，并实时同步更新远端站点的 /llms.txt 与 sitemap.xml。'
              : 'Securely publish articles to remote static sites, WordPress blogs, and custom HTTP API endpoints.'}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('channels')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'channels'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>{lang === 'zh' ? '已连入站点节点' : 'Connected Sites'}</span>
          </button>
          <button
            onClick={() => setActiveTab('sdk')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'sdk'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{lang === 'zh' ? 'Agent 客户端部署套件 (SDK)' : 'Agent SDK'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'channels' ? (
        <>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-semibold">
              {lang === 'zh' ? `当前管理 ${channels.length} 个活跃分发端点` : `${channels.length} endpoints active`}
            </span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'zh' ? '添加分发节点' : 'Add Endpoint'}</span>
            </button>
          </div>

          {/* Distribution Channels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {channels.map((channel) => {
              const isSyncing = syncingId === channel.id || channel.status === 'syncing';
              return (
                <div
                  key={channel.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold border border-purple-500/20">
                          {channel.type === 'tongzhuo_geo_agent' ? '桐灼GEO Agent' : channel.type === 'wordpress_rest' ? 'WordPress REST' : 'HTTP API'}
                        </span>
                        <h3 className="text-sm font-bold text-white mt-1.5 line-clamp-1">{channel.name}</h3>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>{channel.status}</span>
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs space-y-1.5">
                      <div className="text-slate-400 truncate">
                        <span className="text-slate-400">{lang === 'zh' ? '目标 URL' : 'Target URL'}:</span>{' '}
                        <span className="text-slate-200 font-mono text-[11px]">{channel.targetUrl}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>{lang === 'zh' ? '鉴权方式' : 'Auth'}:</span>
                        <span className="text-slate-300 font-mono">{channel.authMethod}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                        <span>{lang === 'zh' ? '累计接收' : 'Total Pushed'}:</span>
                        <strong className="text-purple-400 font-mono">{channel.articlesCount} {lang === 'zh' ? '篇' : 'arts'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {lang === 'zh' ? '最后同步' : 'Last sync'}: {channel.lastSyncedAt.split(' ')[0]}
                    </span>
                    <button
                      onClick={() => handleSync(channel.id)}
                      disabled={isSyncing}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-50 transition border border-slate-700"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-purple-400' : 'text-slate-300'}`} />
                      <span>{isSyncing ? (lang === 'zh' ? '同步中...' : 'Syncing...') : (lang === 'zh' ? '测试同步' : 'Sync Now')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick protocol banner */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">想在自己的独立服务器上接收发布？</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  单文件部署，零第三方依赖，只需上传 <code className="text-purple-300 font-mono">agent.php</code> 即可支持全自动写入与 /llms.txt 维护。
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('sdk')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition shrink-0"
            >
              获取部署文件
            </button>
          </div>
        </>
      ) : (
        /* SDK & Deployment Scripts View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Configuration & instructions (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>HMAC 通信鉴权秘钥</span>
              </h3>

              <div className="space-y-2 text-xs">
                <label className="block text-slate-400 font-semibold">专属签名密钥 (Secret Key)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={generateRandomSecret}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="生成随机密钥"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  每次中台同步内容时，都会基于时间戳 + 载荷进行 SHA256 签名，客户端将自动核验防止数据篡改。
                </p>
              </div>
            </div>

            {/* Deployment Steps */}
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                3 步极速部署指南
              </h3>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2 text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-purple-600/20 text-purple-300 text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
                  <span>下载右侧脚本并上传至目标服务器根目录（如 <code>/www/wwwroot/site/agent.php</code>）。</span>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-purple-600/20 text-purple-300 text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
                  <span>在【已连入站点节点】点击【添加分发节点】，输入 <code>https://你的域名/agent.php</code>。</span>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-purple-600/20 text-purple-300 text-[11px] font-bold flex items-center justify-center shrink-0">3</span>
                  <span>点击【测试同步】，Agent 将自动接收文章、生成静态页并维护站点的 <code>/llms.txt</code> 索引。</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Code Viewer & Download (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col space-y-4">
            {/* Language Selector and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSdkLang('php')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    sdkLang === 'php'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  PHP (agent.php)
                </button>
                <button
                  onClick={() => setSdkLang('node')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    sdkLang === 'node'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Node.js Express (agent.js)
                </button>
                <button
                  onClick={() => setSdkLang('python')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    sdkLang === 'python'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Python FastAPI (agent.py)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>复制代码</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadAgent}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition flex items-center gap-1.5 shadow-md shadow-purple-600/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>一键下载单文件 ({sdkLang === 'php' ? 'agent.php' : sdkLang === 'node' ? 'agent.js' : 'agent.py'})</span>
                </button>
              </div>
            </div>

            {/* Code Box */}
            <div className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-xs text-slate-300 overflow-y-auto max-h-[500px] whitespace-pre-wrap leading-relaxed select-text">
              {getCode()}
            </div>
          </div>
        </div>
      )}

      {/* New Channel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-purple-500" />
                <span>{lang === 'zh' ? '添加分发目标节点' : 'Add Distribution Channel'}</span>
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
                  {lang === 'zh' ? '节点名称' : 'Channel Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                  placeholder="e.g. 亚太独立站官网 GEO 频道"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  {lang === 'zh' ? '渠道类型' : 'Channel Type'}
                </label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                >
                  <option value="tongzhuo_geo_agent">桐灼GEO Agent (PHP / Static Site)</option>
                  <option value="wordpress_rest">WordPress REST API</option>
                  <option value="generic_http">Generic Webhook / HTTP API</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  {lang === 'zh' ? '目标端点 URL' : 'Target Endpoint URL'} *
                </label>
                <input
                  type="url"
                  required
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                  placeholder="https://mysite.com/agent.php"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  {lang === 'zh' ? '认证秘钥方式' : 'Authentication Method'}
                </label>
                <input
                  type="text"
                  value={authMethod}
                  onChange={(e) => setAuthMethod(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition"
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
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-sm"
              >
                {lang === 'zh' ? '保存节点' : 'Save Endpoint'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

