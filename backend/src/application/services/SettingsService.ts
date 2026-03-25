import type { SystemSettings } from "../../domain/entities";
import { InMemoryStore } from "../../repositories/InMemoryStore";

export class SettingsService {
  constructor(private readonly store: InMemoryStore) {}

  getSettings(): SystemSettings {
    return this.store.settings;
  }

  updateSettings(patch: Partial<SystemSettings>): SystemSettings {
    this.store.settings = {
      ...this.store.settings,
      ...patch,
      branding: {
        ...this.store.settings.branding,
        ...(patch.branding ?? {}),
      },
      notifications: {
        ...this.store.settings.notifications,
        ...(patch.notifications ?? {}),
      },
    };

    return this.store.settings;
  }
}
