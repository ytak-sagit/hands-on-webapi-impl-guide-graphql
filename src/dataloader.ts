// NOTE: 実行する場合はこのファイルの内容を index.ts へコピーしてから `npm start` すること

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadSchemaSync } from "@graphql-tools/load";
import { addResolversToSchema } from "@graphql-tools/schema";
import DataLoader from "dataloader";

import { authors, posts, tags } from "./databaseForDataloader.js";

// Post を取得するための Batch Function
class PostsDataSource {
  // keys で指定された author_id を持つ post の配列を返す
  #loader = new DataLoader(async (keys: number[]) => {
    // 実際の GraphQL サーバで発行されることが想定されるクエリをログに出力する
    console.log(`SELECT * FROM post WHERE author_id IN (${keys.join(",")})`);
    const results = posts.filter((post) => keys.includes(post.author_id));

    return keys.map((key: number) =>
      results.filter((post) => post.author_id === key),
    );
  });

  // Post の Batch Function に key を登録する
  // -> 一定期間待機し、その間に行われたリクエストをまとめて処理する
  async getPostsBy(author_id: number) {
    return this.#loader.load(author_id);
  }
}

// Tag を取得するための Batch Function
class TagsDataSource {
  // keys で指定された post_id を持つ tag の配列を返す
  #loader = new DataLoader(async (keys: number[]) => {
    // 実際の GraphQL サーバーで発行されることが想定されるクエリをログに出力する
    console.log(`SELECT * FROM tag WHERE post_id IN (${keys.join(",")})`);
    const results = tags.filter((tag) => keys.includes(tag.post_id));

    return keys.map((key: number) =>
      results.filter((tag) => tag.post_id === key),
    );
  });

  // Tag の Batch Function に key を登録する
  async getTagsBy(post_id: number) {
    return this.#loader.load(post_id);
  }
}

interface ContextValue {
  dataSources: {
    posts: PostsDataSource;
    tags: TagsDataSource;
  };
}

const getAuthors = () => {
  // 実際の GraphQL サーバーで発行されることが想定されるクエリをログに出力する
  console.log(`SELECT * FROM author`);

  return authors;
};

const resolvers = {
  Query: {
    authors: () => getAuthors(),
  },
  Author: {
    posts: (parent, _, { dataSources }) =>
      dataSources.posts.getPostsBy(parent.id),
  },
  Post: {
    tags: (parent, _, { dataSources }) => dataSources.tags.getTagsBy(parent.id),
  },
};

const schema = loadSchemaSync("schema.graphql", {
  loaders: [new GraphQLFileLoader()],
});

const schemaWithResolvers = addResolversToSchema({ schema, resolvers });
const apolloServer = new ApolloServer<ContextValue>({
  schema: schemaWithResolvers,
});
const { url } = await startStandaloneServer(apolloServer, {
  // NOTE: context の dataSources はリクエストごとに初期化
  // ->
  // リクエストごとに DataLoader のインスタンスを生成することで、Cache がメモ化する Key-Value の組が、
  // ユーザーやコンテキストの異なるリクエストから参照されることや、メモリに書き込まれ続け大量のメモリを消費することを防ぐ
  context: async () => {
    return {
      dataSources: {
        posts: new PostsDataSource(),
        tags: new TagsDataSource(),
      },
    };
  },
});

console.log(`💻 Apollo Server started: ${url}`);
