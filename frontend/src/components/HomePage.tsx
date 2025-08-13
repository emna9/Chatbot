// Updated React component with Ant Design X styling, user-selectable branch/questions, searchable tags,
// and homepage layout with two boxes (description + most asked questions).

import React, { useEffect, useRef, useState } from 'react';
import {
  Select,
  Input,
  Typography,
  Card,
  Divider,
  List,
  Button,
  Space,
  Tag,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Independent from './Independent';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const BRANCHES = [
  {
    key: 'insurance',
    label: 'Insurance',
    questions: [
      { text: 'What does my insurance cover?', tags: ['coverage', 'insurance'] },
      { text: 'How to renew my policy?', tags: ['renewal', 'insurance'] },
    ],
  },
  {
    key: 'claims',
    label: 'Claims',
    questions: [
      { text: 'How to file a claim?', tags: ['claims', 'process'] },
      { text: 'Claim processing time?', tags: ['claims', 'duration'] },
    ],
  },
];

const TAGS = ['coverage', 'insurance', 'renewal', 'claims', 'process', 'duration'];

const HomePage = () => {
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>();
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>([]);
  const [searchTag, setSearchTag] = useState('');

  const allQuestions = BRANCHES.flatMap((b) => b.questions);

  useEffect(() => {
    if (searchTag) {
      const filtered = allQuestions.filter((q) => q.tags.includes(searchTag.toLowerCase()));
      setFilteredQuestions(filtered);
    } else {
      setFilteredQuestions([]);
    }
  }, [searchTag]);

  const handleSelectBranch = (value: string) => {
    setSelectedBranch(value);
  };

  const handleQuestionClick = (text: string) => {
    const input = document.querySelector<HTMLInputElement>(
      '.ant-input[placeholder="Ask or input / use skills"]'
    );
    if (input) {
      input.value = text;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Box 1: Description */}
        <Card title="About COMAR & Our Chatbot" bordered>
          <Paragraph>
            COMAR is a leading insurance company offering a wide range of products tailored to individual
            and corporate needs. Our AI-powered chatbot helps you find answers, file claims, and understand
            your insurance policies quickly and efficiently.
          </Paragraph>
        </Card>

        {/* Box 2: Most Asked Questions */}
        <Card title="Most Asked Questions" bordered>
          <List
            dataSource={['How to file a claim?', 'What does my insurance cover?', 'Claim processing time?']}
            renderItem={(item) => (
              <List.Item>
                <Button type="link" onClick={() => handleQuestionClick(item)}>
                  {item}
                </Button>
              </List.Item>
            )}
          />
        </Card>

        {/* Branch Select + Questions */}
        <Card title="Browse by Branch" bordered>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Select
              placeholder="Select a branch"
              onChange={handleSelectBranch}
              style={{ width: '50%' }}
              allowClear
            >
              {BRANCHES.map((branch) => (
                <Option key={branch.key} value={branch.key}>
                  {branch.label}
                </Option>
              ))}
            </Select>

            {selectedBranch && (
              <List
                header={<strong>Questions in {selectedBranch}</strong>}
                dataSource={
                  BRANCHES.find((b) => b.key === selectedBranch)?.questions || []
                }
                renderItem={(item) => (
                  <List.Item>
                    <Button type="link" onClick={() => handleQuestionClick(item.text)}>
                      {item.text}
                    </Button>
                  </List.Item>
                )}
              />
            )}
          </Space>
        </Card>

        {/* Search by Tag */}
        <Card title="Search by Tag" bordered>
          <Input
            placeholder="Type a tag (e.g. claims, renewal)"
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchTag(e.target.value.trim().toLowerCase())}
            style={{ width: '50%' }}
          />

          <Divider />

          {filteredQuestions.length > 0 ? (
            <List
              header={<strong>Matching Questions</strong>}
              dataSource={filteredQuestions}
              renderItem={(item) => (
                <List.Item>
                  <Button type="link" onClick={() => handleQuestionClick(item.text)}>
                    {item.text}
                  </Button>
                </List.Item>
              )}
            />
          ) : (
            <Tag color="default">No matches found or no tag entered</Tag>
          )}
        </Card>

        {/* Chatbot Component */}
        <Independent />
      </Space>
    </div>
  );
};

export default HomePage;
