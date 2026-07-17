import { AppShell } from "../layout/AppShell";
import { NotFound } from "../components/NotFound";

export function NotFoundPage() {
  return (
    <AppShell title="Not Found" subtitle="This page doesn't exist">
      <NotFound
        title="Page not found"
        message="The page you're looking for doesn't exist."
        linkTo="/"
        linkLabel="Go to dashboard"
      />
    </AppShell>
  );
}
