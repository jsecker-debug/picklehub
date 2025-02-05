
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AuthForm } from "@/components/auth/AuthForm";
import { AddParticipantForm } from "@/components/participants/AddParticipantForm";
import { ParticipantsList } from "@/components/participants/ParticipantsList";

const Participants = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Participants Management
          </h1>
          <p className="text-gray-600">
            Add and manage your frequent players
          </p>
        </div>

        <AddParticipantForm />
        <ParticipantsList />
      </div>
    </div>
  );
};

export default Participants;
