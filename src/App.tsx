import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Sidebar } from "@/components/ui/sidebar-new";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Participants from "./pages/Participants";
import Sessions from "./pages/Sessions";
import NotFound from "./pages/NotFound";
import SignInPage from './pages/auth/sign-in'
import SignUpPage from './pages/auth/sign-up'
import ProfileSetupPage from './pages/auth/profile-setup'
import EmailConfirmationPage from './pages/auth/email-confirmation'
import ConfirmationSuccessPage from './pages/auth/confirmation-success'
import { useAuth } from './contexts/AuthContext'
import Profile from './pages/Profile'
import { ProfileButton } from './components/ProfileButton'
import { useSessionStatusUpdater } from './hooks/useSessionStatusUpdater'

const queryClient = new QueryClient();

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/auth/sign-in" replace />
  }

  if (!user.email_confirmed_at) {
    return <Navigate to="/auth/email-confirmation" replace />
  }

  return children
}

// Auth route wrapper (redirects to home if already authenticated)
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (user?.email_confirmed_at) {
    return <Navigate to="/home" replace />
  }

  return children
}

// Layout for protected routes
function ProtectedLayout() {
  useSessionStatusUpdater();

  return (
    <ProtectedRoute>
      <Sidebar>
        <main className="flex-1 overflow-auto">
          <div className="p-4">
            <div className="hidden md:flex justify-end mb-4">
              <ProfileButton />
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <Outlet />
            </div>
          </div>
        </main>
      </Sidebar>
    </ProtectedRoute>
  )
}

const App = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <Routes>
            {/* Auth routes - redirect to home if already authenticated */}
            <Route element={<AuthRoute><Outlet /></AuthRoute>}>
              <Route path="/auth/sign-in" element={<SignInPage />} />
              <Route path="/auth/sign-up" element={<SignUpPage />} />
            </Route>

            {/* Email confirmation and profile setup */}
            <Route path="/auth/email-confirmation" element={<EmailConfirmationPage />} />
            <Route path="/auth/confirmation-success" element={<ConfirmationSuccessPage />} />
            <Route path="/auth/profile-setup" element={<ProfileSetupPage />} />

            {/* Protected routes with sidebar */}
            <Route element={<ProtectedLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/scheduler" element={<Index />} />
              <Route path="/participants" element={<Participants />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/" element={<Navigate to="/home" replace />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={
              <Navigate to={user?.email_confirmed_at ? "/home" : "/auth/sign-in"} replace />
            } />
          </Routes>
        </Router>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App;
