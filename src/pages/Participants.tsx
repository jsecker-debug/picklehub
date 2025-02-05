
import { AddParticipantForm } from "@/components/participants/AddParticipantForm";
import { ParticipantsList } from "@/components/participants/ParticipantsList";

const Participants = () => {
  return (
    <div className="h-full bg-gray-50">
      <div className="max-w-full mx-auto px-8">
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold text-primary mb-2 font-anybody">
            Participants
          </h1>
        </div>

        <AddParticipantForm />
        <ParticipantsList />
      </div>
    </div>
  );
};

export default Participants;
