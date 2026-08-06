/**
 * Flexion AI Frontend API Client
 * Coordinates requests to Express Backend (/api) and FastAPI Service (/ai)
 */

export const getApiUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
};

export const getAiUrl = (): string => {
  return process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000/ai';
};

export const getLandmarkThreshold = (): number => {
  const thresholdStr = process.env.NEXT_PUBLIC_LANDMARK_CONFIDENCE_THRESHOLD || '0.5';
  return parseFloat(thresholdStr);
};

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
}

/**
 * Basic request helper to backend API endpoints
 */
export async function requestBackend<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const baseUrl = getApiUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
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
      data: data as T,
    };
  } catch (error) {
    console.error(`[ERROR] Backend request to ${url} failed:`, error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Unable to reach the backend service. Check your connection.',
      },
    };
  }
}

/**
 * Basic request helper to FastAPI endpoints (Requires API key auth for security middleware)
 */
export async function requestAi<T>(endpoint: string, serviceKey: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const baseUrl = getAiUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-AI-SERVICE-KEY': serviceKey,
        ...options?.headers,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || { code: 'AI_ERROR', message: `FastAPI returned status ${response.status}` },
      };
    }

    return {
      success: true,
      data: data as T,
    };
  } catch (error) {
    console.error(`[ERROR] FastAPI request to ${url} failed:`, error);
    return {
      success: false,
      error: {
        code: 'AI_NETWORK_ERROR',
        message: 'Unable to reach the analysis service. Check your connection.',
      },
    };
  }
}
