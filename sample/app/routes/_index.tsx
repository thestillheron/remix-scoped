import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { scopedLoader } from "remix-scoped";
import { urlPrinter } from "~/server/urlPrinter";

export const loader = scopedLoader(async () => {
  const url = await urlPrinter();
  return json({url})
})

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <p>{data.url}</p>
  );
}
