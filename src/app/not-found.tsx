import Link from "next/link";
export default function NotFound() {
  return (
    <main className="fatal-error">
      <h1>This wheel leads nowhere.</h1>
      <p>The page could not be found.</p>
      <Link className="text-link" href="/">
        Back to the dashboard →
      </Link>
    </main>
  );
}
