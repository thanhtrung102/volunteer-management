// ============= src/services/notification.service.js =============
class NotificationService {
  constructor() {
    this.permission = Notification.permission;
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }

    return false;
  }

  show(title, options = {}) {
    if (this.permission === 'granted') {
      new Notification(title, {
        icon: '/icon.png',
        badge: '/badge.png',
        ...options,
      });
    }
  }

  async subscribeToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
      });

      return subscription;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      return null;
    }
  }
}

export default new NotificationService();
