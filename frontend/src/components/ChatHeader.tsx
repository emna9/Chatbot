import React from 'react';
import { BRANCH_INFO } from '../data/branchInfo';

type ChatHeaderProps = {
  selectedBranch: string;
  theme: 'light' | 'dark';
};

const ChatHeader: React.FC<ChatHeaderProps> = ({ selectedBranch, theme }) => {
  return (
    <div
      style={{
        maxWidth: 700,
        width: '100%',
        margin: '0 auto',
        paddingTop: 48,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          flexDirection: 'column',
        }}
      >
        {selectedBranch === 'général' ? (
          <img src="/img/logofree.png" alt="Comar Logo" style={{ width: 70, height: 70, objectFit: 'contain' }} />
        ) : (
          <div>{BRANCH_INFO[selectedBranch]?.icon}</div>
        )}

        <span
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: theme === 'dark' ? '#fff' : '#1f1f1f',
            marginTop: 8,
            textAlign: 'center',
          }}
        >
          {selectedBranch === 'général' ? 'Je suis Comar Assurances Chatbot.' : ''}
        </span>
      </div>

      <div
        style={{
          fontSize: 13,
          color: '#666',
          fontWeight: 500,
          marginTop: 10,
        }}
      >
        {BRANCH_INFO[selectedBranch]?.description || 'Comment puis-je vous assister aujourd’hui ?'}
      </div>
    </div>
  );
};

export default ChatHeader;
