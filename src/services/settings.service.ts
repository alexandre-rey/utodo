import { apiClient } from '@/lib/api-client';
import { loadFromStorage, saveToStorage } from '@/services/save';
import { subscriptionService } from '@/services/subscription.service';
import { type UserSettings, type UpdateSettingsDto, type CustomStatus, type ApiError } from '@/types/api';

const DEFAULT_SETTINGS: UserSettings = {
  id: 'local-settings',
  userId: 'local-user',
  customStatuses: [
    { id: 'pending', name: 'Pending', color: '#6b7280', order: 0 },
    { id: 'inProgress', name: 'In Progress', color: '#3b82f6', order: 1 },
    { id: 'done', name: 'Done', color: '#10b981', order: 2 },
  ],
  defaultView: 'kanban',
  showCompletedTodos: false,
  enableNotifications: true,
};

class SettingsService {
  private readonly STORAGE_KEY = 'userSettings';
  private readonly SYNC_FLAG_KEY = 'settings_synced';
  private hasSynced = false;

  public async getSettings(): Promise<UserSettings> {
    if (!apiClient.isAuthenticated()) {
      return this.getLocalSettings();
    }

    try {
      return await apiClient.get<UserSettings>('/settings');
    } catch (error) {
      console.error('Failed to get settings from server:', error);
      return this.getLocalSettings();
    }
  }

  public async updateSettings(data: UpdateSettingsDto): Promise<UserSettings> {
    if (!apiClient.isAuthenticated()) {
      return this.updateLocalSettings(data);
    }

    // Check status limits if we're adding custom statuses
    if (data.customStatuses) {
      await this.validateStatusLimits(data.customStatuses);
    }

    try {
      const updatedSettings = await apiClient.patch<UserSettings>('/settings', data);
      // Don't save to localStorage when authenticated - keep them separate
      return updatedSettings;
    } catch (error: unknown) {
      console.error('Failed to update settings on server:', error);
      
      // Don't fall back to local storage for permission errors
      if (typeof error === 'object' && error !== null && 'statusCode' in error && (error as ApiError).statusCode === 403) {
        throw new Error('You do not have permission to modify settings');
      }
      
      return this.updateLocalSettings(data);
    }
  }

  public async resetToDefaults(): Promise<UserSettings> {
    if (!apiClient.isAuthenticated()) {
      return this.resetLocalSettings();
    }

    try {
      const resetSettings = await apiClient.post<UserSettings>('/settings/reset');
      // Don't save to localStorage when authenticated - keep them separate
      return resetSettings;
    } catch (error: unknown) {
      console.error('Failed to reset settings on server:', error);
      
      // Don't fall back to local storage for permission errors
      if (typeof error === 'object' && error !== null && 'statusCode' in error && (error as ApiError).statusCode === 403) {
        throw new Error('You do not have permission to reset settings');
      }
      
      return this.resetLocalSettings();
    }
  }

  private getLocalSettings(): UserSettings {
    const settings = loadFromStorage<UserSettings>(this.STORAGE_KEY);
    return settings || DEFAULT_SETTINGS;
  }

  private updateLocalSettings(data: UpdateSettingsDto): UserSettings {
    const currentSettings = this.getLocalSettings();
    const updatedSettings = {
      ...currentSettings,
      ...data,
    };
    
    this.saveLocalSettings(updatedSettings);
    return updatedSettings;
  }

  private resetLocalSettings(): UserSettings {
    this.saveLocalSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }

  private saveLocalSettings(settings: UserSettings): void {
    saveToStorage(this.STORAGE_KEY, settings);
  }

  public async syncLocalSettingsToServer(): Promise<void> {
    if (!apiClient.isAuthenticated()) {
      return;
    }

    // Check if we've already synced this session
    if (this.hasSynced) {
      return;
    }

    // Check if sync was already completed in a previous session
    const syncFlag = localStorage.getItem(this.SYNC_FLAG_KEY);
    if (syncFlag === 'true') {
      this.hasSynced = true;
      return;
    }

    const localSettings = this.getLocalSettings();
    
    try {
      console.log('Syncing local settings to server...');
      
      await this.updateSettings({
        customStatuses: localSettings.customStatuses,
        defaultView: localSettings.defaultView,
        showCompletedTodos: localSettings.showCompletedTodos,
        enableNotifications: localSettings.enableNotifications,
      });

      this.markAsSynced();
      console.log('Successfully synced local settings to server');
    } catch (error) {
      console.error('Failed to sync local settings to server:', error);
    }
  }

  private markAsSynced(): void {
    this.hasSynced = true;
    localStorage.setItem(this.SYNC_FLAG_KEY, 'true');
  }

  public resetSyncFlag(): void {
    this.hasSynced = false;
    localStorage.removeItem(this.SYNC_FLAG_KEY);
  }

  public getDefaultStatuses(): CustomStatus[] {
    return DEFAULT_SETTINGS.customStatuses || [];
  }

  private async validateStatusLimits(customStatuses: CustomStatus[]): Promise<void> {
    if (!apiClient.isAuthenticated()) {
      return; // Skip validation for local users
    }

    try {
      const statusLimits = await subscriptionService.getStatusLimits();
      const currentSettings = await this.getSettings();
      const currentStatusCount = currentSettings.customStatuses?.length || 0;
      const newStatusCount = customStatuses.length;

      // Check if we're adding more statuses than allowed
      if (newStatusCount > currentStatusCount && newStatusCount > statusLimits.limit) {
        throw new Error(`Status limit exceeded. You can create up to ${statusLimits.limit} custom statuses. Upgrade to premium for unlimited statuses.`);
      }

      // Check if we're already at the limit and trying to add more
      if (newStatusCount > statusLimits.limit) {
        throw new Error(`Status limit exceeded. You can create up to ${statusLimits.limit} custom statuses. Upgrade to premium for unlimited statuses.`);
      }
    } catch (error) {
      // Re-throw limit errors, but don't block on API failures
      if (error instanceof Error && error.message.includes('Status limit exceeded')) {
        throw error;
      }
      console.warn('Could not validate status limits:', error);
    }
  }

  public async getStatusLimits() {
    return await subscriptionService.getStatusLimits();
  }
}

export const settingsService = new SettingsService();