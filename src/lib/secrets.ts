
'use server';
/**
 * @fileOverview Helper functions for interacting with GCP Secret Manager.
 *
 * - getGoogleApiKey - Fetches the Google API Key from Secret Manager.
 */
import {SecretManagerServiceClient} from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

/**
 * Fetches the Google API Key from GCP Secret Manager.
 * You need to set YOUR_GCP_PROJECT_ID and GOOGLE_API_KEY_SECRET_ID.
 * The version is typically 'latest'.
 *
 * Ensure the service account running this code has the "Secret Manager Secret Accessor" IAM role.
 */
export async function getGoogleApiKey(): Promise<string> {
  // IMPORTANT: Replace these placeholders with your actual GCP Project ID and Secret ID.
  const GCP_PROJECT_ID = 'YOUR_GCP_PROJECT_ID';
  const GOOGLE_API_KEY_SECRET_ID = 'GOOGLE_API_KEY'; // This is the ID of the secret you create in Secret Manager
  const SECRET_VERSION = 'latest';

  if (GCP_PROJECT_ID === 'YOUR_GCP_PROJECT_ID' || GOOGLE_API_KEY_SECRET_ID === 'GOOGLE_API_KEY') {
    console.warn(
      'GCP Project ID or Secret ID for Google API Key is not configured in src/lib/secrets.ts. ' +
      'Genkit might not initialize correctly if the API key is not found elsewhere (e.g., environment variables for other plugins).'
    );
    // Return a dummy key or throw an error if you want to enforce it's set
    // For now, we'll let Genkit's googleAI plugin try to find it via its default mechanisms if this fails.
    // However, if this function is explicitly called, it implies the key *should* come from Secret Manager.
    throw new Error(
      'Please configure GCP_PROJECT_ID and GOOGLE_API_KEY_SECRET_ID in src/lib/secrets.ts'
    );
  }

  const secretName = `projects/${GCP_PROJECT_ID}/secrets/${GOOGLE_API_KEY_SECRET_ID}/versions/${SECRET_VERSION}`;

  try {
    const [version] = await client.accessSecretVersion({name: secretName});
    const payload = version.payload?.data?.toString();
    if (!payload) {
      throw new Error(
        `Secret ${secretName} payload is empty or not found.`
      );
    }
    return payload;
  } catch (error) {
    console.error(`Failed to fetch secret ${secretName}:`, error);
    throw new Error(
      `Could not fetch Google API Key from Secret Manager. Ensure the secret exists, and the service account has the 'Secret Manager Secret Accessor' role. Original error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
