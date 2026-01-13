import { google } from 'googleapis';
import { Readable } from 'stream';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-drive',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Drive not connected');
  }
  return accessToken;
}

export async function getGoogleDriveClient() {
  // Check for Service Account credentials (Vercel)
  if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      null as any,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/drive']
    );
    return google.drive({ version: 'v3', auth });
  }

  // Fallback to Replit Connector (Local/Replit)
  const accessToken = await getAccessToken();
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

export async function uploadFileToDrive(
  fileName: string,
  mimeType: string,
  fileContent: string
): Promise<{ id: string; name: string; webViewLink: string }> {
  console.log('=== Starting Google Drive Upload ===');
  console.log('File Name:', fileName);
  console.log('MIME Type:', mimeType);
  console.log('Has Service Account Email:', !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
  console.log('Has Private Key:', !!process.env.GOOGLE_PRIVATE_KEY);
  console.log('Has Folder ID:', !!process.env.GOOGLE_DRIVE_FOLDER_ID);
  console.log('Folder ID:', process.env.GOOGLE_DRIVE_FOLDER_ID);

  const drive = await getGoogleDriveClient();

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!folderId && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    console.error('ERROR: GOOGLE_DRIVE_FOLDER_ID is required when using a Service Account');
    throw new Error('GOOGLE_DRIVE_FOLDER_ID is required when using a Service Account. Service Accounts cannot upload files without specifying a shared folder.');
  }

  const fileMetadata: any = {
    name: fileName,
  };

  if (folderId) {
    fileMetadata.parents = [folderId];
    console.log('Uploading to folder:', folderId);
  }

  try {
    const buffer = Buffer.from(fileContent, 'base64');
    console.log('Buffer size:', buffer.length, 'bytes');

    const media = {
      mimeType,
      body: Readable.from(buffer),
    };

    console.log('Calling Google Drive API...');
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name, webViewLink',
    });

    console.log('File created successfully! ID:', response.data.id);

    console.log('Setting file permissions to public...');
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    console.log('=== Upload Complete ===');
    return {
      id: response.data.id!,
      name: response.data.name!,
      webViewLink: response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view`,
    };
  } catch (error: any) {
    console.error('=== Google Drive Upload Error ===');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Details:', JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function deleteFileFromDrive(fileId: string): Promise<void> {
  const drive = await getGoogleDriveClient();
  await drive.files.delete({ fileId });
}
