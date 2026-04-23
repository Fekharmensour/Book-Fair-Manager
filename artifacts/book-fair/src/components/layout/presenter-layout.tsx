import { ReactNode } from "react";
import { LogOut, BookOpen } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";

export default function PresenterLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <header className="bg-card border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="font-serif font-bold text-xl">Book Fair POS</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground mr-1">Hello,</span>
              <span className="font-medium text-foreground">{user?.username}</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <button
              onClick={() => {
                logout();
                setLocation("/login");
              }}
              className="text-muted-foreground hover:text-destructive transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
