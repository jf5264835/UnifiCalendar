export interface NotificationService {
  notifyFailure(subject: string, details: string): Promise<void>;
}

export class NoopNotificationService implements NotificationService {
  async notifyFailure(_subject: string, _details: string): Promise<void> {
    // Intentionally no-op for scaffolding phase.
  }
}
