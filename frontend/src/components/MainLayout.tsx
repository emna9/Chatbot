import React, { useState } from 'react';
import { Layout } from 'antd';
import Sidebar from './SideBar';
import Topbar from './TopBar';
import Independent from './Independent';
import { Question } from '../../types/Question';

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [dynamicPrompts, setDynamicPrompts] = useState<{ key: string; description: string }[] | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('général');
  const [showTags, setShowTags] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [theme] = useState<'light' | 'dark'>('light'); // you can wire this to global theme later

  const toggle = () => setCollapsed((c) => !c);

  const handleBranchSelect = (questions: Question[], branchKey: string) => {
    const formatted = questions.map((q) => ({ key: q.id.toString(), description: q.question }));
    setDynamicPrompts(formatted);
    setSelectedBranch(branchKey);
  };
const resetToStart = () => {
  setDynamicPrompts([]);
  setSelectedBranch('général');
};

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        onBranchSelect={handleBranchSelect}
        onReset={resetToStart}
      />

      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Topbar
          collapsed={collapsed}
          toggle={toggle}
          showTags={showTags}
          onFilterClick={() => setShowTags((prev) => !prev)}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          theme={theme}
        />

        <Independent
          dynamicPrompts={dynamicPrompts}
          selectedBranch={selectedBranch}
          selectedTags={selectedTags}
        />
      </Layout>
    </Layout>
  );
};

export default MainLayout;
