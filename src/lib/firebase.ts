// Mock Firebase implementation
const mockDb = {
  installations: new Map()
};

export interface Installation {
  locationId: string;
  companyId: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  installedAt: string;
  tokenExpiresAt: string;
  settings?: {
    [key: string]: unknown;
  };
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export const saveInstallation = async (installation: Installation) => {
  try {
    const key = `${installation.locationId}_${installation.companyId}`;
    mockDb.installations.set(key, {
      ...installation,
      tokenExpiresAt: new Date(Date.now() + installation.expiresIn * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error saving installation:', error);
    throw error;
  }
};

export const getInstallation = async (locationId: string, companyId: string) => {
  try {
    const key = `${locationId}_${companyId}`;
    const installation = mockDb.installations.get(key);
    
    if (!installation) {
      return null;
    }
    
    return installation as Installation;
  } catch (error) {
    console.error('Error getting installation:', error);
    throw error;
  }
};

export const getCompanyInstallations = async (companyId: string) => {
  try {
    const installations = Array.from(mockDb.installations.values())
      .filter(inst => (inst as Installation).companyId === companyId);
    return installations as Installation[];
  } catch (error) {
    console.error('Error getting company installations:', error);
    throw error;
  }
};

export const updateInstallationSettings = async (
  locationId: string,
  companyId: string,
  settings: { [key: string]: unknown }
) => {
  try {
    const key = `${locationId}_${companyId}`;
    const installation = mockDb.installations.get(key);
    if (installation) {
      mockDb.installations.set(key, {
        ...installation,
        settings,
        updatedAt: new Date().toISOString()
      });
    }
    return true;
  } catch (error) {
    console.error('Error updating installation settings:', error);
    throw error;
  }
};

export const deleteInstallation = async (locationId: string, companyId: string) => {
  try {
    const key = `${locationId}_${companyId}`;
    mockDb.installations.delete(key);
    return true;
  } catch (error) {
    console.error('Error deleting installation:', error);
    throw error;
  }
}; 