import React, { useState } from 'react';
import { Workflow, Plus, Play, CheckCircle2, Clock, Sparkles, RefreshCw } from 'lucide-react';
import { Task, Category } from '../types';

interface TasksViewProps {
  tasks: Task[];
  categories: Category[];
  onCreateTask: (task: Partial<Task>) => void;
  onRunTask: (taskId: string) => Promise<void>;
  lang: 'zh' | 'en';
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  categories,
  onCreateTask,
  onRunTask,
  lang,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [targetCategory, setTargetCategory] = useState('科技资讯');
  const [aiModel, setAiModel] = useState('Gemini 2.5 Flash');
  const [schedule, setSchedule] = useState('每天 08:00');
  const [batchLimit, setBatchLimit] = useState(3);

  const handleRun = async (taskId: string) => {
    setRunningTaskId(taskId);
    try {
      await onRunTask(taskId);
    } finally {
      setRunningTaskId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateTask({
      name,
      targetCategory,
      aiModel,
      schedule,
      batchLimit: Number(batchLimit) || 3,
      distributionScope: 'all',
    });

    setName('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Workflow className="w-6 h-6 text-red-500" />
            {lang === 'zh' ? '自动化内容流水线与调度' : 'Task Automation & Pipelines'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'zh'
              ? '设定定时策略与大模型参数，自动化执行 RAG 召回、事实撰写及多渠道分发。'
              : 'Configure schedules and models to automate RAG synthesis, factual drafting, and distribution.'}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'zh' ? '新建流水线任务' : 'Create Pipeline'}</span>
        </button>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => {
          const isRunning = runningTaskId === task.id || task.status === 'running';
          return (
            <div
              key={task.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                      {task.targetCategory}
                    </span>
                    <h3 className="text-base font-bold text-slate-100 mt-1.5 line-clamp-1">
                      {task.name}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isRunning
                        ? 'bg-blue-500/20 text-blue-400 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isRunning ? (lang === 'zh' ? '运行中' : 'Running') : task.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang === 'zh' ? '执行模型' : 'AI Model'}:</span>
                    <span className="font-semibold text-white">{task.aiModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang === 'zh' ? '执行策略' : 'Schedule'}:</span>
                    <span>{task.schedule}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang === 'zh' ? '单次限额' : 'Batch Size'}:</span>
                    <span>{task.batchLimit} {lang === 'zh' ? '篇' : 'articles'}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800">
                    <span className="text-slate-400">{lang === 'zh' ? '累计产出' : 'Total Output'}:</span>
                    <span className="font-bold text-emerald-400">{task.generatedCount}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {lang === 'zh' ? '上次运行' : 'Last run'}: {task.lastRunAt.split(' ')[0]}
                </span>
                <button
                  onClick={() => handleRun(task.id)}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-50 transition border border-slate-700"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                      <span>{lang === 'zh' ? '生成中...' : 'Running...'}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                      <span>{lang === 'zh' ? '立即触发' : 'Run Now'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Workflow className="w-5 h-5 text-red-500" />
                <span>{lang === 'zh' ? '新建自动化流水线' : 'Create Pipeline Task'}</span>
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
                  {lang === 'zh' ? '任务名称' : 'Task Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition"
                  placeholder="e.g. 每日 CRM 竞品评测自动生成"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  {lang === 'zh' ? '目标分类' : 'Category'}
                </label>
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value)}
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
                  {lang === 'zh' ? 'AI 模型' : 'AI Model'}
                </label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition"
                >
                  <option value="Gemini 2.5 Flash">Google Gemini 2.5 Flash (推荐)</option>
                  <option value="Gemini 1.5 Pro">Google Gemini 1.5 Pro</option>
                  <option value="GPT-4o (OpenAI)">OpenAI GPT-4o</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    {lang === 'zh' ? '执行频次' : 'Schedule'}
                  </label>
                  <input
                    type="text"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    {lang === 'zh' ? '单次生成篇数' : 'Batch Count'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={batchLimit}
                    onChange={(e) => setBatchLimit(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>
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
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-sm"
              >
                {lang === 'zh' ? '立即创建' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
