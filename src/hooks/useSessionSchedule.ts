
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Rotation } from "@/types/scheduler";

export const useSessionSchedule = (sessionId: string | null) => {
  return useQuery({
    queryKey: ["session-schedule", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;

      // Fetch all rotations for the session
      const { data: rotationData, error: rotationError } = await supabase
        .from('rotations')
        .select(`
          id,
          is_king_court,
          rotation_number,
          court_assignments (
            court_number,
            team1_players,
            team2_players
          ),
          rotation_resters (
            resting_players
          )
        `)
        .eq('session_id', sessionId)
        .order('rotation_number', { nullsLast: true });

      if (rotationError) throw rotationError;

      // Transform the data to match our Rotation type
      const transformedRotations: Rotation[] = rotationData.map(rotation => ({
        courts: rotation.court_assignments.map(court => ({
          team1: court.team1_players,
          team2: court.team2_players
        })),
        resters: rotation.rotation_resters[0]?.resting_players || []
      }));

      // Separate random rotations and king court rotation
      const randomRotations = transformedRotations.filter((_, idx) => 
        rotationData[idx].is_king_court === false
      );

      const kingCourtRotation = transformedRotations.find((_, idx) => 
        rotationData[idx].is_king_court === true
      ) || null;

      return {
        randomRotations,
        kingCourtRotation
      };
    },
    enabled: !!sessionId
  });
};
