import { gapi } from 'gapi-script';

// Define your Google API Client ID and API Key
const CLIENT_ID = '255971969058-i2ssds26qktl19d5sc5n6qm367l9jn57.apps.googleusercontent.com'; // Replace with your Google Client ID
const API_KEY = 'YOUR_GOOGAIzaSyDc_rxaGkLfU8Fr81ZGZoATHyn4hkQdizYLE_API_KEY'; // Replace with your API Key
const SCOPES = 'https://www.googleapis.com/auth/drive.file'; // Scope for accessing Google Drive files

let GoogleAuth;

export const initGoogleDriveAPI = () => {
  gapi.load('client:auth2', () => {
    gapi.auth2.init({
      client_id: CLIENT_ID,
    }).then(() => {
      GoogleAuth = gapi.auth2.getAuthInstance();
      console.log('Google API initialized');
    });
  });
};

export const signInWithGoogle = () => {
  GoogleAuth.signIn().then(() => {
    console.log('User signed in');
  });
};

export const signOutFromGoogle = () => {
  GoogleAuth.signOut().then(() => {
    console.log('User signed out');
  });
};

export const loadDriveAPI = () => {
  gapi.client.setApiKey(API_KEY);
  return gapi.client.load('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest');
};

// Upload the image to Google Drive
export const uploadToGoogleDrive = (file) => {
  const drive = gapi.client.drive.files.create({
    resource: {
      name: file.name,
      mimeType: file.type,
    },
    media: {
      mimeType: file.type,
      body: file,
    },
  });

  drive.execute((response) => {
    if (response.id) {
      console.log('File uploaded to Google Drive:', response);
      // Return the URL of the uploaded file
      return `https://drive.google.com/uc?id=${response.id}`;
    } else {
      console.error('Error uploading file:', response);
    }
  });
};
