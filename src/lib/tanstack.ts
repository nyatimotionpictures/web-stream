import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      /**
       * Retry a failed request unless the server said the thing does not
       * exist. Retrying a 404 just holds the loading spinner for about seven
       * seconds before the not found screen can appear, and a mistyped or
       * retired slug will never resolve on a second attempt. Network failures
       * and 5xx still get the usual three attempts.
       */
      retry: (failureCount, error: any) => {
        const status = error?.status;

        if (typeof status === "number" && status >= 400 && status < 500) {
          return false;
        }

        return failureCount < 3;
      },
    },
  },
});