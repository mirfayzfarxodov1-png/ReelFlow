import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export const useVideo = (videoId) => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const loadVideo = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/videos/${videoId}`);
      setVideo(response.data);
      setIsLiked(response.data.isLiked || false);
      setLikesCount(response.data.likesCount || 0);
      setIsSaved(response.data.isSaved || false);
    } catch (err) {
      setError(err.response?.data?.message || 'Video yuklanmadi');
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  const likeVideo = async () => {
    try {
      if (isLiked) {
        setLikesCount(prev => prev - 1);
      } else {
        setLikesCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
      await api.post(`/videos/${videoId}/like`);
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const saveVideo = async () => {
    try {
      setIsSaved(!isSaved);
      await api.post(`/videos/${videoId}/save`);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  useEffect(() => {
    loadVideo();
  }, [loadVideo]);

  return {
    video,
    loading,
    error,
    isLiked,
    likesCount,
    isSaved,
    likeVideo,
    saveVideo,
    reload: loadVideo
  };
};
