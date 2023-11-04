import { QueryClient } from 'react-query';

export const reactQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // defaults to true, but best to make it opt-in per query
    },
  },
});
