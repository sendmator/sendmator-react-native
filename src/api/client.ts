/**
 * API Client for Sendmator Contact Preferences
 */

import type {
  ContactData,
  ContactPreferences,
  PreferenceUpdate,
} from '../types';

export class SendmatorApiClient {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    // Remove trailing slash and ensure /api prefix
    const cleanUrl = apiUrl.replace(/\/$/, '');
    this.apiUrl = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
    this.apiKey = apiKey;
  }

  /**
   * Get contact data with preferences by external_id
   */
  async getContact(externalId: string): Promise<ContactData> {
    const response = await fetch(
      `${this.apiUrl}/v1/contacts/external/${externalId}`,
      {
        method: 'GET',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch contact' }));
      throw new Error(error.message || 'Failed to fetch contact');
    }

    return response.json();
  }

  /**
   * Get contact preferences
   */
  async getPreferences(contactId: string): Promise<ContactPreferences> {
    const response = await fetch(
      `${this.apiUrl}/v1/contacts/${contactId}/preferences`,
      {
        method: 'GET',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch preferences' }));
      throw new Error(error.message || 'Failed to fetch preferences');
    }

    const data = await response.json();
    return data.preferences;
  }

  /**
   * Update contact preferences (batch)
   */
  async updatePreferences(
    contactId: string,
    preferences: PreferenceUpdate[]
  ): Promise<ContactPreferences> {
    const response = await fetch(
      `${this.apiUrl}/v1/contacts/${contactId}/preferences`,
      {
        method: 'PATCH',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      }
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Update failed' }));
      throw new Error(error.message || 'Failed to update preferences');
    }

    const contact = await response.json();
    return contact.preferences;
  }

  /**
   * Update single preference
   */
  async updateSinglePreference(
    contactId: string,
    channel: string,
    category: string,
    subscribed: boolean
  ): Promise<void> {
    const response = await fetch(
      `${this.apiUrl}/v1/contacts/${contactId}/preferences/${channel}/${category}`,
      {
        method: 'PATCH',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscribed }),
      }
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Update failed' }));
      throw new Error(error.message || 'Failed to update preference');
    }
  }

  /**
   * Unsubscribe from all preferences
   */
  async unsubscribeAll(contactId: string): Promise<void> {
    const response = await fetch(
      `${this.apiUrl}/v1/contacts/${contactId}/preferences`,
      {
        method: 'DELETE',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Unsubscribe failed' }));
      throw new Error(error.message || 'Failed to unsubscribe');
    }
  }

  /**
   * Unsubscribe from specific channel
   */
  async unsubscribeChannel(contactId: string, channel: string): Promise<void> {
    const response = await fetch(
      `${this.apiUrl}/v1/contacts/${contactId}/preferences/${channel}`,
      {
        method: 'DELETE',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Unsubscribe failed' }));
      throw new Error(error.message || 'Failed to unsubscribe from channel');
    }
  }

  /**
   * Subscribe to all preferences
   */
  async subscribeAll(contactId: string): Promise<void> {
    const response = await fetch(
      `${this.apiUrl}/v1/contacts/${contactId}/preferences/subscribe-all`,
      {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Subscribe failed' }));
      throw new Error(error.message || 'Failed to subscribe');
    }
  }

  /**
   * Update device token for push notifications
   *
   * Smart upsert logic:
   * - Uses token as unique key
   * - Updates existing token metadata if token exists
   * - Adds new token if token doesn't exist
   * - Auto-cleanup of stale tokens (> 90 days)
   * - Supports multiple devices per contact
   */
  async updateDeviceToken(
    externalId: string,
    data: {
      token: string;
      platform: 'android' | 'ios' | 'web';
      app_version?: string;
      os_version?: string;
      device_model?: string;
    }
  ): Promise<void> {
    const response = await fetch(
      `${this.apiUrl}/v1/contacts/external/${externalId}/device-token`,
      {
        method: 'PATCH',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Failed to update device token' }));
      throw new Error(error.message || 'Failed to update device token');
    }
  }
}
