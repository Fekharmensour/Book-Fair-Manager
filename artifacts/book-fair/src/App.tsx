import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { setBaseUrl } from "@workspace/api-client-react";

if (import.meta.env.VITE_API_URL) {
  setBaseUrl(import.meta.env.VITE_API_URL);
}

import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import AdminLayout from "@/components/layout/admin-layout";
import PresenterPOS from "@/pages/presenter/pos";
import Landing from "@/pages/landing";

const queryClient = new QueryClient();

function GuardedRoute({ component: Component, adminOnly = false }: { component: any, adminOnly?: boolean }) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) {
      setLocation("/login");
    } else if (adminOnly && !user.isAdmin) {
      setLocation("/pos");
    }
  }, [user, setLocation, adminOnly]);

  if (!user) return null;
  if (adminOnly && !user.isAdmin) return null;

  return <Component />;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />

      {/* Presenter Route */}
      <Route path="/pos">
        {() => <GuardedRoute component={PresenterPOS} />}
      </Route>

      {/* Admin Routes */}
      <Route path="/admin">
        {() => <GuardedRoute component={AdminLayout} adminOnly={true} />}
      </Route>
      <Route path="/admin/books">
        {() => <GuardedRoute component={AdminLayout} adminOnly={true} />}
      </Route>
      <Route path="/admin/presenters">
        {() => <GuardedRoute component={AdminLayout} adminOnly={true} />}
      </Route>
      <Route path="/admin/sales">
        {() => <GuardedRoute component={AdminLayout} adminOnly={true} />}
      </Route>
      <Route path="/admin/orders">
        {() => <GuardedRoute component={AdminLayout} adminOnly={true} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRoutes />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
