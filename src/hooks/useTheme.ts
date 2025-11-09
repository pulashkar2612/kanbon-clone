// src/hooks/useTheme.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserTheme, saveUserTheme } from '../firebase/themeStorage';

export function useTheme(uid: string | undefined) {
  const queryClient = useQueryClient();

  // Query for user theme
  const { data: theme = 'light' } = useQuery({
    queryKey: ['theme', uid],
    queryFn: () => (uid ? getUserTheme(uid) : Promise.resolve('light')),
    enabled: !!uid,
  });

  // Mutation for updating theme
  const themeMutation = useMutation({
    mutationFn: async (newTheme: 'light' | 'dark') => {
      if (uid) {
        await saveUserTheme(uid, newTheme);
        return newTheme;
      }
    },
    onSuccess: (newTheme) => {
      queryClient.setQueryData(['theme', uid], newTheme);
    },
  });

  return {
    theme,
    setTheme: themeMutation.mutate,
    isLoading: themeMutation.isPending,
  };
}
