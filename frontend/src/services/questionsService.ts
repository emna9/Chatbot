import { api } from './api';
import { Question } from '../../types/Question';

export const fetchAllQuestions = async (): Promise<Question[]> => {
  const res = await api.get('/questions/');
  return res.data;
};

export const fetchQuestionsByBranch = async (branch: string): Promise<Question[]> => {
  const res = await api.get(`/questions/branch/${branch}`);
  return res.data;
};

export const fetchQuestionsByTag = async (tag: string): Promise<Question[]> => {
  const res = await api.get(`/questions/search/${tag}`);
  return res.data;
};

export const fetchQuestionsByTags = async (tags: string[]): Promise<Question[]> => {
  const query = tags.map(tag => `tags=${tag}`).join('&');
  const res = await api.get(`/tags/questions?${query}`);
  return res.data;
};
