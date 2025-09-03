import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <h1 className="text-red-500">💖 Hello Jacob!</h1>
      <p>Welcome to your Electron application.</p>
    </>
  );
}
