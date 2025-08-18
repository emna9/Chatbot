import React, { useEffect, useRef, useState } from 'react';
import {
  AppstoreAddOutlined,
  CloudUploadOutlined,
  CopyOutlined,
  DislikeOutlined,
  FileSearchOutlined,
  LikeOutlined,
  PaperClipOutlined,
  ProductOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  BulbOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';
import {
  Attachments,
  Bubble,
  Prompts,
  Sender,
} from '@ant-design/x';
import { Avatar, Button, Flex, message, Select, Tag } from 'antd';
import '../styles/IndependentStyles.css';
import 'leaflet/dist/leaflet.css'; // Leaflet CSS
import HeaderSection from '../components/HeaderSection';
import { Question } from '../../types/Question';
import { BRANCH_INFO } from '../data/branchInfo';
import { generateCourse } from '../services/mistralService';
import { fetchQuestionsByTags } from '../services/tagService';
import Loader from '../components/Loader';
import { marked } from 'marked';
import ChatHeader from '../components/ChatHeader';

interface CustomTagProps {
  label: React.ReactNode;
  value: string;
  closable: boolean;
  onClose: (e: React.MouseEvent<HTMLSpanElement>) => void;
}

type IndependentProps = {
  dynamicPrompts?: { key: string; description: string }[] | null;
  selectedBranch?: string;
  selectedTags: string[];
};



const TAG_OPTIONS = [
  { label: 'auto', value: 'auto' },
  { label: 'santé', value: 'santé' },
  { label: 'voyage', value: 'voyage' },
  { label: 'habitation', value: 'habitation' },
  { label: 'prevoyance', value: 'prevoyance' },
];

const DEFAULT_CONVERSATIONS_ITEMS = [
  { key: 'default-0', label: 'What is Ant Design X?', group: 'Today' },
  { key: 'default-1', label: 'How to quickly install and import components?', group: 'Today' },
  { key: 'default-2', label: 'New AGI Hybrid Interface', group: 'Yesterday' },
];

const Independent: React.FC<IndependentProps> = ({ dynamicPrompts: parentPrompts = null, selectedBranch: parentBranch = 'général',selectedTags: parentTags = [], }) => {
  const abortController = useRef<AbortController | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageHistory, setMessageHistory] = useState<Record<string, any>>({});
  const [conversations, setConversations] = useState(DEFAULT_CONVERSATIONS_ITEMS);
  const [curConversation, setCurConversation] = useState(DEFAULT_CONVERSATIONS_ITEMS[0].key);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [dynamicPrompts, setDynamicPrompts] = useState<{ key: string; description: string }[] | null>(parentPrompts);
  const [selectedBranch, setSelectedBranch] = useState<string>(parentBranch);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  
  const chatListRef = useRef<HTMLDivElement>(null);

  // Keep local state in sync when parent updates props
  useEffect(() => setDynamicPrompts(parentPrompts), [parentPrompts]);
  useEffect(() => setSelectedBranch(parentBranch), [parentBranch]);

  // tag render
  const tagRender = (props: CustomTagProps) => {
    const { label, closable, onClose } = props;
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };
    const isDark = theme === 'dark';

    return (
      <Tag
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{
          marginInlineEnd: 4,
          backgroundColor: isDark ? '#0050b3' : '#1890ff',
          color: '#fff',
          border: 'none',
          userSelect: 'none',
        }}
      >
        {label}
      </Tag>
    );
  };

  // Format assistant markdown text into paragraphs
  const formatAssistantText = (text: string) => {
    const paragraphs = text.trim().split(/\n\s*\n/).filter(Boolean);
  return (
    <div className="prose prose-invert max-w-none text-sm" style={{ whiteSpace: 'normal' }}>
      {paragraphs.map((para, idx) => (
        <div
          key={idx}
          dangerouslySetInnerHTML={{ __html: marked.parse(para) as string }}
          style={{ marginBottom: '1em' }}
        />
      ))}
    </div>
  );
};
const loadQuestions = async () => {
  // if (parentPrompts) return; // parent already provided prompts — don't override

    if (!parentTags || parentTags.length === 0) {
      try {
        const res = await fetch('http://127.0.0.1:8000/questions/branch/général');
        const data = await res.json();
        setDynamicPrompts(data.map((q: any) => ({ key: q.id.toString(), description: q.question })));
      } catch (err) {
        console.error('Failed to fetch general questions:', err);
        setDynamicPrompts([]);
      }
      return;
    }

    try {
      const data = await fetchQuestionsByTags(parentTags); // ✅ use parentTags
      setDynamicPrompts(data.map((q: any) => ({ key: q.id.toString(), description: q.question })));
    } catch (err) {
      console.error('Failed to fetch questions by tags:', err);
      setDynamicPrompts([]);
    }
  };



