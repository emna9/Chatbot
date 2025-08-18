import React from 'react';
import { Button, Layout } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import TagsSelector from './TagsSelector';

const { Header } = Layout;

interface TopbarProps {
  collapsed: boolean;
  toggle: () => void;
  showTags: boolean;
  onFilterClick: () => void;
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  theme?: 'light' | 'dark';
}

const Topbar: React.FC<TopbarProps> = ({
  collapsed,
  toggle,
  showTags,
  onFilterClick,
  selectedTags,
  setSelectedTags,
  theme = 'light',
}) => {
  return (
<Header
  style={{
    padding: '0 16px',
    background: '#f9fbfd',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  }}
>
  {/* Collapse sidebar button */}
  <Button
    type="text"
    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
    onClick={toggle}
    style={{ fontSize: 16, width: 64, height: 64 }}
  />

  {/* Right container: Tags + Filter */}
  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
    {showTags && (
      <div style={{ minWidth: 240, maxWidth: 400 }}>
        <TagsSelector
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          theme={theme}
        />
      </div>
    )}

    <Button
      type="text"
      icon={<FilterOutlined style={{ fontSize: 18 }} />}
      onClick={onFilterClick}
      style={{ fontSize: 16, width: 64, height: 64 }}
    />
  </div>
</Header>

  );
};

export default Topbar;
