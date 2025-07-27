import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Target,
  Building,
  Check,
  X
} from "lucide-react";

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  level: string;
  gender: string;
}

const SignUp = () => {
  const [formData, setFormData] = useState<SignUpFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    level: "3.0",
    gender: "M"
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all fields");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      toast.error("Please fill in all personal information");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    setIsLoading(true);
    
    try {
      // Create auth user (this will send confirmation email)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
            level: formData.level,
            gender: formData.gender
          }
        }
      });
      
      if (authError) throw authError;
      
      // Success! Account created, redirect to sign-in page
      toast.success("Account created! Please check your email to confirm your account.");
      
      // Redirect to sign-in page with signup flag
      navigate('/signin?signup=true');
      
    } catch (error: unknown) {
      console.error('Sign up error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      if (errorMessage.includes('User already registered')) {
        toast.error("An account with this email already exists. Please sign in instead.");
        navigate('/signin');
      } else {
        toast.error(errorMessage || "Failed to create account");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-card-foreground">Create Account</h2>
        <p className="text-muted-foreground mt-2">Enter your email and password</p>
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
            placeholder="Minimum 6 characters"
            className="bg-background border-border"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            className="bg-background border-border"
            required
          />
        </div>
      </div>
      
      <Button onClick={handleNext} className="w-full">
        Next Step
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-card-foreground">Personal Information</h2>
        <p className="text-muted-foreground mt-2">Tell us about yourself</p>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              First Name
            </Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="John"
              className="bg-background border-border"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Last Name
            </Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Doe"
              className="bg-background border-border"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone Number
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+1 (555) 123-4567"
            className="bg-background border-border"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="level" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Skill Level
            </Label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm text-foreground"
            >
              <option value="2.0">2.0 - Beginner</option>
              <option value="2.5">2.5 - Beginner+</option>
              <option value="3.0">3.0 - Intermediate</option>
              <option value="3.5">3.5 - Intermediate+</option>
              <option value="4.0">4.0 - Advanced</option>
              <option value="4.5">4.5 - Advanced+</option>
              <option value="5.0">5.0 - Expert</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="gender" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Gender
            </Label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm text-foreground"
            >
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(1)} className="w-full">
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </div>
    </div>
  );


  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Sign Up</h1>
        <p className="text-muted-foreground mt-2">
          Create your pickleball account and join a club
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4">
        {[1, 2].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= stepNumber 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {step > stepNumber ? <Check className="h-4 w-4" /> : stepNumber}
            </div>
            {stepNumber < 2 && (
              <div className={`w-12 h-0.5 ml-2 ${
                step > stepNumber ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Sign Up Form */}
      <div className="max-w-md mx-auto">
        <Card className="bg-card border-border">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-chart-1 to-chart-2 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Sign In Link */}
      <div className="text-center">
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Button 
            variant="link" 
            onClick={() => navigate('/signin')}
            className="p-0 text-primary hover:text-primary/80"
          >
            Sign in here
          </Button>
        </p>
      </div>

      {/* Info Card */}
      <Card className="max-w-md mx-auto bg-card border-border">
        <CardContent className="p-6">
          <h3 className="font-semibold text-card-foreground mb-2">What happens after signup?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Your account will be created instantly
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              You can create your own pickleball club
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Or join existing clubs via admin invitations
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Start managing sessions and building your community
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;