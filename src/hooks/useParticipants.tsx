
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useClub } from "@/contexts/ClubContext";
import type { Participant } from "@/types/scheduler";

export const useParticipants = () => {
  const { selectedClubId } = useClub();
  
  return useQuery({
    queryKey: ["participants", selectedClubId],
    queryFn: async () => {
      if (!selectedClubId) {
        return [];
      }
      
      // Query user_profiles joined with club_memberships to get participants
      const { data, error } = await supabase
        .from("club_memberships")
        .select(`
          user_profiles!inner(
            id,
            first_name,
            last_name,
            phone,
            skill_level,
            gender,
            total_games_played,
            wins,
            losses,
            avatar_url,
            preferences,
            created_at,
            updated_at
          )
        `)
        .eq("club_id", selectedClubId)
        .eq("status", "active");
        
      if (error) throw error;
      
      // Transform the data to match the Participant type
      const participants = (data || []).map((membership: any) => {
        const profile = membership.user_profiles;
        const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
        
        return {
          id: profile.id,
          name: fullName || 'Unknown User',
          phone: profile.phone,
          skill_level: profile.skill_level,
          gender: profile.gender,
          total_games_played: profile.total_games_played || 0,
          wins: profile.wins || 0,
          losses: profile.losses || 0,
          level: profile.skill_level || 0,
          avatar_url: profile.avatar_url,
          preferences: profile.preferences,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          club_id: selectedClubId, // Add club_id for compatibility
        };
      });
      
      return participants.sort((a, b) => a.name.localeCompare(b.name)) as Participant[];
    },
    enabled: !!selectedClubId,
  });
};
