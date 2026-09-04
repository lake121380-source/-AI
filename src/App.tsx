import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { GeneratorView } from './components/GeneratorView';
import { ArticlesView } from './components/ArticlesView';
import { ArticleModal } from './components/ArticleModal';
import { TasksView } from './components/TasksView';
import { KnowledgeView } from './components/KnowledgeView';
import { DistributionView } from './components/DistributionView';
import { AnalyticsView } from './components/AnalyticsView';
import { AiModelsView } from './components/AiModelsView';
import { SitePreviewView } from './components/SitePreviewView';
import { LlmsTxtView } from './components/LlmsTxtView';
import { AiSandboxView } from './components/AiSandboxView';
import { CompetitorRadarView } from './components/CompetitorRadarView';
import { QueryRadarView } from './components/QueryRadarView';
import { UrlScannerView } from './components/UrlScannerView';
import { RobotsPolicyView } from './components/RobotsPolicyView';
import { DualSitemapSeoView } from './components/DualSitemapSeoView';
import { SeoDashboardView } from './components/SeoDashboardView';
import { BrandEntityEeatView } from './components/BrandEntityEeatView';
import { AiAttributionFunnelView } from './components/AiAttributionFunnelView';
import { ExecutiveScorecardModal } from './components/ExecutiveScorecardModal';
import { PlainGlossaryModal } from './components/PlainGlossaryModal';
import { DevHandoffModal } from './components/DevHandoffModal';
import {
  initialArticles,
  initialCategories,
  initialTasks,
  initialKnowledgeBases,
  initialKnowledgeChunks,
  initialDistributionChannels,
  initialAiModels,
  initialPrompts,
  initialAnalytics,
} from './data/mockData';
import { Article, Category, Task, KnowledgeBase, KnowledgeChunk, DistributionChannel, AiModelConfig, PromptTemplate, AnalyticsOverview } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [hasGeminiKey, setHasGeminiKey] = useState(false);

  // Core Data States
  const [stats, setStats] = useState<any>(null);
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>(initialKnowledgeBases);
  const [chunks, setChunks] = useState<KnowledgeChunk[]>(initialKnowledgeChunks);
  const [channels, setChannels] = useState<DistributionChannel[]>(initialDistributionChannels);
  const [models, setModels] = useState<AiModelConfig[]>(initialAiModels);
  const [prompts, setPrompts] = useState<PromptTemplate[]>(initialPrompts);
  const [analytics, setAnalytics] = useState<AnalyticsOverview>(initialAnalytics);

  // Selected Article for modal reader
  const [activeArticleModal, setActiveArticleModal] = useState<Article | null>(null);
  const [showScorecardModal, setShowScorecardModal] = useState(false);
  const [showGlossaryModal, setShowGlossaryModal] = useState(false);
  const [showDevHandoffModal, setShowDevHandoffModal] = useState(false);

  // Fetch initial data from server endpoints
  useEffect(() => {
    const fetchData = async () => {
      try {
        const healthRes = await fetch('/api/health');
        if (healthRes.ok) {
          const hData = await healthRes.json();
          setHasGeminiKey(Boolean(hData.hasGeminiKey));
        }

        const statsRes = await fetch('/api/dashboard/stats');
        if (statsRes.ok) {
          const sData = await statsRes.json();
          setStats(sData);
        }

        const artsRes = await fetch('/api/articles');
        if (artsRes.ok) {
          const aData = await artsRes.json();
          if (aData.data) setArticles(aData.data);
        }

        const tasksRes = await fetch('/api/tasks');
        if (tasksRes.ok) {
          const tData = await tasksRes.json();
          if (tData.data) setTasks(tData.data);
        }

        const kbRes = await fetch('/api/knowledge-bases');
        if (kbRes.ok) {
          const kData = await kbRes.json();
          if (kData.data) setKnowledgeBases(kData.data);
        }

        const chRes = await fetch('/api/distribution');
        if (chRes.ok) {
          const cData = await chRes.json();
          if (cData.data) setChannels(cData.data);
        }

        const modRes = await fetch('/api/models');
        if (modRes.ok) {
          const mData = await modRes.json();
          if (mData.data) setModels(mData.data);
        }

        const anRes = await fetch('/api/analytics');
        if (anRes.ok) {
          const anData = await anRes.json();
          setAnalytics(anData);
        }
      } catch (err) {
        console.warn('Using local fallback state during initial load:', err);
      }
    };

    fetchData();
  }, []);

  // Handlers
  const handleSaveArticle = async (newArt: Article) => {
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newArt),
      });
      if (res.ok) {
        const saved = await res.json();
        setArticles((prev) => [saved, ...prev]);
      } else {
        setArticles((prev) => [newArt, ...prev]);
      }
    } catch {
      setArticles((prev) => [newArt, ...prev]);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm(lang === 'zh' ? '确定要删除该文章吗？' : 'Delete this article?')) return;
    try {
      await fetch(`/api/articles/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const handlePublishArticle = async (id: string) => {
    try {
      await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' }),
      });
    } catch (e) {
      console.error(e);
    }
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'published' } : a))
    );
  };

  const handleDistributeArticle = async (id: string, channelIds?: string[]) => {
    try {
      const res = await fetch(`/api/articles/${id}/distribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelIds }),
      });
      if (res.ok) {
        const data = await res.json();
        setArticles((prev) =>
          prev.map((a) => (a.id === id ? { ...a, distributedTo: data.distributedTo } : a))
        );
        alert(lang === 'zh' ? '分发成功！远端站点已接收并触发静态页编译。' : 'Distributed successfully!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (res.ok) {
        const newTask = await res.json();
        setTasks((prev) => [newTask, ...prev]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/run`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.article) {
          setArticles((prev) => [data.article, ...prev]);
        }
        if (data.task) {
          setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? data.task : t))
          );
        }
        alert(data.message || (lang === 'zh' ? '任务已执行完成！' : 'Task executed!'));
      }
    } catch (err) {
      console.error('Task run failed:', err);
    }
  };

  const handleCreateKb = async (name: string, description: string) => {
    try {
      const res = await fetch('/api/knowledge-bases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (res.ok) {
        const newKb = await res.json();
        setKnowledgeBases((prev) => [newKb, ...prev]);
        setChunks((prev) => [
          ...prev,
          {
            id: `chk-${Date.now()}`,
            kbId: newKb.id,
            title: `${name} 核心概述`,
            content: `${name} 包含了企业业务标准、核心服务指标以及对外公示的技术白皮书语料。`,
            tokenCount: 96,
            hasEmbedding: true,
          },
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddChannel = async (channelData: Partial<DistributionChannel>) => {
    try {
      const res = await fetch('/api/distribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(channelData),
      });
      if (res.ok) {
        const newCh = await res.json();
        setChannels((prev) => [...prev, newCh]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSyncChannel = async (id: string) => {
    try {
      const res = await fetch(`/api/distribution/${id}/sync`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setChannels((prev) =>
          prev.map((c) => (c.id === id ? { ...c, lastSyncedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) } : c))
        );
        alert(data.message || (lang === 'zh' ? '同步已完成！' : 'Synced!'));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectDefaultModel = async (id: string) => {
    try {
      await fetch('/api/models/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setModels((prev) =>
        prev.map((m) => ({ ...m, isDefault: m.id === id }))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleNavigateToArticle = (slugOrTitle: string) => {
    const found = articles.find(
      (a) => a.title === slugOrTitle || a.slug === slugOrTitle || a.title.includes(slugOrTitle)
    );
    if (found) {
      setActiveArticleModal(found);
    } else {
      setCurrentTab('articles');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        lang={lang}
        setLang={setLang}
        hasGeminiKey={hasGeminiKey}
        onQuickGenerate={() => setCurrentTab('generator')}
        onOpenPreview={() => setCurrentTab('preview')}
        onOpenScorecard={() => setShowScorecardModal(true)}
        onOpenGlossary={() => setShowGlossaryModal(true)}
        onOpenDevHandoff={() => setShowDevHandoffModal(true)}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          lang={lang}
          badgeCounts={{
            articles: articles.filter((a) => a.status === 'review').length,
            tasks: tasks.filter((t) => t.status === 'running').length,
            channels: channels.length,
          }}
        />

        {/* Content View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950/90">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                stats={stats}
                articles={articles}
                tasks={tasks}
                onNavigate={(tab) => setCurrentTab(tab)}
                onSelectArticle={(art) => setActiveArticleModal(art)}
                onOpenGlossary={() => setShowGlossaryModal(true)}
                onOpenDevHandoff={() => setShowDevHandoffModal(true)}
                lang={lang}
              />
            )}

            {currentTab === 'generator' && (
              <GeneratorView
                knowledgeBases={knowledgeBases}
                onSaveArticle={handleSaveArticle}
                lang={lang}
              />
            )}

            {currentTab === 'articles' && (
              <ArticlesView
                articles={articles}
                categories={categories}
                channels={channels}
                onSelectArticle={(art) => setActiveArticleModal(art)}
                onDeleteArticle={handleDeleteArticle}
                onDistributeArticle={handleDistributeArticle}
                onCreateArticle={handleSaveArticle}
                lang={lang}
              />
            )}

            {currentTab === 'tasks' && (
              <TasksView
                tasks={tasks}
                categories={categories}
                onCreateTask={handleCreateTask}
                onRunTask={handleRunTask}
                lang={lang}
              />
            )}

            {currentTab === 'knowledge' && (
              <KnowledgeView
                knowledgeBases={knowledgeBases}
                chunks={chunks}
                onCreateKb={handleCreateKb}
                lang={lang}
              />
            )}

            {currentTab === 'distribution' && (
              <DistributionView
                channels={channels}
                onAddChannel={handleAddChannel}
                onSyncChannel={handleSyncChannel}
                lang={lang}
              />
            )}

            {currentTab === 'competitor' && (
              <CompetitorRadarView
                lang={lang}
                onNavigateToDraft={() => setCurrentTab('generator')}
              />
            )}

            {currentTab === 'query_radar' && (
              <QueryRadarView
                lang={lang}
                onArticleCreated={(newArt) => {
                  setArticles((prev) => [newArt, ...prev]);
                }}
                onOpenArticleModal={(art) => setActiveArticleModal(art)}
              />
            )}

            {currentTab === 'url_scanner' && (
              <UrlScannerView
                lang={lang}
              />
            )}

            {currentTab === 'robots_policy' && (
              <RobotsPolicyView
                lang={lang}
              />
            )}

            {currentTab === 'seo_dashboard' && (
              <SeoDashboardView
                lang={lang}
                onNavigate={(tab) => setCurrentTab(tab)}
                onNavigateToDraft={(topic) => {
                  setCurrentTab('generator');
                }}
                onArticleCreated={(newArt) => {
                  setArticles((prev) => [newArt, ...prev]);
                }}
              />
            )}

            {currentTab === 'seo_foundation' && (
              <DualSitemapSeoView
                lang={lang}
              />
            )}

            {currentTab === 'brand_entity' && (
              <BrandEntityEeatView
                lang={lang}
              />
            )}

            {currentTab === 'attribution_funnel' && (
              <AiAttributionFunnelView
                lang={lang}
              />
            )}

            {currentTab === 'llmstxt' && (
              <LlmsTxtView
                articles={articles}
                lang={lang}
              />
            )}

            {currentTab === 'sandbox' && (
              <AiSandboxView
                lang={lang}
              />
            )}

            {currentTab === 'analytics' && (
              <AnalyticsView
                analytics={analytics}
                lang={lang}
                onNavigateToArticle={handleNavigateToArticle}
              />
            )}

            {currentTab === 'ai-models' && (
              <AiModelsView
                models={models}
                prompts={prompts}
                onSelectDefaultModel={handleSelectDefaultModel}
                lang={lang}
              />
            )}

            {currentTab === 'preview' && (
              <SitePreviewView
                articles={articles}
                categories={categories}
                onSelectArticle={(art) => setActiveArticleModal(art)}
                lang={lang}
              />
            )}
          </div>
        </main>
      </div>

      {/* Full-view Article Modal */}
      <ArticleModal
        article={activeArticleModal}
        onClose={() => setActiveArticleModal(null)}
        onPublish={handlePublishArticle}
        onDistribute={(id) => handleDistributeArticle(id)}
        onUpdateArticle={(updated) => {
          handleSaveArticle(updated);
          setActiveArticleModal(updated);
        }}
        lang={lang}
      />

      {/* Global Executive Scorecard Modal */}
      <ExecutiveScorecardModal
        isOpen={showScorecardModal}
        onClose={() => setShowScorecardModal(false)}
        lang={lang}
        onNavigateTab={(tab) => setCurrentTab(tab)}
      />

      {/* Beginner Plain Glossary Modal */}
      <PlainGlossaryModal
        isOpen={showGlossaryModal}
        onClose={() => setShowGlossaryModal(false)}
        lang={lang}
      />

      {/* Developer Handoff Package Modal */}
      <DevHandoffModal
        isOpen={showDevHandoffModal}
        onClose={() => setShowDevHandoffModal(false)}
        lang={lang}
      />
    </div>
  );
}
