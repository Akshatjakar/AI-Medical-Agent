"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Loader2, Plus, Sparkles } from "lucide-react";
import axios from "axios";
import { DoctorAgent } from "./DoctorAgentCard";
import SuggestedDoctorCard from "./SuggestedDoctorCard";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Session } from "inspector";

function AddNewSessionDialog() {
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [suggestedDoctors, setSuggestedDoctors] = useState<DoctorAgent[] | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorAgent>();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [historyList, setHistoryList] = useState<Session[]>([]);

  const { has } = useAuth();
  //@ts-ignore
  const paidUser = has && has({ plan: "pro" });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const result = await axios.get("/api/session-chat?sessionId=all");
      setHistoryList(result.data);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const OnClickNext = async () => {
    try {
      setLoading(true);
      const result = await axios.post("/api/suggest-doctors", { notes: note });

      if (Array.isArray(result.data)) {
        setSuggestedDoctors(result.data);
      } else if (Array.isArray(result.data.doctors)) {
        setSuggestedDoctors(result.data.doctors);
      } else {
        setSuggestedDoctors([]);
      }
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setSuggestedDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const onStartConsultation = async () => {
    setLoading(true);
    try {
      const result = await axios.post("/api/session-chat", {
        notes: note,
        selectedDoctor: selectedDoctor,
      });

      if (result.data?.sessionId) {
        setOpen(false);
        router.push(`/dashboard/medical-agent/${result.data.sessionId}`);
      }
    } catch (err) {
      console.error("Error starting consultation:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
          text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 rounded-xl px-6 py-2 flex items-center gap-2"
          disabled={!paidUser && historyList?.length >= 1}
        >
          <Plus className="h-5 w-5" />
          Start a Consultation
          <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[650px] bg-gradient-to-br from-white via-blue-50 to-indigo-50 shadow-2xl border-0 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
            {suggestedDoctors ? "Choose Your Doctor" : "Add Your Symptoms"}
          </DialogTitle>
          <DialogDescription asChild>
            {!suggestedDoctors ? (
              <div className="mt-4 space-y-4">
                <p className="text-gray-600 text-center">
                  Tell us what you’re experiencing, and we’ll recommend the right doctor for you.
                </p>
                <Textarea
                  placeholder="E.g. I have a headache and fever since yesterday..."
                  className="h-[160px] mt-2 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            ) : (
              <div className="mt-6">
                <p className="text-gray-600 text-center mb-4">
                  Based on your symptoms, here are the best doctors for you:
                </p>
                <div className="grid md:grid-cols-2 gap-5">
                  {suggestedDoctors.map((doctor, index) => (
                    <SuggestedDoctorCard
                      doctorAgent={doctor}
                      key={index}
                      setSelectedDoctor={() => setSelectedDoctor(doctor)}
                      //@ts-ignore
                      selectedDoctor={selectedDoctor}
                    />
                  ))}
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-3 pt-6">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="rounded-xl px-6 py-2 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition"
          >
            Cancel
          </Button>

          {!suggestedDoctors ? (
            <Button
              disabled={!note || loading}
              onClick={OnClickNext}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
              text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 rounded-xl px-8"
            >
              {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Next"}
              {!loading && <ArrowRight className="ml-2" />}
            </Button>
          ) : (
            <Button
              disabled={loading || !selectedDoctor}
              onClick={onStartConsultation}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 
              text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 rounded-xl px-8"
            >
              {loading ? (
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              ) : (
                <>
                  Start Consultation <ArrowRight className="ml-2" />
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddNewSessionDialog;
