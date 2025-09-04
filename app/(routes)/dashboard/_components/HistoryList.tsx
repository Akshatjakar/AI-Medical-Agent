"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import AddNewSessionDialog from "./AddNewSessionDialog";
import axios from "axios";
import Link from "next/link";
import { MessageSquareText, Clock } from "lucide-react";

type DoctorAgent = {
  id: number;
  specialist: string;
  image: string;
};

type Message = {
  role: "assistant" | "user";
  content: string;
};

type Session = {
  id: number;
  notes: string;
  sessionId: string;
  selectedDoctor: DoctorAgent | null;
  createdOn: string;
  messages?: Message[];
};

function HistoryList() {
  const [historyList, setHistoryList] = useState<Session[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const result = await axios.get("/api/session-chat?sessionId=all");
      const sessions = result.data;

      const withMessages = await Promise.all(
        sessions.map(async (s: Session) => {
          try {
            const msgsRes = await axios.get(
              `/api/session-messages?sessionId=${s.sessionId}`
            );
            const msgs: Message[] = msgsRes.data || [];
            return { ...s, messages: msgs.slice(-2) };
          } catch (err) {
            console.error("Error fetching messages for session:", s.sessionId, err);
            return { ...s, messages: [] };
          }
        })
      );

      setHistoryList(withMessages);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  return (
    <div className="mt-10">
      {historyList.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-white shadow-lg animate-fadeIn">
          <Image src={"/medical.png"} alt="empty" width={160} height={160} />
          <h2 className="font-bold text-2xl mt-4 text-gray-800">No Recent Consultations</h2>
          <p className="text-gray-500 mt-1 text-center">
            It looks like you haven&apos;t consulted with any doctor yet.
          </p>
          <div className="mt-4">
            <AddNewSessionDialog />
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {historyList.map((session) => {
            const doctor = session.selectedDoctor;
            const messages = session.messages || [];

            const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content;
            const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant")?.content;

            return (
              <Link
                href={`/dashboard/agent/${session.sessionId}`}
                key={session.id}
              >
                <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 p-5 cursor-pointer transition-transform transform hover:-translate-y-1 hover:scale-105 animate-fadeIn">
                  {/* Doctor Header */}
                  <div className="flex items-center gap-4">
                    {doctor?.image ? (
                      <Image
                        src={doctor.image}
                        alt={doctor.specialist ?? "Doctor"}
                        width={60}
                        height={60}
                        className="rounded-full border object-cover shadow-sm"
                      />
                    ) : (
                      <div className="w-[60px] h-[60px] rounded-full border flex items-center justify-center bg-gray-100 text-gray-400">
                        👨‍⚕️
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">
                        {doctor?.specialist ?? "General Practitioner"}
                      </h3>
                      <div className="flex items-center text-gray-500 text-sm gap-1">
                        <Clock size={14} /> {new Date(session.createdOn).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Last Messages */}
                  <div className="mt-4 bg-gray-50/80 backdrop-blur-sm rounded-xl p-3 text-sm text-gray-700 space-y-2">
                    {lastUserMsg && (
                      <p className="line-clamp-1">
                        <span className="font-semibold text-gray-800">You:</span>{" "}
                        {lastUserMsg}
                      </p>
                    )}
                    {lastAssistantMsg && (
                      <p className="line-clamp-1">
                        <span className="font-semibold text-blue-700">AI:</span>{" "}
                        {lastAssistantMsg}
                      </p>
                    )}
                    {!lastUserMsg && !lastAssistantMsg && (
                      <p className="italic text-gray-400 flex items-center gap-2">
                        <MessageSquareText size={14} /> No conversation saved.
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}

export default HistoryList;
