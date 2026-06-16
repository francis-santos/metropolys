import { io } from 'socket.io-client';

const API_URL = 'http://localhost:3008';

class MockSupabaseClient {
  constructor() {
    this.socket = null;
    this.channelCallbacks = [];
  }

  channel(name) {
    const self = this;
    
    // Create socket if not already open
    if (!this.socket) {
      this.socket = io(API_URL);
      
      this.socket.on('connect', () => {
        console.log('Connected to mock Supabase Realtime WebSocket gateway');
      });
      
      this.socket.on('postgres_changes', (payload) => {
        // payload: { table, event, record }
        console.log('Received real-time update:', payload);
        self.channelCallbacks.forEach(cb => {
          if (cb.table === payload.table) {
            // Translate into Supabase realtime payload format
            cb.callback({
              eventType: payload.event,
              new: payload.record,
              old: payload.event === 'DELETE' ? payload.record : {},
            });
          }
        });
      });

      this.socket.on('player_moved', (payload) => {
        console.log('Realtime player_moved:', payload);
        window.dispatchEvent(new CustomEvent('phaser-roll-dice', { detail: payload }));
      });

      this.socket.on('turn_changed', (payload) => {
        console.log('Realtime turn_changed:', payload);
        window.dispatchEvent(new CustomEvent('supabase-turn-changed', { detail: payload }));
      });

      this.socket.on('bot_thinking', (payload) => {
        console.log('Realtime bot_thinking:', payload);
        window.dispatchEvent(new CustomEvent('supabase-bot-thinking', { detail: payload }));
      });
    }

    return {
      on(eventType, filterConfig, callback) {
        // filterConfig e.g. { event: '*', schema: 'public', table: 'players', filter: 'room_id=eq.uuid' }
        const table = filterConfig.table;
        const filterStr = filterConfig.filter;
        let roomId = null;
        if (filterStr && filterStr.includes('eq.')) {
          roomId = filterStr.split('eq.')[1];
        }

        self.channelCallbacks.push({
          table,
          roomId,
          callback,
        });
        return this;
      },
      subscribe(onSubscribeCallback) {
        // Join the Socket.io room for the active match
        const activeCallback = self.channelCallbacks.find(c => c.roomId);
        const roomId = activeCallback ? activeCallback.roomId : null;

        if (roomId && self.socket) {
          self.socket.emit('subscribe_room', { roomCode: roomId, playerId: 'client-guest' });
        }
        
        if (onSubscribeCallback) onSubscribeCallback('SUBSCRIBED');
        return this;
      },
      unsubscribe() {
        const activeCallback = self.channelCallbacks.find(c => c.roomId);
        const roomId = activeCallback ? activeCallback.roomId : null;
        if (roomId && self.socket) {
          self.socket.emit('unsubscribe_room', { roomCode: roomId });
        }
        self.channelCallbacks = self.channelCallbacks.filter(c => c.roomId !== roomId);
        return this;
      },
    };
  }

  from(table) {
    let filters = [];
    let isSingle = false;

    return {
      select(query = '*') {
        return this;
      },
      eq(column, value) {
        filters.push({ column, value });
        return this;
      },
      single() {
        isSingle = true;
        return this;
      },
      order(column, options = {}) {
        return this;
      },
      // Thenable implementation maps to HTTP GET REST request
      async then(onfulfilled) {
        try {
          const queryParams = new URLSearchParams();
          filters.forEach(f => {
            queryParams.append(f.column, String(f.value));
          });
          
          const url = `${API_URL}/api/db/${table}?${queryParams.toString()}`;
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`DB select failed for ${table}: ${response.statusText}`);
          }
          let data = await response.json();
          if (isSingle) {
            data = data.length > 0 ? data[0] : null;
          }
          onfulfilled({ data, error: null });
        } catch (err) {
          console.error(`Error in mock Supabase select for ${table}:`, err);
          onfulfilled({ data: null, error: err });
        }
      },
    };
  }
}

export const supabase = new MockSupabaseClient();
