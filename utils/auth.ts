import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { User } from './xata';
import { useAuth } from '@clerk/nextjs';

export function useLoggedInUser() {
  const { isSignedIn } = useAuth();

  const { data , refetch, isLoading } = useQuery(
    ["/api/getUser"],
    () =>
      fetch("/api/getUser", {

      }).then((response) => response.json()) as Promise<{ user: User }>,
    { enabled: isSignedIn },
  );

  useEffect(() => {
    if (isSignedIn) refetch()
  }, [isSignedIn, refetch])


  return { user: data?.user, isLoading };
}
