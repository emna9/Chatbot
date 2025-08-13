import React from 'react';
import { CloseOutlined, MenuOutlined } from '@ant-design/icons';
import Switch from './Switch';

type HeaderSectionProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  theme: 'light' | 'dark';
  onThemeChange: (newTheme: 'light' | 'dark') => void;
  onReset: () => void;  // New prop for reset action
};

const HeaderSection: React.FC<HeaderSectionProps> = ({
  children,
  isOpen,
  onToggle,
  theme,
  onThemeChange,
  onReset,
}) => {
  const sharedBg = theme === 'light' ? '#f9fbfd' : '#333';

  return (
    <div
      style={{
        backgroundColor: sharedBg,
        color: theme === 'light' ? '#000' : '#eee',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        width: isOpen ? 300 : 70,
        transition: 'width 0.3s ease',
        minWidth: 0,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isOpen ? 'space-between' : 'center',
          padding: '0 16px',
          backgroundColor: sharedBg,
          flexShrink: 0,
        }}
      >
        <img
          src="/img/logofree.png"
          alt="Comar Logo"
          style={{ width: 30, height: 60, cursor: 'pointer' }}
          onClick={onReset}  // Call reset on click, whether open or closed
        />

        {isOpen ? (
          <CloseOutlined
            onClick={onToggle}
            style={{ fontSize: 18, cursor: 'pointer', color: theme === 'dark' ? '#fff' : undefined }}
          />
        ) : null}
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: isOpen ? '16px' : '12px 0 48px',
          backgroundColor: sharedBg,
          boxSizing: 'border-box',
          maxWidth: '100%',
          width: '100%',
        }}
      >
        {!isOpen && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <MenuOutlined
              onClick={onToggle}
              style={{ fontSize: 18, cursor: 'pointer', color: theme === 'dark' ? '#fff' : undefined }}
            />
          </div>
        )}
        {isOpen && children}
      </div>

      {/* Footer */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 16px',
          backgroundColor: sharedBg,
          flexShrink: 0,
        }}
      >
        <Switch
          checked={theme === 'dark'}
          onChange={(checked) => onThemeChange(checked ? 'dark' : 'light')}
        />
      </div>
    </div>
  );
};

export default HeaderSection;
