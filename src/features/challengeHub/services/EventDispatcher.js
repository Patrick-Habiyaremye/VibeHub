// services/EventDispatcher.js

// export class EventDispatcher {
//   constructor() {
//     this.listeners = new Map();
//   }

//   subscribe(event, handler) {
//     if (!this.listeners.has(event)) {
//       this.listeners.set(event, []);
//     }

//     this.listeners.get(event).push(handler);
//   }

//   async publish(event, payload) {
//     const handlers = this.listeners.get(event) || [];

//     await Promise.allSettled(
//       handlers.map(async (handler) => {
//         try {
//           await handler(payload);
//         } catch (err) {
//           console.error(`[Event Error] ${event}`, err);
//         }
//       })
//     );
//   }
// }


export class EventDispatcher {
  constructor() {
    this.handlers = {};
  }

  subscribe(eventType, handler) {
    if (!this.handlers[eventType]) {
      this.handlers[eventType] = [];
    }

    this.handlers[eventType].push(handler);
  }

  async publish(eventType, payload) {
    const handlers = this.handlers[eventType] || [];

    for (const handler of handlers) {
      await handler(payload);
    }
  }
}