import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Openchat" },
    { name: "description", content: "Start interacting with AI avatars" },
  ];
};

export default function Index() {
  return <h1>Index Page: Authentication is not required</h1>;
}
