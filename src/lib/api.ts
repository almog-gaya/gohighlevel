import axios, { AxiosError } from 'axios';
import { Installation } from './firebase';

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

let currentTokens: AuthTokens | null = null;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_GHL_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Version': '2021-07-28'
  },
  timeout: 10000,
});

// Add request interceptor for authentication and logging
api.interceptors.request.use(
  async (config) => {
    if (currentTokens?.access_token) {
      config.headers.Authorization = `Bearer ${currentTokens.access_token}`;
    }
    
    // Add the client ID to all requests
    config.headers['Client-Id'] = process.env.NEXT_PUBLIC_GHL_CLIENT_ID;
    
    // Log request details (excluding sensitive data)
    const sanitizedConfig = {
      ...config,
      headers: {
        ...config.headers,
        Authorization: '[REDACTED]',
        'Client-Id': '[REDACTED]'
      }
    };
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      headers: sanitizedConfig.headers,
      data: config.data
    });
    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    if (error.response) {
      console.error('API Response Error:', {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data,
        message: error.message
      });
    } else if (error.request) {
      console.error('API Request Error:', {
        url: error.config?.url,
        request: error.request,
        message: error.message
      });
    } else {
      console.error('API Setup Error:', {
        message: error.message,
        error: error
      });
    }
    return Promise.reject(error);
  }
);

export const initializeAuth = async () => {
  try {
    const response = await fetch('/api/auth');
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data.authorizationUrl;
  } catch (error) {
    console.error('Failed to initialize auth:', error);
    throw error;
  }
};

export const handleAuthCallback = async (code: string) => {
  try {
    const response = await fetch('/api/auth/callback?code=' + code);
    const tokens = await response.json();
    
    if (tokens.error) {
      throw new Error(tokens.error);
    }
    
    currentTokens = tokens;
    return tokens;
  } catch (error) {
    console.error('Failed to handle auth callback:', error);
    throw error;
  }
};

export interface SubAccountData {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  address1?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface LocationResponse {
  id: string;
  name: string;
  apiKey: string;
  companyId: string;
  userId: string;
}

export interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
}

export interface Opportunity {
  id: string;
  title: string;
  value: number;
  pipelineId: string;
  stageId: string;
  status: string;
  contact?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const createSubAccount = async (data: SubAccountData) => {
  try {
    if (!currentTokens?.access_token) {
      throw new Error('Not authenticated');
    }

    console.log('Creating sub-account with data:', data);
    
    const payload = {
      name: data.companyName,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      address: {
        line1: data.address1,
        city: data.city,
        state: data.state,
        country: data.country || 'US',
        postalCode: data.postalCode
      },
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    const response = await api.post('/api/v2/locations', payload);
    
    if (!response.data) {
      throw new Error('No data received from the server');
    }

    const locationData: LocationResponse = response.data;
    
    console.log('Sub-account created:', {
      id: locationData.id,
      name: locationData.name,
      apiKey: '[REDACTED]'
    });
    
    return locationData;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'An unknown error occurred';
      
      console.error('Create sub-account error details:', {
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      
      throw new Error(`Failed to create sub-account: ${errorMessage}`);
    }
    throw error;
  }
};

export async function getOpportunities(
  installationOrLocationId?: Installation | string,
  pipelineId?: string
): Promise<Opportunity[]> {
  try {
    // Case 1: Using Installation object (marketplace app flow)
    if (installationOrLocationId && typeof installationOrLocationId === 'object') {
      const installation = installationOrLocationId;
      const url = pipelineId 
        ? `/api/v2/pipelines/${pipelineId}/opportunities`
        : '/api/v2/opportunities';

      const response = await api.get(url, {
        headers: {
          'Authorization': `Bearer ${installation.accessToken}`
        }
      });

      if (!response.data) {
        throw new Error('No data received from the server');
      }

      return response.data.opportunities || [];
    }
    
    // Case 2: Using locationId (direct API flow)
    if (!currentTokens?.access_token) {
      throw new Error('Not authenticated');
    }

    console.log('Fetching opportunities...');
    const locationId = typeof installationOrLocationId === 'string' ? installationOrLocationId : undefined;

    const response = await api.get(locationId 
      ? `/api/v2/locations/${locationId}/opportunities`
      : '/api/v2/opportunities'
    );

    return response.data?.opportunities || [];
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    if (error instanceof AxiosError) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'An unknown error occurred';
      throw new Error(`Failed to fetch opportunities: ${errorMessage}`);
    }
    throw error;
  }
}

export async function getPipelines(installation: Installation): Promise<Pipeline[]> {
  const response = await api.get('/api/v2/pipelines', {
    headers: {
      'Authorization': `Bearer ${installation.accessToken}`
    }
  });

  if (!response.data) {
    throw new Error('No data received from the server');
  }

  return response.data.pipelines || [];
}

export async function createOpportunity(
  installation: Installation,
  pipelineId: string,
  data: {
    title: string;
    value: number;
    stageId: string;
    contactId?: string;
  }
): Promise<Opportunity> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_GHL_BASE_URL}/v1/pipelines/${pipelineId}/opportunities`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${installation.accessToken}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to create opportunity');
  }

  return response.json();
}

export async function updateOpportunityStage(
  installation: Installation,
  opportunityId: string,
  pipelineId: string,
  stageId: string
): Promise<Opportunity> {
  const response = await api.patch(
    `/api/v2/pipelines/${pipelineId}/opportunities/${opportunityId}`,
    { stageId },
    {
      headers: {
        'Authorization': `Bearer ${installation.accessToken}`
      }
    }
  );

  if (!response.data) {
    throw new Error('No data received from the server');
  }

  return response.data;
} 