import axios from 'axios';
import { getToken } from './storage';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (username, email, password) => {
  const response = await api.post('/auth/register', { username, email, password });
  return response.data;
};

export const getFeed = async (type) => {
  const response = await api.get('/videos/feed');
  return response.data;
};

export const getVideo = async (id) => {
  const response = await api.get(`/videos/${id}`);
  return response.data;
};

export const likeVideo = async (id) => {
  const response = await api.put(`/videos/${id}/like`);
  return response.data;
};

export const getComments = async (videoId) => {
  const response = await api.get(`/comments/${videoId}`);
  return response.data;
};

export const addComment = async (videoId, text) => {
  const response = await api.post(`/comments/${videoId}`, { text });
  return response.data;
};

export const getUserProfile = async (username) => {
  const response = await api.get(`/users/${username}`);
  return response.data;
};

export const followUser = async (userId) => {
  const response = await api.put(`/users/follow/${userId}`);
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put('/users/profile', data);
  return response.data;
};
