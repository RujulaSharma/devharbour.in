/**
 * Dev Harbour — Real-Time Event & Notification Bus
 * Powers Server-Sent Events (SSE), live activity ticker, and notifications.
 */

const { EventEmitter } = require('node:events');

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.clients = new Set();
    this.recentActivity = [];
    this.maxHistory = 30;

    // Heartbeat every 20s to keep HTTP connections alive (unref'd so it doesn't block shutdown)
    const pingTimer = setInterval(() => {
      this.ping();
    }, 20000);
    if (pingTimer.unref) pingTimer.unref();
  }

  addClient(res) {
    this.clients.add(res);
    res.on('close', () => {
      this.clients.delete(res);
    });
  }

  broadcast(event) {
    const payload = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString()
    };

    // Store in recent activity
    this.recentActivity.unshift(payload);
    if (this.recentActivity.length > this.maxHistory) {
      this.recentActivity.pop();
    }

    const data = `data: ${JSON.stringify(payload)}\n\n`;
    for (const client of this.clients) {
      try {
        client.write(data);
      } catch (e) {
        this.clients.delete(client);
      }
    }
  }

  ping() {
    for (const client of this.clients) {
      try {
        client.write(':ping\n\n');
      } catch (e) {
        this.clients.delete(client);
      }
    }
  }

  getRecent() {
    return this.recentActivity;
  }
}

const eventBus = new EventBus();
module.exports = eventBus;
