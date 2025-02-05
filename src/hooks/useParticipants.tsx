
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Participant } from "@/types/scheduler";

export const useParticipants = () => {
  return useQuery({
    queryKey: ["participants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("participants")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Participant[];
    },
  });
};
