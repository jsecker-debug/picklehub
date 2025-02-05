
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface Participant {
  id: string;
  name: string;
  level?: number;
}

export const ParticipantsList = () => {
  const queryClient = useQueryClient();

  const { data: participants, isLoading, error } = useQuery({
    queryKey: ["participants"],
    queryFn: async () => {
      console.log('Fetching participants...');
      const { data, error } = await supabase
        .from("participants")
        .select("*")
        .order("name");
      
      if (error) {
        console.error('Error fetching participants:', error);
        throw error;
      }
      
      console.log('Participants fetched:', data);
      return data as Participant[];
    },
  });

  const deleteParticipant = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting participant:', id);
      const { error } = await supabase
        .from("participants")
        .delete()
        .eq("id", id);
      
      if (error) {
        console.error('Error deleting participant:', error);
        throw error;
      }
      
      console.log('Participant deleted:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participants"] });
      toast.success("Participant removed successfully");
    },
    onError: (error) => {
      toast.error("Failed to remove participant");
      console.error("Error removing participant:", error);
    },
  });

  if (error) {
    return <div className="text-center text-red-500">Error loading participants</div>;
  }

  return (
    <Card className="p-6">
      {isLoading ? (
        <p className="text-center">Loading participants...</p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 mb-4 px-3 text-sm font-medium text-gray-500">
            <div>Name</div>
            <div>Level</div>
            <div></div>
          </div>
          {participants?.map((participant) => (
            <div
              key={participant.id}
              className="grid grid-cols-3 gap-4 items-center p-3 bg-white rounded-lg border"
            >
              <span>{participant.name}</span>
              <span className="text-gray-600">
                {participant.level ? participant.level.toFixed(2) : '0.00'}
              </span>
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteParticipant.mutate(participant.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          {participants?.length === 0 && (
            <p className="text-center text-gray-500">
              No participants added yet
            </p>
          )}
        </div>
      )}
    </Card>
  );
};
