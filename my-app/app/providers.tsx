"use client";

import * as React from "react";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client/core";
import { ApolloProvider } from "@apollo/client/react";
import { HeroUIProvider } from "@heroui/react";

function makeApolloClient() {
  return new ApolloClient({
    link: new HttpLink({
      uri: "https://rickandmortyapi.com/graphql",
    }),
    cache: new InMemoryCache(),
  });
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(() => makeApolloClient());

  return (
    <ApolloProvider client={client}>
      <HeroUIProvider>{children}</HeroUIProvider>
    </ApolloProvider>
  );
}


