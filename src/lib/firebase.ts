import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  // TODO: Replace with your Firebase config
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface Installation {
  locationId: string;
  companyId: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  installedAt: string;
  tokenExpiresAt: string;
  settings?: Record<string, any>;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export const saveInstallation = async (installation: Installation) => {
  try {
    const installationRef = doc(db, 'installations', `${installation.locationId}_${installation.companyId}`);
    
    // Calculate token expiration date
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + installation.expiresIn);

    await setDoc(installationRef, {
      ...installation,
      tokenExpiresAt: expiresAt.toISOString(),
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
    const installationRef = doc(db, 'installations', `${locationId}_${companyId}`);
    const installationDoc = await getDoc(installationRef);
    
    if (!installationDoc.exists()) {
      return null;
    }
    
    const installation = installationDoc.data() as Installation;
    
    // Check if token needs refresh (if expires in less than 5 minutes)
    const expiresAt = new Date(installation.tokenExpiresAt);
    const fiveMinutesFromNow = new Date();
    fiveMinutesFromNow.setMinutes(fiveMinutesFromNow.getMinutes() + 5);
    
    if (expiresAt < fiveMinutesFromNow) {
      const refreshedInstallation = await refreshToken(installation);
      return refreshedInstallation;
    }
    
    return installation;
  } catch (error) {
    console.error('Error getting installation:', error);
    throw error;
  }
};

export const refreshToken = async (installation: Installation): Promise<Installation> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_GHL_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_GHL_CLIENT_ID,
        client_secret: process.env.GHL_CLIENT_SECRET,
        refresh_token: installation.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const tokenData: TokenResponse = await response.json();
    
    const updatedInstallation: Installation = {
      ...installation,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      tokenType: tokenData.token_type,
    };

    await saveInstallation(updatedInstallation);
    return updatedInstallation;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

export const getCompanyInstallations = async (companyId: string) => {
  try {
    const installationsRef = collection(db, 'installations');
    const q = query(installationsRef, where('companyId', '==', companyId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data() as Installation);
  } catch (error) {
    console.error('Error getting company installations:', error);
    throw error;
  }
};

export const updateInstallationSettings = async (
  locationId: string,
  companyId: string,
  settings: Record<string, any>
) => {
  try {
    const installationRef = doc(db, 'installations', `${locationId}_${companyId}`);
    await setDoc(installationRef, {
      settings,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating installation settings:', error);
    throw error;
  }
};

export const deleteInstallation = async (locationId: string, companyId: string) => {
  try {
    const installationRef = doc(db, 'installations', `${locationId}_${companyId}`);
    await setDoc(installationRef, {
      uninstalledAt: new Date().toISOString(),
      isUninstalled: true
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error marking installation as uninstalled:', error);
    throw error;
  }
}; 