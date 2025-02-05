
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const AuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      toast.error(error.message);
      console.error("Sign in error:", error);
    } else {
      toast.success("Signed in successfully");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      toast.error(error.message);
      console.error("Sign up error:", error);
    } else {
      toast.success("Check your email for the confirmation link!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-primary mb-6 text-center">
            Sign In or Sign Up
          </h1>
          <form className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={handleSignIn}
                className="flex-1"
                type="button"
              >
                Sign In
              </Button>
              <Button 
                onClick={handleSignUp}
                className="flex-1"
                variant="outline"
                type="button"
              >
                Sign Up
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
