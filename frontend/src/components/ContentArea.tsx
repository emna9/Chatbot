import React from 'react';
import { Layout, theme } from 'antd';
// import Independent from './Independent';

const { Content } = Layout;

const ContentArea: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Content
      style={{
        margin: '24px 16px',
        padding: 24,
        minHeight: 280,
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
      }}
    >
       {/* <Independent /> */}
    </Content>
  );
};

export default ContentArea;
