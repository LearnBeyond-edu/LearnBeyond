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

export const institutionService = {
  getAll: async (limit = 10, offset = 0): Promise<InstitutionListResponse> => {
    const response = await api.get<ApiResponse<Institution[]>>('/institutions', {
      params: { limit, offset },
    });
    return {
      data: response.data.data,
      meta: response.data.meta ?? { total: response.data.data.length, limit, offset },
    };
  },

  getHistory: async (limit = 10, offset = 0): Promise<InstitutionListResponse> => {
    const response = await api.get<ApiResponse<Institution[]>>('/institutions/history', {
      params: { limit, offset },
    });
    return {
      data: response.data.data,
      meta: response.data.meta ?? { total: response.data.data.length, limit, offset },
    };
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
