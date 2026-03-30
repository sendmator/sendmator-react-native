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
    this.apiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
  }

  /**
   * Get contact data with preferences by external_id
   */
  async getContact(externalId: string): Promise<ContactData> {
    const response = await fetch(`${this.apiUrl}/v1/contacts/external/${externalId}`, {
      method: 'GET',
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch contact' }));
      throw new Error(error.message || 'Failed to fetch contact');
    }

    return response.json();
  }

  /**
   * Get contact preferences
   */
  async getPreferences(contactId: string): Promise<ContactPreferences> {
    const response = await fetch(`${this.apiUrl}/v1/contacts/${contactId}/preferences`, {
      method: 'GET',
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch preferences' }));
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
    const response = await fetch(`${this.apiUrl}/v1/contacts/${contactId}/preferences`, {
      method: 'PATCH',
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ preferences }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Update failed' }));
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
      const error = await response.json().catch(() => ({ message: 'Update failed' }));
      throw new Error(error.message || 'Failed to update preference');
    }
  }

  /**
   * Unsubscribe from all preferences
   */
  async unsubscribeAll(contactId: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/v1/contacts/${contactId}/preferences`, {
      method: 'DELETE',
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unsubscribe failed' }));
      throw new Error(error.message || 'Failed to unsubscribe');
    }
  }

  /**
   * Unsubscribe from specific channel
   */
  async unsubscribeChannel(contactId: string, channel: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/v1/contacts/${contactId}/preferences/${channel}`, {
      method: 'DELETE',
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unsubscribe failed' }));
      throw new Error(error.message || 'Failed to unsubscribe from channel');
    }
  }

  /**
   * Subscribe to all preferences
   */
  async subscribeAll(contactId: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/v1/contacts/${contactId}/preferences/subscribe-all`, {
      method: 'POST',
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Subscribe failed' }));
      throw new Error(error.message || 'Failed to subscribe');
    }
  }
}
