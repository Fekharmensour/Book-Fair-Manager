import { Switch, Route, useLocation } from "wouter";
import { LayoutDashboard, BookText, Users, Receipt, LogOut } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";

import AdminHome from "@/pages/admin/home";
import AdminBooks from "@/pages/admin/books";
import AdminPresenters from "@/pages/admin/presenters";
import AdminSales from "@/pages/admin/sales";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  if (!user || !user.isAdmin) {
    setLocation("/");
    return null;
  }

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Books", href: "/admin/books", icon: BookText },
    { label: "Presenters", href: "/admin/presenters", icon: Users },
    { label: "Sales", href: "/admin/sales", icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-card border-r flex flex-col">
        <div className="p-6 border-b flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <BookText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg leading-tight">Admin POS</h2>
            <p className="text-xs text-muted-foreground">{user.username}</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className="block">
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={() => {
              logout();
              setLocation("/login");
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-destructive hover:bg-destructive/10 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col max-h-screen overflow-y-auto">
        <Switch>
          <Route path="/admin" component={AdminHome} />
          <Route path="/admin/books" component={AdminBooks} />
          <Route path="/admin/presenters" component={AdminPresenters} />
          <Route path="/admin/sales" component={AdminSales} />
        </Switch>
      </main>
    </div>
  );
}
