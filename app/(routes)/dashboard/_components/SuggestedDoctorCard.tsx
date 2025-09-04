import React from "react";
import { DoctorAgent } from "./DoctorAgentCard";
import Image from "next/image";

type Props = {
  doctorAgent: DoctorAgent;
  setSelectedDoctor: (doc: DoctorAgent) => void;
  selectedDoctor?: DoctorAgent;
};

function SuggestedDoctorCard({
  doctorAgent,
  setSelectedDoctor,
  selectedDoctor,
}: Props) {
  const isSelected = selectedDoctor?.id === doctorAgent?.id;

  return (
    <div
      className={`flex flex-col items-center justify-between rounded-2xl p-5 cursor-pointer transition-all duration-300
        border-2 shadow-sm hover:shadow-md hover:scale-105
        ${isSelected ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white"}`}
      onClick={() => setSelectedDoctor(doctorAgent)}
    >
      {/* Doctor Image */}
      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 flex items-center justify-center">
        <Image
          src={
            doctorAgent?.image && doctorAgent.image.trim() !== ""
              ? doctorAgent.image
              : "/default-doctor.png"
          }
          alt={doctorAgent?.specialist ?? "Doctor"}
          width={64}
          height={64}
          className="object-cover w-full h-full"
        />
      </div>

      {/* Doctor Info */}
      <h2 className="mt-3 font-semibold text-center text-gray-800 text-sm">
        {doctorAgent?.specialist}
      </h2>
      <p className="text-xs text-gray-500 text-center line-clamp-2 mt-1">
        {doctorAgent?.description}
      </p>
    </div>
  );
}

export default SuggestedDoctorCard;
