"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="fatal-error">
      <h1>A little wheel jam.</h1>
      <p>The dashboard could not render. Refresh to try again.</p>
      <button className="subtle-button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
