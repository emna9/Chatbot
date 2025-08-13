// src/services/tagService.ts
import { api } from './api';

export const fetchQuestionsByTags = async (tags: string[]) => {
  try {
    const response = await api.get('/api/tags/questions', {
      params: { tags },
      paramsSerializer: (params) =>
        params.tags.map((tag: string) => `tags=${encodeURIComponent(tag)}`).join('&'),
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch questions by tags:', error);
    throw error;
  }
};
