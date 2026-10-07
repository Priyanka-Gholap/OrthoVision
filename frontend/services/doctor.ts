import { getApiUrl, ApiResponse } from './api';

const API_URL = getApiUrl();

/**
 * Standard fetch helper that includes credentials (HttpOnly cookies)
 */
async function fetchWithCredentials<T>(url: string, options: RequestInit = {}, responseType: 'json' | 'blob' = 'json'): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Crucial for sending/receiving HttpOnly cookies in dev
    });

    if (!response.ok) {
      const data = await response.json();
      return {
        success: false,
        error: data.error || { code: 'HTTP_ERROR', message: `Server returned status ${response.status}` },
      };
    }

    if (responseType === 'blob') {
      return {
        success: true,
        data: await response.blob() as T,
      };
    }

    const data = await response.json();
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

export interface PatientUser {
  _id: string;
  fullName: string;
  email: string;
}

export interface PatientRecord {
  _id: string;
  patientId: PatientUser;
  doctorId?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  medicalHistory?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentRecord {
  _id: string;
  patientId: string;
  joint: 'SF001' | 'SA001' | 'EF001' | 'KF001' | 'HF001' | 'NR001';
  peakRom: number;
  classification: 'Normal' | 'Mild Limitation' | 'Moderate Limitation' | 'Severe Limitation';
  confidenceScore: number;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

export const getPatientsApi = async (search?: string): Promise<ApiResponse<PatientRecord[]>> => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return fetchWithCredentials<PatientRecord[]>(`${API_URL}/v1/doctor/patients${query}`, {
    method: 'GET',
  });
};

export const getPatientByIdApi = async (id: string): Promise<ApiResponse<PatientRecord>> => {
  return fetchWithCredentials<PatientRecord>(`${API_URL}/v1/doctor/patients/${id}`, {
    method: 'GET',
  });
};

export const assignPatientApi = async (id: string): Promise<ApiResponse<PatientRecord>> => {
  return fetchWithCredentials<PatientRecord>(`${API_URL}/v1/doctor/patients/${id}/assign`, {
    method: 'POST',
  });
};

export const getPatientAssessmentsApi = async (id: string): Promise<ApiResponse<AssessmentRecord[]>> => {
  return fetchWithCredentials<AssessmentRecord[]>(`${API_URL}/v1/doctor/patients/${id}/assessments`, {
    method: 'GET',
  });
};

export const updateAssessmentRemarksApi = async (
  patientId: string,
  assessmentId: string,
  remarks: string
): Promise<ApiResponse<AssessmentRecord>> => {
  return fetchWithCredentials<AssessmentRecord>(
    `${API_URL}/v1/doctor/patients/${encodeURIComponent(patientId)}/assessments/${encodeURIComponent(assessmentId)}/remarks`,
    {
      method: 'PUT',
      body: JSON.stringify({ remarks }),
    }
  );
};

export const getAssessmentReportApi = async (
  patientId: string,
  assessmentId: string
): Promise<ApiResponse<Blob>> => {
  return fetchWithCredentials<Blob>(
    `${API_URL}/v1/doctor/patients/${encodeURIComponent(patientId)}/assessments/${encodeURIComponent(assessmentId)}/report`,
    { method: 'GET' },
    'blob'
  );
};
