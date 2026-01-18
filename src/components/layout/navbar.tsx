"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/projects", label: "Projects" },
    { href: "/dashboard/tasks", label: "Tasks" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">TaskManager</span>
          </Link>
          <nav className="hidden md:flex items-center gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn("text-sm font-medium transition-colors hover:text-blue-600 leading-none", pathname === link.href ? "text-blue-600" : "text-gray-600")}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 hidden sm:block">{session?.user?.email}</span>
          <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
