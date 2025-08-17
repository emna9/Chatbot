import React from 'react';
import { Layout, Menu, message } from 'antd';
import {
  CarOutlined,
  HeartOutlined,
  RocketOutlined,
  HomeOutlined,
  WarningOutlined,
  FileSearchOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { fetchQuestionsByBranch } from '../services/questionsService';
import { Question } from '../../types/Question';
import '../styles/SideBar.css';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  onBranchSelect: (questions: Question[], branchKey: string) => void;
  onReset?: () => void; // optional: parent resets chat/greeting when logo clicked
}

const branches = [
  { key: 'auto', icon: <CarOutlined />, label: 'Auto' },
  { key: 'santé', icon: <HeartOutlined />, label: 'Santé' },
  { key: 'voyage', icon: <RocketOutlined />, label: 'Voyage' },
  { key: 'habitation', icon: <HomeOutlined />, label: 'Habitation' },
  { key: 'vie', icon: <WarningOutlined />, label: 'Vie' },
  { key: 'pro', icon: <EditOutlined />, label: 'Professionnelle' },
  { key: 'rc', icon: <FileSearchOutlined />, label: 'Responsabilité Civile' },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onBranchSelect, onReset }) => {
  // central handler used by Menu.onClick (works when collapsed & expanded)
  const handleMenuClick = async (info: { key: string }) => {
    const branchKey = String(info.key);
    try {
      const questions = await fetchQuestionsByBranch(branchKey.toLowerCase());
      onBranchSelect(questions, branchKey.toLowerCase());
    } catch (err) {
      console.error(err);
      message.error('Échec du chargement des questions.');
    }
  };

  // clicking the logo should behave like "reset to général + greeting"
  const handleLogoClick = async () => {
    const branchKey = 'général'; // matches your old endpoint / behaviour
    try {
      const questions = await fetchQuestionsByBranch(branchKey); // backend expects 'général'
      onBranchSelect(questions, branchKey);
      if (onReset) onReset(); // tell parent to reset messages/greeting
    } catch (err) {
      console.error(err);
      message.error('Échec du chargement des questions générales.');
    }
  };

  // keyboard accessibility for logo
  const onLogoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleLogoClick();
    }
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      breakpoint="md"
      width={200}
      collapsedWidth={80}
      className="sidebar"
    >
      <div
        className={`demo-logo-vertical ${collapsed ? 'collapsed' : 'expanded'}`}
        onClick={handleLogoClick}
        onKeyDown={onLogoKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Reset to général"
        style={{ cursor: 'pointer' }}
      >
        <img
          src="/img/logofree.png"
          alt="Logo"
          style={{
            width: 32,
            height: 32,
            objectFit: 'contain',
            display: 'block',
            margin: collapsed ? '16px auto' : '16px 16px',
            transition: 'margin 0.2s ease',
          }}
        />
      </div>

      <Menu
        theme="light"
        mode="inline"
        defaultSelectedKeys={['auto']}
        inlineCollapsed={collapsed}
        onClick={handleMenuClick}
        items={branches.map(({ key, icon, label }) => ({
          key,
          icon,
          label: <div style={{ whiteSpace: 'pre-line' }}>{label}</div>,
        }))}
      />
    </Sider>
  );
};

export default Sidebar;