// Whenever parentBranch or parentTags change, reload questions
useEffect(() => {
  const fetchBranchQuestions = async () => {
    if (!parentBranch) return;

    try {
      let data;
      if (parentTags && parentTags.length > 0) {
        data = await fetchQuestionsByTags(parentTags);
      } else {
        const res = await fetch(`http://127.0.0.1:8000/questions/branch/${parentBranch}`);
        data = await res.json();
      }

      setDynamicPrompts(data.map((q: any) => ({ key: q.id.toString(), description: q.question })));
    } catch (err) {
      console.error('Failed to fetch questions:', err);
      setDynamicPrompts([]);
    }
  };

  fetchBranchQuestions();
}, [parentBranch, parentTags]);


  // Scroll chat to bottom on new message
  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTo({
        top: chatListRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Change body theme colors
  useEffect(() => {
    document.body.style.backgroundColor = theme === 'light' ? '#fff' : '#121212';
    document.body.style.color = theme === 'light' ? '#000' : '#eee';
  }, [theme]);

  // Reset function
  const resetToStart = () => {
    setMessages([]);
    setInputValue('');
    setSelectedBranch('général');
    setLoading(false);
    loadQuestions();
  };

  // onSubmit (unchanged)
  const onSubmit = async (val: string) => {
    if (!val.trim()) return;
    if (loading) {
      message.warning('Please wait for the current request to finish.');
      return;
    }
    setMessages((prev) => [...prev, { role: 'user', content: val }, { role: 'assistant', content: '' }]);
    setLoading(true);
    try {
      const data = await generateCourse(val);
      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        updated[lastIndex].content = data.answer.trim();
        return updated;
      });
    } catch (error) {
      console.error('Service error:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length) {
      setMessageHistory((prev) => ({ ...prev, [curConversation]: messages }));
    }
  }, [messages, curConversation]);

const chatHeader = <ChatHeader selectedBranch={selectedBranch} theme={theme} />;


  // Chat list JSX
  const chatList = (
    <div
      className="chatList"
      ref={chatListRef}
      style={{ paddingInline: 'calc((100% - 700px) / 2)', overflowY: 'auto', maxHeight: 'calc(100vh - 130px)' }}
    >
      {messages.length ? (
        <>
          {messages.map((msg, index) =>
            msg.role === 'user' ? (
              <Bubble key={index} placement="end" content={<span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>} />
            ) : (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  margin: '8px 0',
                  maxWidth: 700,
                  wordBreak: 'break-word',
                }}
              >
                <img src="/img/logofree.png" alt="Comar Logo" style={{ width: 20, height: 30, marginTop: 4 }} />
                <div style={{ lineHeight: 1.6, flex: 1 }}>
                  {msg.content ? formatAssistantText(msg.content) : <Loader />}
                </div>
              </div>
            )
          )}
        </>
      ) : (
<div
  className="placeholder"
  style={{
    paddingInline: 'calc((100% - 700px) / 2)',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  }}
>
  {/* Prompts component only */}
  <div style={{ maxWidth: 700, width: '100%', marginTop: 24 }}>
    <Prompts
      wrap
      items={
        dynamicPrompts && dynamicPrompts.length > 0
          ? dynamicPrompts.map((item) => ({
              key: item.key,
              icon: <BulbOutlined style={{ color: '#1890ff' }} />,
              description: item.description,
            }))
          : [
              {
                key: 'loading',
                label: 'Loading...',
                description: 'Loading general questions...',
              },
            ]
      }
      onItemClick={(info) => {
        onSubmit(info.data.description as string);
      }}
      styles={{
        list: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
        item: {
          cursor: 'pointer',
          borderRadius: 12,
          backgroundColor: theme === 'light' ? '#f9fbfd' : '#1e1e1e',
          color: theme === 'light' ? '#000' : '#eee',
          padding: '10px 12px',
          userSelect: 'none',
        },
      }}
    />
  </div>
</div>


      )}
    </div>
  );

  const senderHeader = (
    <Sender.Header title="Upload File" open={attachmentsOpen} onOpenChange={setAttachmentsOpen} styles={{ content: { padding: 0 } }}>
      <Attachments
        beforeUpload={() => false}
        items={attachedFiles}
        onChange={(info) => setAttachedFiles(info.fileList)}
        placeholder={(type) =>
          type === 'drop'
            ? { title: 'Drop file here' }
            : {
                icon: <CloudUploadOutlined />,
                title: 'Upload files',
                description: 'Click or drag files to this area to upload',
              }
        }
      />
    </Sender.Header>
  );

  const chatSender = (
    <Sender
      value={inputValue}
      header={senderHeader}
      onSubmit={() => {
        onSubmit(inputValue);
        setInputValue('');
      }}
      onChange={setInputValue}
      onCancel={() => {
        abortController.current?.abort();
      }}
      loading={loading}
      className="sender"
      placeholder="Ask or input / use skills"
      allowSpeech={false}
      styles={{
        input: {
          backgroundColor: theme === 'light' ? '#FCFCFF' : '#1e1e1e',
          color: theme === 'light' ? '#000' : '#eee',
          minHeight: 56,
          fontSize: 16,
          padding: '12px',
          borderRadius: 8,
        },
      }}
      actions={(_, info) => {
        const { SendButton, LoadingButton } = info.components;
        return (
          <Flex gap={4}>
            <Button type="text" icon={<PaperClipOutlined style={{ fontSize: 18 }} />} onClick={() => setAttachmentsOpen(!attachmentsOpen)} />
            {loading ? <LoadingButton type="default" /> : <SendButton type="primary" />}
          </Flex>
        );
      }}
    />
  );

  return (
    <div
      className={`layout ${theme}`}
      style={{
        backgroundColor: theme === 'light' ? '#fff' : '#121212',
        color: theme === 'light' ? '#000' : '#eee',
        width: '100%',
        minWidth: 1000,
        height: '100vh',
        display: 'flex',
      }}
    >
      {/* Left column (headerSection + map) — keep your HeaderSection wrapper */}
      <div className="sidebar">

      </div>

<div className="chat" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
  {messages.length === 0 ? (
    // Initial state: show header + prompts, sender below
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ marginBottom: 24 }}>{chatHeader}</div>
      {chatSender}
      {chatList}
    </div>
  ) : (
    // After first message: sender at bottom
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>{chatList}</div>
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 1000,
           marginTop: 12,
        }}
      >
        {chatSender}
      </div>
    </div>
  )}
</div>


    </div>
  );
};

export default Independent;
