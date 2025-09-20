// 参考: https://nearform.com/open-source/urql/docs/basics/typescript-integration/

import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://localhost:4000",
  documents: ["src/**/*.tsx"],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    "./src/gql/": {
      preset: "client",
      plugins: [],
    },
  },
};

export default config;
