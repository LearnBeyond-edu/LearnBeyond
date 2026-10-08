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

export const institutionService = {
  getAll: async (limit = 10, offset = 0): Promise<InstitutionListResponse> => {
    try {
      const response = await api.get<ApiResponse<Institution[]>>('/institutions', {
        params: { limit, offset },
      });
      return {
        data: response.data.data,
        meta: response.data.meta ?? { total: response.data.data.length, limit, offset },
      };
    } catch {
      return {
        data: defaultInstitutions,
        meta: { total: defaultInstitutions.length, limit, offset },
      };
    }
  },

  getHistory: async (limit = 10, offset = 0): Promise<InstitutionListResponse> => {
    try {
      const response = await api.get<ApiResponse<Institution[]>>('/institutions/history', {
        params: { limit, offset },
      });
      return {
        data: response.data.data,
        meta: response.data.meta ?? { total: response.data.data.length, limit, offset },
      };
    } catch {
      return {
        data: defaultInstitutions,
        meta: { total: defaultInstitutions.length, limit, offset },
      };
    }
  },

  getOne: async (id: string): Promise<Institution> => {
    const response = await api.get<ApiResponse<Institution>>(`/institutions/${id}`);
    return response.data.data;
  },

  create: async (payload: CreateInstitutionPayload): Promise<Institution> => {
    const response = await api.post<ApiResponse<Institution>>('/institutions', payload);
    return response.data.data;
  },

  update: async (id: string, payload: UpdateInstitutionPayload): Promise<Institution> => {
    const response = await api.put<ApiResponse<Institution>>(`/institutions/${id}`, payload);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/institutions/${id}`);
  },
};
