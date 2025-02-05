
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Session {
  id: string;
  created_at: string;
  Date: string;
  venue: string;
}

export const useSessions = () => {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .order('Date', { ascending: true });
      
      if (error) {
        console.error("Error fetching sessions:", error);
        throw error;
      }
      
      return data as Session[];
    },
  });
};
