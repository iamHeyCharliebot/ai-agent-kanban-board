import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const TOKEN_PATH = path.join(process.cwd(), '../skills/gmail/token.json');
const CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
                         path.join(process.cwd(), '../skills/gmail/credentials.json');

const TASK_LIST_ID = 'MDI0MDg4MTI2OTEyMTU3MDgyNzk6MDow'; // Dean's "My Tasks" list

function getTasksClient() {
  if (!fs.existsSync(TOKEN_PATH)) {
    throw new Error(`Token file not found: ${TOKEN_PATH}`);
  }

  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(`Credentials file not found: ${CREDENTIALS_PATH}`);
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
  
  const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oauth2Client.setCredentials(token);

  return google.tasks({ version: 'v1', auth: oauth2Client });
}

export async function createGoogleTask(title: string, notes: string): Promise<string | null> {
  try {
    const tasks = getTasksClient();
    
    const res = await tasks.tasks.insert({
      tasklist: TASK_LIST_ID,
      requestBody: {
        title,
        notes
      }
    });

    return res.data.id || null;
  } catch (error) {
    console.error('Error creating Google Task:', error);
    return null;
  }
}

export async function completeGoogleTask(googleTaskId: string): Promise<boolean> {
  try {
    const tasks = getTasksClient();
    
    await tasks.tasks.update({
      tasklist: TASK_LIST_ID,
      task: googleTaskId,
      requestBody: {
        status: 'completed',
        completed: new Date().toISOString()
      }
    });

    return true;
  } catch (error) {
    console.error('Error completing Google Task:', error);
    return false;
  }
}

export async function deleteGoogleTask(googleTaskId: string): Promise<boolean> {
  try {
    const tasks = getTasksClient();
    
    await tasks.tasks.delete({
      tasklist: TASK_LIST_ID,
      task: googleTaskId
    });

    return true;
  } catch (error) {
    console.error('Error deleting Google Task:', error);
    return false;
  }
}

export async function getGoogleTaskStatus(googleTaskId: string): Promise<'needsAction' | 'completed' | null> {
  try {
    const tasks = getTasksClient();
    
    const res = await tasks.tasks.get({
      tasklist: TASK_LIST_ID,
      task: googleTaskId
    });

    return res.data.status as 'needsAction' | 'completed' || null;
  } catch (error) {
    console.error('Error getting Google Task status:', error);
    return null;
  }
}
