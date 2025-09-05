"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { IconArrowRight } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import axios from "axios";
import { Loader2Icon } from "lucide-react";

export type DoctorAgent = {
  id: number;
  specialist: string;
  description: string;
  image: string;
  agentPrompt: string;
  voiceId: string;
  subscriptionRequired: boolean;
};

type Props = {
  doctorAgent: DoctorAgent;
};

export default function DoctorAgentCard({ doctorAgent }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { has } = useAuth();
  // @ts-ignore
  const paidUser = has && has({ plan: "pro" });

  const onStartConsultation = async () => {
    setLoading(true);
    try {
      const result = await axios.post("/api/session-chat", {
        notes: "New Query",
        selectedDoctor: doctorAgent,
      });

      // ✅ Prefer redirectUrl from API, fallback to sessionId
      if (result.data?.redirectUrl) {
        router.push(result.data.redirectUrl);
      } else if (result.data?.sessionId) {
        router.push(`/dashboard/medical-agent/${result.data.sessionId}`);
      }
    } catch (err) {
      console.error("Error starting consultation:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative p-6 rounded-2xl border bg-white shadow-sm 
      hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
    >
      {doctorAgent.subscriptionRequired && (
        <Badge className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md">
          Premium
        </Badge>
      )}

      <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-blue-100 group-hover:ring-blue-300 transition">
          <Image
            src={doctorAgent.image}
            alt={doctorAgent.specialist}
            width={100}
            height={100}
            className="object-cover w-full h-full"
          />
        </div>

        <h2 className="mt-4 text-lg font-bold text-gray-800 group-hover:text-blue-700 transition">
          {doctorAgent.specialist}
        </h2>
        <p className="text-sm text-gray-500 mt-1 line-clamp-3">
          {doctorAgent.description}
        </p>
      </div>

      <Button
        className="w-full mt-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
        text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 rounded-xl flex items-center justify-center gap-2"
        onClick={onStartConsultation}
        disabled={!paidUser && doctorAgent.subscriptionRequired}
      >
        {loading ? (
          <Loader2Icon className="animate-spin h-5 w-5" />
        ) : (
          <>
            Start Consultation <IconArrowRight size={18} />
          </>
        )}
      </Button>
    </div>
  );
}
