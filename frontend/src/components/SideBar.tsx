import React, { useState } from 'react';
import { Layout, Menu, message, MenuProps } from 'antd';
import {
  CarOutlined,
  HeartOutlined,
  RocketOutlined,
  HomeOutlined,
  WarningOutlined,
  FileSearchOutlined,
  EditOutlined,
  TrophyOutlined,
  FlagOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { fetchQuestionsByBranch } from '../services/questionsService';
import { Question } from '../../types/Question';
import '../styles/SideBar.css';
import TunisiaMap from './Map';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onBranchSelect: (questions: Question[], branchKey: string) => void;
  onReset?: () => void;
}

const branches = [
  { key: 'auto', icon: <CarOutlined />, label: 'Auto' },
  { key: 'santé', icon: <HeartOutlined />, label: 'Santé' },
  { key: 'voyage', icon: <RocketOutlined />, label: 'Voyage' },
  { key: 'habitation', icon: <HomeOutlined />, label: 'Habitation' },
  { key: 'vie', icon: <WarningOutlined />, label: 'Vie' },
  { key: 'pro', icon: <EditOutlined />, label: 'Pro' },
  { key: 'rc', icon: <FileSearchOutlined />, label: 'RC' },
];

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onCollapsedChange,
  onBranchSelect,
  onReset,
}) => {
  const [showMap, setShowMap] = useState(false);

  const handleMenuClick: MenuProps['onClick'] = async (info) => {
    const branchKey = String(info.key);

    if (branchKey === 'event1') return window.open('https://marathon.comar.tn/fr', '_blank');
    if (branchKey === 'event2') return window.open('https://comar-d-or.comar.tn/fr', '_blank');

    if (branchKey === 'map') {
      if (collapsed) onCollapsedChange(false);
      setShowMap(true);
      return;
    } else {
      setShowMap(false);
    }

    try {
      const questions = await fetchQuestionsByBranch(branchKey.toLowerCase());
      onBranchSelect(questions, branchKey.toLowerCase());
    } catch (err) {
      console.error(err);
      message.error('Échec du chargement des questions.');
    }
  };

  const handleLogoClick = async () => {
    const branchKey = 'général';
    try {
      const questions = await fetchQuestionsByBranch(branchKey);
      onBranchSelect(questions, branchKey);
      if (onReset) onReset();
      setShowMap(false);
    } catch (err) {
      console.error(err);
      message.error('Échec du chargement des questions générales.');
    }
  };

  const onLogoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleLogoClick();
    }
  };

  // Menu items with section headers only in open state
  const menuItems: MenuProps['items'] = [
    // Branches
    ...(!collapsed
      ? [
          {
            key: 'branches-title',
            label: (
              <div className="menu-section-title">
                <span className="menu-section-icon">▼</span>
                <span className="menu-section-text">Branches</span>
              </div>
            ),
            disabled: true,
          },
        ]
      : []),
    ...branches.map(({ key, icon, label }) => ({
      key,
      icon,
      label: !collapsed ? <span className="menu-item-label">{label}</span> : undefined,
      title: collapsed ? label : undefined,
    })),

    // Événements
    ...(!collapsed
      ? [
          {
            key: 'events-title',
            label: (
              <div className="menu-section-title">
                <span className="menu-section-icon">▼</span>
                <span className="menu-section-text">Événements</span>
              </div>
            ),
            disabled: true,
          },
        ]
      : []),
    {
      key: 'event1',
      icon: <FlagOutlined />,
      label: !collapsed ? <span className="menu-item-label">Le Marathon</span> : undefined,
      title: collapsed ? 'Le Marathon' : undefined,
    },
    {
      key: 'event2',
      icon: <TrophyOutlined />,
      label: !collapsed ? <span className="menu-item-label">COMAR d\'Or</span> : undefined,
      title: collapsed ? 'COMAR d\'Or' : undefined,
    },

    // Nos Agences
    ...(!collapsed
      ? [
          {
            key: 'map-title',
            label: (
              <div className="menu-section-title">
                <span className="menu-section-icon">▼</span>
                <span className="menu-section-text">Nos Agences</span>
              </div>
            ),
            disabled: true,
          },
        ]
      : []),
    {
      key: 'map',
      icon: <EnvironmentOutlined style={{ color: 'red' }} />,
      label: !collapsed ? <span className="menu-item-label">Voir la Carte</span> : undefined,
      title: collapsed ? 'Voir la Carte' : undefined,
    },
  ];

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapsedChange}
      
      width={showMap ? 400 : 200}
      collapsedWidth={80}
      className="sidebar"
      style={{ height: '100vh' }}
    >
      <div
        className={`demo-logo-vertical ${collapsed ? 'collapsed' : 'expanded'}`}
        onClick={handleLogoClick}
        onKeyDown={onLogoKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Reset to général"
      >
        <img src="/img/logofree.png" alt="Logo" className="sidebar-logo" />
      </div>

      <div style={{ height: 'calc(100% - 64px)', overflowY: 'auto', padding: '0 10px' }}>
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={['auto']}
          inlineCollapsed={collapsed}
          onClick={handleMenuClick}
          items={menuItems}
        />

        {!collapsed && showMap && (
          <div style={{ marginTop: '10px', minHeight: '400px', width: '100%' }}>
            <TunisiaMap />
          </div>
        )}
      </div>
    </Sider>
  );
};

export default Sidebar;
