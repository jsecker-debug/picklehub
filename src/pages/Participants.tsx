
import { AddParticipantForm } from "@/components/participants/AddParticipantForm";
import { ParticipantsList } from "@/components/participants/ParticipantsList";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useParticipants } from "@/hooks/useParticipants";

const Participants = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: participants } = useParticipants();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
  };

  return (
    <div className="h-full bg-gray-50">
      <div className="max-w-full mx-auto px-8">
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold text-primary mb-2 font-anybody">
            Participants
          </h1>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Card className="p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search participants..."
                    className="flex-1"
                  />
                  <Button type="submit">
                    Search
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleClearSearch}
                  >
                    Clear
                  </Button>
                </div>
              </form>
            </Card>
          </div>
          <div className="flex-1">
            <AddParticipantForm />
          </div>
        </div>

        <div className="mb-4 text-sm text-gray-500 px-2">
          Total Participants: {participants?.length || 0}
        </div>

        <ParticipantsList searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default Participants;
