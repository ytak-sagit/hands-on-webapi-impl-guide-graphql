import { useState } from "react";
import { gql, useQuery } from "urql";

const PostsQuery = gql`
  query posts($tags: [String!]) {
    posts(tags: $tags) {
      title
      body
      author {
        name
      }
    }
  }
`;

const ChoosableTags = [
  "GraphQL",
  "Prisma",
  "Observability",
  "Engineering",
  "Event",
  "ADR",
  "CSS",
  "執筆",
  "example",
] as const;

function App() {
  const [tags, setTags] = useState(["GraphQL"]);

  const [result] = useQuery({
    query: PostsQuery,
    variables: { tags },
  });

  const { data, fetching, error } = result;

  return (
    <>
      <h1>GraphQL Client Sample</h1>
      <fieldset>
        <legend>Choose Blog tags:</legend>

        {ChoosableTags.map((choosableTag) => (
          <div key={choosableTag}>
            <input
              type="checkbox"
              id={choosableTag}
              name={choosableTag}
              checked={tags.includes(choosableTag)}
              onChange={(e) => {
                e.target.checked
                  ? setTags([...tags, e.target.name])
                  : setTags(tags.filter((t) => t !== e.target.name));
              }}
            />
            <label htmlFor={choosableTag}>{choosableTag}</label>
          </div>
        ))}
      </fieldset>

      {fetching ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Oh no... {error.message}</p>
      ) : (
        <ul>
          {data?.posts.map((post) => (
            <li key={post.title}>
              <h2>{post.title}</h2>
              <p>{post.body}</p>
              <p>Author: {post.author.name}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default App;
