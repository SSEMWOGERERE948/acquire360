import { createContext, useContext, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCurrentUser, useLogin, useLogout } from '@workspace/api-client-react';
import type { AuthUser } from '@workspace/api-client-react';

interface AuthContextValue {
  user: AuthUser | undefined;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const me = useGetCurrentUser({ query: { queryKey: ['/api/auth/me'], retry: false } });
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const value: AuthContextValue = {
    user: me.data,
    isLoading: me.isLoading,
    login: async (email, password) => {
      const user = await loginMutation.mutateAsync({ data: { email, password } });
      queryClient.setQueryData(me.queryKey, user);
      return user;
    },
    logout: async () => {
      await logoutMutation.mutateAsync();
      queryClient.setQueryData(me.queryKey, undefined);
      await queryClient.invalidateQueries();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
