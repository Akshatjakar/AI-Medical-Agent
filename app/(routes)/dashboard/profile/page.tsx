"use client";

import { UserProfile } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="relative z-0 min-h-screen flex flex-col items-center py-12 px-6 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100 animate-gradient-x blur-3xl opacity-40"></div>

      {/* Back Button */}
      <div className="w-full max-w-5xl mb-6">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Button>
      </div>

      {/* Profile Card */}
      <div className="w-full max-w-5xl bg-white/70 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-lg p-6 md:p-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          My Profile
        </h2>
        <UserProfile />
      </div>

      <style jsx global>{`
        @keyframes gradient-x {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
      `}</style>
    </div>
  );
}
