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

  const toggle = () => setCollapsed((c) => !c);

  // receives raw questions from Sidebar => format & store for Independent
  const handleBranchSelect = (questions: Question[], branchKey: string) => {
    const formatted = questions.map((q) => ({ key: q.id.toString(), description: q.question }));
    setDynamicPrompts(formatted);
    setSelectedBranch(branchKey);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar lives here and gets the handler */}
      <Sidebar collapsed={collapsed} onBranchSelect={handleBranchSelect} />

      {/* Shift content to the right of fixed sidebar */}
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Topbar collapsed={collapsed} toggle={toggle} />
        {/* pass props to Independent */}
        <Independent dynamicPrompts={dynamicPrompts} selectedBranch={selectedBranch} />
      </Layout>
    </Layout>
  );
};

export default MainLayout;
