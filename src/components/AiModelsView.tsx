import React, { useState } from 'react';
import { Sliders, Bot, CheckCircle2, Sparkles, Code, Check } from 'lucide-react';
import { AiModelConfig, PromptTemplate } from '../types';

interface AiModelsViewProps {
  models: AiModelConfig[];
  prompts: PromptTemplate[];
  onSelectDefaultModel: (id: string) => void;
  lang: 'zh' | 'en';
}

export const AiModelsView: React.FC<AiModelsViewProps> = ({
  models,
  prompts,
  onSelectDefaultModel,
  lang,
}) => {
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate>(prompts[0]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <Sliders className="w-6 h-6 text-blue-500" />
          {lang === 'zh' ? 'AI 模型网关与提示词资产' : 'AI Models & Prompt Configuration'}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {lang === 'zh'
            ? '管理 Google Gemini 与 OpenAI 等多模型路由，定制符合 GEO 规范的生成提示词体系。'
            : 'Configure Gemini/OpenAI multi-model routing and fine-tune GEO generation prompts.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Models (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-400" />
            <span>{lang === 'zh' ? '已就绪 AI 模型列表' : 'Active AI Models'}</span>
          </h3>

          <div className="space-y-3">
            {models.map((mod) => (
              <div
                key={mod.id}
                className={`p-4 rounded-xl border transition ${
                  mod.isDefault
                    ? 'bg-slate-800/80 border-blue-500 shadow-md shadow-blue-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{mod.name}</span>
                      {mod.isDefault && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                          {lang === 'zh' ? '默认生成模型' : 'Default'}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-slate-400 mt-0.5">{mod.modelId}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                    {mod.provider}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 mt-3 border-t border-slate-800/80">
                  <span>
                    {lang === 'zh' ? '上下文窗口' : 'Context'}: {(mod.contextWindow / 1024).toFixed(0)}k tokens
                  </span>
                  {!mod.isDefault && mod.type === 'chat' && (
                    <button
                      onClick={() => onSelectDefaultModel(mod.id)}
                      className="text-xs text-blue-400 hover:underline font-semibold"
                    >
                      {lang === 'zh' ? '设为默认' : 'Set as Default'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Prompt Templates (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'zh' ? '系统提示词模板库' : 'System Prompt Templates'}</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              GEO Standard
            </span>
          </div>

          <div className="flex gap-2">
            {prompts.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPrompt(p)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition ${
                  selectedPrompt.id === p.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">System Prompt (系统角色与防幻觉指令):</label>
              <textarea
                readOnly
                rows={6}
                value={selectedPrompt.systemPrompt}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono resize-none focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">User Prompt Template (参数装配模板):</label>
              <textarea
                readOnly
                rows={4}
                value={selectedPrompt.userPromptTemplate}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono resize-none focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
