
'use server';
/**
 * @fileOverview Helper functions for interacting with GCP Secret Manager.
 *
 * - getGoogleApiKey - Fetches the Google API Key from Secret Manager.
 *   This function relies on the GCP_PROJECT_ID, GOOGLE_API_KEY_SECRET_ID,
 *   and GOOGLE_API_KEY_SECRET_VERSION environment variables.
 */
import {SecretManagerServiceClient} from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

/**
 * Fetches the Google API Key from GCP Secret Manager.
 *
 * Relies on the following environment variables:
 * - GCP_PROJECT_ID: Your Google Cloud Project ID (Required).
 * - GOOGLE_API_KEY_SECRET_ID: The ID of the secret in Secret Manager containing the API key (Defaults to 'GOOGLE_API_KEY').
 * - GOOGLE_API_KEY_SECRET_VERSION: The version of the secret (Defaults to 'latest').
 *
 * Ensure the service account running this code has the "Secret Manager Secret Accessor" IAM role
 * for the specified secret.
 */
export async function getGoogleApiKey(): Promise<string> {
  const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
  const GOOGLE_API_KEY_SECRET_ID = process.env.GOOGLE_API_KEY_SECRET_ID || 'GOOGLE_API_KEY';
  const SECRET_VERSION = process.env.GOOGLE_API_KEY_SECRET_VERSION || 'latest';

  if (!GCP_PROJECT_ID) {
    const errorMessage = 'GCP_PROJECT_ID environment variable is not set. This is required to fetch secrets from Secret Manager.';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Log info about which secret ID and version are being used if they are defaults
  if (GOOGLE_API_KEY_SECRET_ID === 'GOOGLE_API_KEY' && !process.env.GOOGLE_API_KEY_SECRET_ID) {
    console.info(
      "Using default secret ID 'GOOGLE_API_KEY' for the API key. " +
      "Set the GOOGLE_API_KEY_SECRET_ID environment variable to use a different secret ID."
    );
  }
  if (SECRET_VERSION === 'latest' && !process.env.GOOGLE_API_KEY_SECRET_VERSION) {
    console.info(
      "Using default secret version 'latest' for the API key. " +
      "Set the GOOGLE_API_KEY_SECRET_VERSION environment variable to use a different version."
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
      `Could not fetch Google API Key from Secret Manager (secret: ${secretName}). Ensure the secret exists, the GCP_PROJECT_ID is correct, and the service account has the 'Secret Manager Secret Accessor' role. Original error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
