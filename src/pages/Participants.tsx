
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
      <div className="max-w-full mx-auto py-20 px-6 md:px-12">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary font-anybody">Participants</h1>
          <p className="text-gray-600 mt-2">Manage your participants</p>
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

