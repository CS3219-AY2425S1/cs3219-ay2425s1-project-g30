import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { env } from '@/env.mjs';

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const apiClient: AxiosInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

export const apiCall = async <T>(
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
  url: string,
  data?: any,
  params?: Record<string, any>,
): Promise<T> => {
  try {
    const config: AxiosRequestConfig = {
      params,
    };

    const response = await apiClient.request<T>({
      url,
      method,
      data,
      ...config,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(
        error.response?.data?.message || error.message,
        error.response?.status || 500,
      );
    }
    throw new ApiError('An unexpected error occurred', 500);
  }
};
