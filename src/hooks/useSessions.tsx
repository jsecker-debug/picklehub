
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Session {
  id: string;
  created_at: string;
  Date: string;  // Changed from 'date' to 'Date'
  venue: string;
  status: 'Upcoming' | 'Completed';
}

export const useSessions = () => {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .order('Date', { ascending: true });  // Changed from 'date' to 'Date'
      
      if (error) {
        console.error("Error fetching sessions:", error);
        throw error;
      }
      
      return data as Session[];
    },
  });
};
