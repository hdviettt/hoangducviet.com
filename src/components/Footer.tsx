import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg viewBox="0 0 32 32" className="w-5 h-5" fill="currentColor">
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
        </Link>
        <span className="text-sm text-muted-foreground">
          {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}
