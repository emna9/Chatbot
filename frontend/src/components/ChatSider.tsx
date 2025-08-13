import React from 'react';
import { message } from 'antd';
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
import styled from 'styled-components';
import StyledIconButton from './StyledIconButton';

type ChatSiderProps = {
  onBranchSelect: (questions: Question[], branchKey: string) => void;
};

const branches = [
  { key: 'auto', icon: <CarOutlined /> },
  { key: 'santé', icon: <HeartOutlined /> },
  { key: 'voyage', icon: <RocketOutlined /> },
  { key: 'habitation', icon: <HomeOutlined /> },
  { key: 'vie', icon: <WarningOutlined /> },
  { key: 'pro', icon: <EditOutlined /> },
  { key: 'rc', icon: <FileSearchOutlined /> },
];

const StyledPromptsWrapper = styled.div`
  .title {
    font-weight: 300;
    font-size: 0.9rem;
    margin-bottom: 12px;
    color: #222;
    display: flex;
    align-items: center;
    gap: 6px;
      justify-content: center;
  }

.icon-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center; /* Or flex-start */
}

.branch-btn {
  flex: 1 1 30%;
  max-width: 30%;
  display: flex;
  justify-content: center;
}

`;

const ChatSider: React.FC<ChatSiderProps> = ({ onBranchSelect }) => {
  const handleBranchClick = async (branchKey: string) => {
    try {
      const questions = await fetchQuestionsByBranch(branchKey.toLowerCase());
      onBranchSelect(questions, branchKey.toLowerCase());
    } catch (err) {
      console.error(err);
      message.error("Échec du chargement des questions.");
    }
  };

  return (
    <div style={{ width: '100%', padding: '16px' }}>
      <StyledPromptsWrapper>
      <div
  className="title"
  style={{
    fontSize: 15,
    fontWeight: 500,
    color: '#1f1f1f',
    textAlign: 'center',
  }}
>
  ✨ Découvrez nos branches ? <span role="img" aria-label="sparkles">✨</span>
</div>

        <div className="icon-grid">
          {branches.map(({ key, icon }) => (
            <div className="branch-btn" key={key} onClick={() => handleBranchClick(key)}>
              <StyledIconButton icon={icon} />
            </div>
          ))}
        </div>
      </StyledPromptsWrapper>
    </div>
  );
};

export default ChatSider;
