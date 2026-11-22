"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main style={{ padding: "2em" }}>
      <h1>Something went wrong</h1>
      <p>
        <a href="#" onClick={(e) => (e.preventDefault(), reset())}>Try again</a>
      </p>
    </main>
  );
}
