"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// dumb shit so i dont have to make every page client rendered
export default function QueryClientProviderWrapper({
  children,
}: {
  children: React.JSX.Element[] | React.JSX.Element;
}) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
