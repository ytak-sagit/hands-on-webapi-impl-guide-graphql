import type { FC } from "react";
import { Author } from "../author";
import { type FragmentType, graphql, useFragment } from "../gql";

const PostFragment = graphql(`
  fragment PostFragment on Post {
    title
    body
    author {
      ...AuthorFragment
    }
  }
`);

export const Post: FC<{
  postFragment: FragmentType<typeof PostFragment>;
}> = ({ postFragment }) => {
  const post = useFragment(PostFragment, postFragment);

  return (
    <>
      <h2>{post.title}</h2>
      <p>{post.body}</p>
      <Author authorFragment={post.author} />
    </>
  );
};
