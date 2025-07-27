import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ProductSidebar } from "@/components/ProductSidebar";
import Dashboard from "./pages/Dashboard";
import Feed from "./pages/Feed";
import Schedule from "./pages/Schedule";
import SessionDetail from "./pages/SessionDetail";
import Members from "./pages/Members";
import Rankings from "./pages/Rankings";
import Payments from "./pages/Payments";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Index from "./pages/Index";
import Profile from './pages/Profile'
import { ProfileButton } from './components/ProfileButton'
import { ClubSelector } from './components/ClubSelector'
import { useSessionStatusUpdater } from './hooks/useSessionStatusUpdater'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ClubProvider } from './contexts/ClubContext'

const queryClient = new QueryClient();

// Main layout for the application
function AppLayout() {
  useSessionStatusUpdater();
  const { user } = useAuth();

  return (
    <ProductSidebar>
      <main className="flex-1 overflow-auto bg-background">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            {user ? <ClubSelector /> : <div />}
            <ProfileButton />
          </div>
          <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
            <Outlet />
          </div>
        </div>
      </main>
    </ProductSidebar>
  )
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ClubProvider>
          <TooltipProvider>
            <Router>
              <Routes>
                {/* Main application routes */}
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/feed" element={<Feed />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route path="/session/:sessionId" element={<SessionDetail />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/rankings" element={<Rankings />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/scheduler" element={<Index />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Router>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </ClubProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App;
