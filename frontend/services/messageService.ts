import api from './api';

export interface DirectMessage {
  id?: string;
  sender_id: string;
  recipient_id: string;
  sender_name?: string;
  recipient_name?: string;
  student_name?: string;
  text: string;
  channel?: string;
  created_at: string | Date;
}

const SHARED_STORAGE_KEY = 'learnbeyond_shared_direct_messages';

export const messageService = {
  // Fetch messages from backend API with fallback to local storage
  getMessages: async (recipientId?: string): Promise<DirectMessage[]> => {
    let apiMessages: DirectMessage[] = [];
    try {
      const response = await api.get('/messages', {
        params: recipientId ? { recipient_id: recipientId } : {},
      });
      if (response.data?.data) {
        apiMessages = response.data.data;
      }
    } catch {
      // Backend might be offline or sleeping; fallback seamlessly
    }

    // Merge with locally cached shared messages to ensure real-time consistency
    const cached = messageService.getLocalSharedMessages();
    const combinedMap = new Map<string, DirectMessage>();

    // Add API messages
    apiMessages.forEach((m) => {
      const key = `${m.sender_id}_${m.recipient_id}_${new Date(m.created_at).getTime()}_${m.text}`;
      combinedMap.set(key, { ...m, created_at: new Date(m.created_at) });
    });

    // Add cached messages
    cached.forEach((m) => {
      const key = `${m.sender_id}_${m.recipient_id}_${new Date(m.created_at).getTime()}_${m.text}`;
      if (!combinedMap.has(key)) {
        combinedMap.set(key, { ...m, created_at: new Date(m.created_at) });
      }
    });

    const allMessages = Array.from(combinedMap.values()).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Update shared cache
    messageService.setLocalSharedMessages(allMessages);
    return allMessages;
  },

  // Send message to backend and broadcast locally
  sendMessage: async (payload: {
    recipient_id: string;
    recipient_name?: string;
    student_name?: string;
    text: string;
    channel?: string;
    sender_id: string;
    sender_name?: string;
  }): Promise<DirectMessage> => {
    const localMsg: DirectMessage = {
      id: `local_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      sender_id: payload.sender_id,
      recipient_id: payload.recipient_id,
      sender_name: payload.sender_name,
      recipient_name: payload.recipient_name,
      student_name: payload.student_name,
      text: payload.text.trim(),
      channel: payload.channel || 'teacher_parent',
      created_at: new Date(),
    };

    // Save to shared local cache immediately for instantaneous UI updates
    const current = messageService.getLocalSharedMessages();
    const updated = [...current, localMsg];
    messageService.setLocalSharedMessages(updated);

    // Broadcast across windows/tabs
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('learnbeyond_chat_sync', { detail: localMsg }));
      window.dispatchEvent(new Event('storage'));
    }

    // Send to backend database in background
    try {
      const res = await api.post('/messages', {
        recipient_id: payload.recipient_id,
        recipient_name: payload.recipient_name,
        student_name: payload.student_name,
        text: payload.text,
        channel: payload.channel || 'teacher_parent',
      });
      if (res.data?.data) {
        return res.data.data;
      }
    } catch {
      // Backend handled gracefully; localMsg remains active
    }

    return localMsg;
  },

  getLocalSharedMessages: (): DirectMessage[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(SHARED_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return parsed.map((m: any) => ({
        ...m,
        created_at: new Date(m.created_at),
      }));
    } catch {
      return [];
    }
  },

  setLocalSharedMessages: (messages: DirectMessage[]) => {
    if (typeof window === 'undefined') return;
    try {
      // Keep up to 500 recent messages
      const trimmed = messages.slice(-500);
      localStorage.setItem(SHARED_STORAGE_KEY, JSON.stringify(trimmed));
    } catch {}
  },
};
