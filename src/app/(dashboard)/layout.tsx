import { Navbar } from "@/components/layout/navbar";
import { Providers } from "@/components/providers";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    </Providers>
  );
}
