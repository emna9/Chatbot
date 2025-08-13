// src/services/mistralService.ts
import { api } from './api';

export const generateCourse = async (topic: string) => {
  try {
    const response = await api.post('/generate-course', {
      topic,
      language: 'fr', // or make it a param if needed
    });
    return response.data;
  } catch (error) {
    console.error('generateCourse error:', error);
    throw error;
  }
};
