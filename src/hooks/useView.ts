// src/hooks/useView.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserView, saveUserView } from '../firebase/viewStorage';

export function useView(uid: string | undefined) {
  const queryClient = useQueryClient();

  // Query for user view preference
  const { data: view = 'list' } = useQuery({
    queryKey: ['view', uid],
    queryFn: () => (uid ? getUserView(uid) : Promise.resolve('list')),
    enabled: !!uid,
  });

  // Mutation for updating view
  const viewMutation = useMutation({
    mutationFn: async (newView: 'list' | 'grid') => {
      if (uid) {
        await saveUserView(uid, newView);
        return newView;
      }
    },
    onSuccess: (newView) => {
      queryClient.setQueryData(['view', uid], newView);
    },
  });

  const toggleView = () => {
    viewMutation.mutate(view === 'list' ? 'grid' : 'list');
  };

  return {
    view,
    setView: viewMutation.mutate,
    toggleView,
    isLoading: viewMutation.isPending,
  };
}
