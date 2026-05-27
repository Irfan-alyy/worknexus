import { QueryClient } from "@tanstack/react-query"

const FIVE_MINUTES = 1000 * 60 * 5
const THIRTY_MINUTES = 1000 * 60 * 30

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: FIVE_MINUTES,
      gcTime: THIRTY_MINUTES,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
})

export default queryClient
