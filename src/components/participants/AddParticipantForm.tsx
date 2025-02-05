
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const AddParticipantForm = () => {
  const [newParticipant, setNewParticipant] = useState("");
  const queryClient = useQueryClient();

  const addParticipant = useMutation({
    mutationFn: async (name: string) => {
      console.log('Adding participant:', name);
      const { data, error } = await supabase
        .from("participants")
        .insert([{ name }])
        .select();
      
      if (error) {
        console.error('Error adding participant:', error);
        throw error;
      }
      
      console.log('Participant added:', data);
      return data;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newParticipant.trim()) {
      addParticipant.mutate(newParticipant.trim());
    }
  };

  return (
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
  );
};
