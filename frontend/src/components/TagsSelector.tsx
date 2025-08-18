import React from 'react';
import { Select, Tag } from 'antd';

type TagsSelectorProps = {
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  theme: 'light' | 'dark';
};

const TAG_OPTIONS = [
  { label: 'auto', value: 'auto' },
  { label: 'santé', value: 'santé' },
  { label: 'voyage', value: 'voyage' },
  { label: 'habitation', value: 'habitation' },
  { label: 'prevoyance', value: 'prevoyance' },
];

interface CustomTagProps {
  label: React.ReactNode;
  value: string;
  closable: boolean;
  onClose: (e: React.MouseEvent<HTMLSpanElement>) => void;
}

const TagsSelector: React.FC<TagsSelectorProps> = ({ selectedTags, setSelectedTags, theme }) => {
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

  return (
    <Select
      mode="multiple"
      placeholder="Choisissez vos mots-clés"
      tagRender={tagRender}
      options={TAG_OPTIONS}
      style={{
        width: '100%',
        backgroundColor: theme === 'light' ? '#fff' : '#2c2c2c',
        color: theme === 'light' ? '#000' : '#eee',
      }}
      dropdownStyle={{
        backgroundColor: theme === 'light' ? '#fff' : '#2c2c2c',
        color: theme === 'light' ? '#000' : '#eee',
      }}
      value={selectedTags}
      onChange={(value) => setSelectedTags(value)}
      maxTagCount={3}
    />
  );
};

export default TagsSelector;
