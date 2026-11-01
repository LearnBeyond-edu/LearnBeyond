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
      if (response.data?.data && Array.isArray(response.data.data)) {
        apiMessages = response.data.data.map((m: any) => ({
          ...m,
          created_at: new Date(m.created_at),
        }));
      }
    } catch {
      // Backend might be offline or sleeping; fallback seamlessly
    }

    // Cached messages from local storage
    const cached = messageService.getLocalSharedMessages();

    // Start with API messages
    const mergedList: DirectMessage[] = [...apiMessages];

    // For any cached messages not yet present in API (e.g. offline/pending), append them
    cached.forEach((c) => {
      const cTime = new Date(c.created_at).getTime();
      const cText = (c.text || '').trim().toLowerCase();
      const alreadyInApi = apiMessages.some((a) => {
        if (c.id && a.id && c.id === a.id) return true;
        const aTime = new Date(a.created_at).getTime();
        const aText = (a.text || '').trim().toLowerCase();
        const sameParticipants =
          (a.sender_id === c.sender_id && a.recipient_id === c.recipient_id) ||
          (a.sender_id === c.recipient_id && a.recipient_id === c.sender_id);
        const closeTime = Math.abs(aTime - cTime) < 60_000; // Within 60 seconds
        return sameParticipants && aText === cText && closeTime;
      });

      if (!alreadyInApi) {
        mergedList.push({
          ...c,
          created_at: new Date(c.created_at),
        });
      }
    });

    // Sort by timestamp
    mergedList.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Final deduplication pass (remove any identical messages within 3 seconds)
    const deduplicated: DirectMessage[] = [];
    for (const msg of mergedList) {
      const msgTime = new Date(msg.created_at).getTime();
      const msgText = (msg.text || '').trim().toLowerCase();
      const isDuplicate = deduplicated.some((d) => {
        if (msg.id && d.id && msg.id === d.id) return true;
        const dTime = new Date(d.created_at).getTime();
        const dText = (d.text || '').trim().toLowerCase();
        return (
          msg.sender_id === d.sender_id &&
          msg.recipient_id === d.recipient_id &&
          msgText === dText &&
          Math.abs(msgTime - dTime) < 3_000
        );
      });

      if (!isDuplicate) {
        deduplicated.push(msg);
      }
    }

    // Save cleaned, deduplicated list to shared cache
    messageService.setLocalSharedMessages(deduplicated);
    return deduplicated;
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
    const localId = `local_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const localMsg: DirectMessage = {
      id: localId,
      sender_id: payload.sender_id,
      recipient_id: payload.recipient_id,
      sender_name: payload.sender_name,
      recipient_name: payload.recipient_name,
      student_name: payload.student_name,
      text: payload.text.trim(),
      channel: payload.channel || 'teacher_parent',
      created_at: new Date(),
    };

    // Save to shared local cache immediately
    const current = messageService.getLocalSharedMessages();
    messageService.setLocalSharedMessages([...current, localMsg]);

    // Send to backend database in background
    try {
      const res = await api.post('/messages', {
        recipient_id: payload.recipient_id,
        recipient_name: payload.recipient_name,
        student_name: payload.student_name,
        sender_name: payload.sender_name,
        text: payload.text.trim(),
        channel: payload.channel || 'teacher_parent',
      });
      if (res.data?.data) {
        const savedMsg: DirectMessage = {
          ...res.data.data,
          created_at: new Date(res.data.data.created_at),
        };
        // Replace localMsg with the persisted DB message
        const refreshed = messageService.getLocalSharedMessages().map((m) =>
          m.id === localId ? savedMsg : m
        );
        messageService.setLocalSharedMessages(refreshed);

        // Broadcast sync event with saved message
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('learnbeyond_chat_sync', { detail: savedMsg }));
        }
        return savedMsg;
      }
    } catch {
      // Backend error or offline; localMsg remains active
    }

    // Broadcast across windows/tabs
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('learnbeyond_chat_sync', { detail: localMsg }));
    }

    return localMsg;
  },

  getLocalSharedMessages: (): DirectMessage[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(SHARED_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
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
      // Keep up to 300 recent messages
      const trimmed = messages.slice(-300);
      localStorage.setItem(SHARED_STORAGE_KEY, JSON.stringify(trimmed));
    } catch {}
  },
};
