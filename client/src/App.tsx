import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import NewCampaign from "./pages/NewCampaign";
import CampaignProgress from "./pages/CampaignProgress";
import CampaignResults from "./pages/CampaignResults";
import Settings from "./pages/Settings";
import { useAuth } from "./_core/hooks/useAuth";
import { getLoginUrl } from "./const";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

// ─── Post-login redirect handler ─────────────────────────────────────────────
// After Manus OAuth redirects back to "/", check sessionStorage for a saved
// return path and navigate there automatically.

function PostLoginRedirect() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      try {
        const returnPath = sessionStorage.getItem("lap_return_path");
        if (returnPath && returnPath !== "/") {
          sessionStorage.removeItem("lap_return_path");
          setLocation(returnPath);
        }
      } catch {
        // sessionStorage may not be available
      }
    }
  }, [isAuthenticated, loading, setLocation]);

  return null;
}

// ─── Protected route wrapper ──────────────────────────────────────────────────

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, loading } = useAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the intended path and redirect to login
    window.location.href = getLoginUrl(location);
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <>
      <PostLoginRedirect />
      <Switch>
        {/* Public */}
        <Route path="/" component={Home} />

        {/* Protected area */}
        <Route path="/dashboard">
          {() => <ProtectedRoute component={Dashboard} />}
        </Route>
        <Route path="/campaigns/new">
          {() => <ProtectedRoute component={NewCampaign} />}
        </Route>
        <Route path="/campaigns/:id/progress">
          {() => <ProtectedRoute component={CampaignProgress} />}
        </Route>
        <Route path="/campaigns/:id/results">
          {() => <ProtectedRoute component={CampaignResults} />}
        </Route>
        <Route path="/settings">
          {() => <ProtectedRoute component={Settings} />}
        </Route>

        {/* Fallback */}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
