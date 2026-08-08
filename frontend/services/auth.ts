import { getApiUrl, ApiResponse } from './api';
import { User } from '../types/auth';

const API_URL = getApiUrl();

/**
 * Standard fetch helper that includes credentials (HttpOnly cookies)
 */
async function fetchWithCredentials<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Crucial for sending/receiving HttpOnly cookies in dev
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || { code: 'HTTP_ERROR', message: `Server returned status ${response.status}` },
      };
    }

    return {
      success: true,
      data: data.data as T,
    };
  } catch (error) {
    console.error(`[ERROR] Request failed to ${url}:`, error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Unable to reach the server. Please check your network connection.',
      },
    };
  }
}

export const registerApi = async (body: object): Promise<ApiResponse<{ user: User }>> => {
  return fetchWithCredentials<{ user: User }>(`${API_URL}/v1/auth/register`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

export const loginApi = async (body: object): Promise<ApiResponse<{ user: User; token?: string }>> => {
  return fetchWithCredentials<{ user: User; token?: string }>(`${API_URL}/v1/auth/login`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

export const logoutApi = async (): Promise<ApiResponse<void>> => {
  return fetchWithCredentials<void>(`${API_URL}/v1/auth/logout`, {
    method: 'POST',
  });
};

export const getMeApi = async (): Promise<ApiResponse<{ user: User; profile: any }>> => {
  return fetchWithCredentials<{ user: User; profile: any }>(`${API_URL}/v1/auth/me`, {
    method: 'GET',
  });
};

export const updateProfileApi = async (body: object): Promise<ApiResponse<any>> => {
  return fetchWithCredentials<any>(`${API_URL}/v1/patients/profile`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
};
