
import { AddParticipantForm } from "@/components/participants/AddParticipantForm";
import { ParticipantsList } from "@/components/participants/ParticipantsList";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const Participants = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="h-full bg-gray-50">
      <div className="max-w-full mx-auto px-8">
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold text-primary mb-2 font-anybody">
            Participants
          </h1>
        </div>

        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Search participants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          <div className="flex-1">
            <AddParticipantForm />
          </div>
        </div>

        <ParticipantsList searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default Participants;
