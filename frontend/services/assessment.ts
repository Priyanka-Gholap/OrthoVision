import { getApiUrl, ApiResponse } from './api';

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

export interface AssessmentRecord {
  _id: string;
  patientId: string;
  joint: 'SF001' | 'SA001' | 'EF001' | 'KF001' | 'HF001' | 'NR001';
  peakRom: number;
  classification: 'Normal' | 'Mild Limitation' | 'Moderate Limitation' | 'Severe Limitation';
  confidenceScore: number;
  createdAt: string;
  updatedAt: string;
}

export const saveAssessmentApi = async (body: {
  joint: string;
  peakRom: number;
  classification: string;
  confidenceScore?: number;
}): Promise<ApiResponse<AssessmentRecord>> => {
  return fetchWithCredentials<AssessmentRecord>(`${API_URL}/v1/assessment/save`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

export const getAssessmentHistoryApi = async (): Promise<ApiResponse<AssessmentRecord[]>> => {
  return fetchWithCredentials<AssessmentRecord[]>(`${API_URL}/v1/assessment/history`, {
    method: 'GET',
  });
};
