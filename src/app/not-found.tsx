import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
      <svg
        viewBox="0 0 32 32"
        className="w-16 h-16 text-muted-foreground mb-8"
        fill="currentColor"
      >
        <rect x="4" y="9" width="4" height="4" />
        <rect x="4" y="19" width="4" height="4" />
        <rect x="12" y="9" width="4" height="4" />
        <rect x="14" y="13" width="4" height="4" />
        <rect x="16" y="17" width="4" height="4" />
        <rect x="24" y="9" width="4" height="4" />
        <rect x="22" y="13" width="4" height="4" />
        <rect x="20" y="17" width="4" height="4" />
        <rect x="18" y="21" width="4" height="4" />
      </svg>

      <h1 className="text-4xl font-semibold mb-2">404</h1>
      <p className="text-muted-foreground mb-8">Page not found</p>

      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Back home
      </Link>
    </div>
  );
}
