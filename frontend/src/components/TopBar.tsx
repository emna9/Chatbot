import React from 'react';
import { Button, Layout, theme } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

const { Header } = Layout;

interface TopbarProps {
  collapsed: boolean;
  toggle: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ collapsed, toggle }) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Header
      style={{
        padding: 0,
        background: '#f9fbfd',
        position: 'sticky', // make it stick
        top: 0,             // stick to top
        zIndex: 1000,       // ensure it is above other content
        width: '100%',
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={toggle}
        style={{ fontSize: '16px', width: 64, height: 64 }}
      />
    </Header>
  );
};

export default Topbar;
