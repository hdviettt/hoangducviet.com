import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-4xl font-semibold mb-2">404</h1>
      <p className="text-neutral-500 mb-6">Page not found</p>
      <Link href="/" className="text-blue-600 hover:underline text-sm">
        ← back home
      </Link>
    </div>
  );
}
