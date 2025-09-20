import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadSchemaSync } from "@graphql-tools/load";
import { addResolversToSchema } from "@graphql-tools/schema";
import { db } from "./database.js";

const schema = loadSchemaSync("schema.graphql", {
  loaders: [new GraphQLFileLoader()],
});

const resolvers = {
  Query: {
    authors: () =>
      Object.entries(db.users).map(([id, user]) => ({ id, ...user })),
  },
  Author: {
    // NOTE:
    // 親のオブジェクト（parent）がそれぞれの型のフィールドと同名のプロパティを持っているとき、
    // default resolver の仕組みによって parent が自動展開される。
    // そのため、以下は書かなくても動作する。
    // name: (parent) => { return parent.name },
    posts: ({ id }) =>
      Object.entries(db.blogs)
        .filter(([_, post]) => post.author === id)
        .map(([id, post]) => ({ id, ...post })),
  },
  Post: {
    tags: ({ tags }) => tags.map((name) => ({ name })),
  },
};

const schemaWithResolvers = addResolversToSchema({ schema, resolvers });

const apolloServer = new ApolloServer({ schema: schemaWithResolvers });
const { url } = await startStandaloneServer(apolloServer);

console.log(`💻 Apollo Server started: ${url}`);
