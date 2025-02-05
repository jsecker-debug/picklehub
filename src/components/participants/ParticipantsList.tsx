import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Participant {
  id: string;
  name: string;
  level?: number;
}

export const ParticipantsList = ({ searchQuery = "" }: { searchQuery?: string }) => {
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

  const updateLevel = useMutation({
    mutationFn: async ({ id, level }: { id: string; level: number }) => {
      console.log('Updating participant level:', { id, level });
      const { error } = await supabase
        .from("participants")
        .update({ level })
        .eq("id", id);
      
      if (error) {
        console.error('Error updating participant level:', error);
        throw error;
      }
      
      console.log('Level updated successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participants"] });
      toast.success("Level updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update level");
      console.error("Error updating level:", error);
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

  const handleLevelChange = (id: string, newValue: string) => {
    const numericValue = parseFloat(newValue);
    if (!isNaN(numericValue)) {
      updateLevel.mutate({ id, level: numericValue });
    }
  };

  const filteredParticipants = participants?.filter(participant =>
    participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return <div className="text-center text-red-500">Error loading participants</div>;
  }

  return (
    <Card className="p-6">
      {isLoading ? (
        <p className="text-center">Loading participants...</p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredParticipants?.map((participant) => (
              <div
                key={participant.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white rounded-lg border gap-2"
              >
                <span className="truncate w-full sm:w-auto">{participant.name}</span>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-sm text-gray-500">Level</span>
                    <Input
                      type="number"
                      value={participant.level?.toString() || "0"}
                      onChange={(e) => handleLevelChange(participant.id, e.target.value)}
                      step="0.1"
                      min="0"
                      max="10"
                      className="w-20"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteParticipant.mutate(participant.id)}
                    className="bg-red-600/80 hover:bg-red-600/90 w-full sm:w-auto"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {filteredParticipants?.length === 0 && (
            <p className="text-center text-gray-500">
              No participants found
            </p>
          )}
        </div>
      )}
    </Card>
  );
};
