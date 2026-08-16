import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { institutionService } from '@/services/institutionService';
import type { CreateInstitutionPayload, UpdateInstitutionPayload } from '@/types/platform';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const INSTITUTION_KEYS = {
  all: ['institutions'] as const,
  list: (limit: number, offset: number) => ['institutions', 'list', limit, offset] as const,
  history: (limit: number, offset: number) => ['institutions', 'history', limit, offset] as const,
  detail: (id: string) => ['institutions', 'detail', id] as const,
};

// ─── List ─────────────────────────────────────────────────────────────────────
export function useInstitutions(limit: number, offset: number) {
  return useQuery({
    queryKey: INSTITUTION_KEYS.list(limit, offset),
    queryFn: () => institutionService.getAll(limit, offset),
    staleTime: 30_000,
  });
}

export function useInstitutionHistory(limit: number, offset: number) {
  return useQuery({
    queryKey: INSTITUTION_KEYS.history(limit, offset),
    queryFn: () => institutionService.getHistory(limit, offset),
    staleTime: 30_000,
  });
}

// ─── Single ───────────────────────────────────────────────────────────────────
export function useInstitution(id: string) {
  return useQuery({
    queryKey: INSTITUTION_KEYS.detail(id),
    queryFn: () => institutionService.getOne(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────
export function useCreateInstitution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateInstitutionPayload) => institutionService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSTITUTION_KEYS.all });
      toast.success('Institution created successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to create institution');
    },
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────
export function useUpdateInstitution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateInstitutionPayload }) =>
      institutionService.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: INSTITUTION_KEYS.all });
      queryClient.setQueryData(INSTITUTION_KEYS.detail(data.id), data);
      toast.success('Institution updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to update institution');
    },
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────
export function useDeleteInstitution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => institutionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSTITUTION_KEYS.all });
      toast.success('Institution deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to delete institution');
    },
  });
}
