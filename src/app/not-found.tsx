import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            <span className="text-[150px] font-bold text-primary/10 leading-none select-none">404</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-24 h-24 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-foreground mb-3">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">Oops! The page you&apos;re looking for seems to have wandered off. It might have been moved, deleted, or never existed in the first place.</p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go to Dashboard
          </Link>
          <Link href="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-card-border text-foreground font-medium hover:bg-muted transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-card-border">
          <p className="text-sm text-muted-foreground mb-4">Here are some helpful links:</p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/dashboard/projects" className="text-primary hover:text-primary/80 transition-colors">
              Projects
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/dashboard/tasks" className="text-primary hover:text-primary/80 transition-colors">
              Tasks
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/login" className="text-primary hover:text-primary/80 transition-colors">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
