import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface Participant {
  id: string;
  name: string;
}

const Participants = () => {
  const [newParticipant, setNewParticipant] = useState("");
  const queryClient = useQueryClient();

  const { data: participants, isLoading } = useQuery({
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

  const addParticipant = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from("participants")
        .insert([{ name }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participants"] });
      setNewParticipant("");
      toast.success("Participant added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add participant");
      console.error("Error adding participant:", error);
    },
  });

  const deleteParticipant = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("participants")
        .delete()
        .eq("id", id);
      if (error) throw error;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newParticipant.trim()) {
      addParticipant.mutate(newParticipant.trim());
    }
  };

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

        <Card className="p-6 mb-6">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <Input
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              placeholder="Enter participant name"
              className="flex-1"
            />
            <Button type="submit" disabled={!newParticipant.trim()}>
              Add Participant
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          {isLoading ? (
            <p className="text-center">Loading participants...</p>
          ) : (
            <div className="space-y-4">
              {participants?.map((participant) => (
                <div
                  key={participant.id}
                  className="flex justify-between items-center p-3 bg-white rounded-lg border"
                >
                  <span>{participant.name}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteParticipant.mutate(participant.id)}
                  >
                    Remove
                  </Button>
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
      </div>
    </div>
  );
};

export default Participants;