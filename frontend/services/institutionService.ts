import api from './api';
import type {
  ApiResponse,
  Institution,
  CreateInstitutionPayload,
  UpdateInstitutionPayload,
  PaginationMeta,
} from '@/types/platform';

export interface InstitutionListResponse {
  data: Institution[];
  meta: PaginationMeta;
}

const INSTITUTIONS_STORAGE_KEY = 'learnbeyond_institutions_store';

const defaultInstitutions: Institution[] = [
  {
    id: "8dffb045-b42c-484d-aa27-b13a93f9790b",
    name: "LearnBeyond Academy",
    email: "admin@learnbeyond.edu",
    phone: "555-0100",
    address: "123 Education Lane",
    subscription_plan: "Enterprise",
    subscription_status: "Active",
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

function getStoredInstitutions(): Institution[] {
  if (typeof window === 'undefined') return [...defaultInstitutions];
  try {
    const raw = localStorage.getItem(INSTITUTIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(INSTITUTIONS_STORAGE_KEY, JSON.stringify(defaultInstitutions));
      return [...defaultInstitutions];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...defaultInstitutions];
  } catch {
    return [...defaultInstitutions];
  }
}

function saveStoredInstitutions(list: Institution[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(INSTITUTIONS_STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export const institutionService = {
  getAll: async (limit = 10, offset = 0): Promise<InstitutionListResponse> => {
    let list = getStoredInstitutions();
    try {
      const response = await api.get<ApiResponse<Institution[]>>('/institutions', {
        params: { limit, offset },
      });
      if (response.data && Array.isArray(response.data.data)) {
        const backendList = response.data.data;
        // Merge backend and local list
        const merged = [...backendList];
        list.forEach((item) => {
          if (!merged.some((m) => m.id === item.id) && !item.deleted_at) {
            merged.push(item);
          }
        });
        // Filter out any locally deleted items
        const active = merged.filter((item) => !item.deleted_at);
        saveStoredInstitutions(merged);
        return {
          data: active.slice(offset, offset + limit),
          meta: response.data.meta ?? { total: active.length, limit, offset },
        };
      }
    } catch {}

    const activeOnly = list.filter((item) => !item.deleted_at);
    return {
      data: activeOnly.slice(offset, offset + limit),
      meta: { total: activeOnly.length, limit, offset },
    };
  },

  getHistory: async (limit = 10, offset = 0): Promise<InstitutionListResponse> => {
    let list = getStoredInstitutions();
    try {
      const response = await api.get<ApiResponse<Institution[]>>('/institutions/history', {
        params: { limit, offset },
      });
      if (response.data && Array.isArray(response.data.data)) {
        const backendList = response.data.data;
        const merged = [...backendList];
        list.forEach((item) => {
          if (!merged.some((m) => m.id === item.id)) {
            merged.push(item);
          }
        });
        saveStoredInstitutions(merged);
        return {
          data: merged.slice(offset, offset + limit),
          meta: response.data.meta ?? { total: merged.length, limit, offset },
        };
      }
    } catch {}

    return {
      data: list.slice(offset, offset + limit),
      meta: { total: list.length, limit, offset },
    };
  },

  getOne: async (id: string): Promise<Institution> => {
    try {
      const response = await api.get<ApiResponse<Institution>>(`/institutions/${id}`);
      if (response.data?.data) return response.data.data;
    } catch {}

    const list = getStoredInstitutions();
    const found = list.find((item) => item.id === id);
    if (found) return found;
    throw new Error('Institution not found');
  },

  create: async (payload: CreateInstitutionPayload): Promise<Institution> => {
    let created: Institution | null = null;
    try {
      const response = await api.post<ApiResponse<Institution>>('/institutions', payload);
      if (response.data?.data) {
        created = response.data.data;
      }
    } catch (err) {
      console.warn('Backend create institution failed, using persistent fallback:', err);
    }

    if (!created) {
      created = {
        id: "inst-" + Date.now(),
        name: payload.name,
        email: payload.contact_email || "",
        phone: payload.contact_phone || "",
        address: payload.address || "",
        subscription_plan: payload.subscription_plan || "Starter",
        subscription_status: payload.subscription_status || "Active",
        deleted_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const list = getStoredInstitutions();
    // Prepend to ensure it appears at the top
    const updated = [created, ...list.filter((item) => item.id !== created!.id)];
    saveStoredInstitutions(updated);
    return created;
  },

  update: async (id: string, payload: UpdateInstitutionPayload): Promise<Institution> => {
    let updatedItem: Institution | null = null;
    try {
      const response = await api.put<ApiResponse<Institution>>(`/institutions/${id}`, payload);
      if (response.data?.data) {
        updatedItem = response.data.data;
      }
    } catch {}

    const list = getStoredInstitutions();
    const existing = list.find((item) => item.id === id);
    const result: Institution = updatedItem || {
      ...(existing || defaultInstitutions[0]),
      ...payload,
      id,
      email: payload.contact_email || existing?.email || "",
      phone: payload.contact_phone || existing?.phone || "",
      updated_at: new Date().toISOString(),
    };

    const updated = list.map((item) => (item.id === id ? result : item));
    saveStoredInstitutions(updated);
    return result;
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/institutions/${id}`);
    } catch (err) {
      console.warn('Backend delete institution failed, updating local state:', err);
    }

    const list = getStoredInstitutions();
    const updated = list.map((item) =>
      item.id === id
        ? { ...item, deleted_at: new Date().toISOString(), subscription_status: 'Inactive' }
        : item
    );
    saveStoredInstitutions(updated);
  },
};
