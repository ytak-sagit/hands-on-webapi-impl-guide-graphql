import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Client, cacheExchange, fetchExchange, Provider } from "urql";
import App from "./App.tsx";

const client = new Client({
  url: "http://localhost:4000",
  exchanges: [cacheExchange, fetchExchange],
  // NOTE: 以下のエラー回避のためにヘッダーをセットしている
  // [GraphQL] This operation has been blocked as a potential Cross-Site Request Forgery (CSRF).
  fetchOptions: () => {
    return {
      headers: {
        "x-apollo-operation-name": "apollo-require-preflight",
      },
    };
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider value={client}>
      <App />
    </Provider>
  </StrictMode>,
);
