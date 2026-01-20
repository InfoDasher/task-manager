import Link from "next/link";
import { Frown, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            <span className="text-[150px] font-bold text-primary/10 leading-none select-none">404</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <Frown className="w-24 h-24 text-primary" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-foreground mb-3">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">Oops! The page you&apos;re looking for seems to have wandered off. It might have been moved, deleted, or never existed in the first place.</p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/tasks" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
            <Home className="w-5 h-5" />
            Go to Tasks
          </Link>
          <Link href="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-card-border text-foreground font-medium hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-card-border">
          <p className="text-sm text-muted-foreground mb-4">Here are some helpful links:</p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/projects" className="text-primary hover:text-primary/80 transition-colors">
              Projects
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/tasks" className="text-primary hover:text-primary/80 transition-colors">
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
