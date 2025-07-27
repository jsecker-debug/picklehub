import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  LogIn, 
  Mail, 
  Lock, 
  Check,
  AlertCircle
} from "lucide-react";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Check if user just signed up or confirmed email
  const justSignedUp = searchParams.get('signup') === 'true';
  const emailConfirmed = searchParams.get('confirmed') === 'true';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          toast.error("Please check your email and click the confirmation link before signing in.");
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error("Invalid email or password. Please check your credentials.");
        } else {
          toast.error(error.message);
        }
        return;
      }
      
      if (data.user) {
        toast.success("Welcome back!");
        navigate('/dashboard');
      }
      
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast.error("Please enter your email address first");
      return;
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Sign In</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back to your pickleball community
        </p>
      </div>

      {/* Status Messages */}
      {justSignedUp && (
        <Card className="max-w-md mx-auto bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold text-blue-500">Account Created!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Please check your email and click the confirmation link, then sign in below.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {emailConfirmed && (
        <Card className="max-w-md mx-auto bg-green-500/5 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold text-green-500">Email Confirmed!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your email has been confirmed. You can now sign in below.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sign In Form */}
      <div className="max-w-md mx-auto">
        <Card className="bg-card border-border">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-chart-1 to-chart-2 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-card-foreground">Welcome Back</h2>
                <p className="text-muted-foreground mt-2">Sign in to your account</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className="bg-background border-border"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="bg-background border-border"
                    required
                  />
                </div>
              </div>
              
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
              
              <div className="text-center">
                <Button 
                  type="button" 
                  variant="link" 
                  onClick={handleForgotPassword}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Forgot your password?
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Help Card */}
      <Card className="max-w-md mx-auto bg-card border-border">
        <CardContent className="p-6">
          <h3 className="font-semibold text-card-foreground mb-2">Need help?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              Make sure you've confirmed your email address
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-500" />
              Check your spam folder for the confirmation email
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Contact your club admin if you need assistance
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Sign Up Link */}
      <div className="text-center">
        <p className="text-muted-foreground">
          Don't have an account?{" "}
          <Button 
            variant="link" 
            onClick={() => navigate('/signup')}
            className="p-0 text-primary hover:text-primary/80"
          >
            Sign up here
          </Button>
        </p>
      </div>
    </div>
  );
};

export default SignIn;