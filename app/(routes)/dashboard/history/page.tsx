"use client";
import { PricingTable } from "@clerk/nextjs";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

function Billing() {
  const router = useRouter();

  return (
    <div className="relative z-0 min-h-screen py-12 px-6 md:px-24 lg:px-48 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 animate-gradient-x blur-3xl opacity-40"></div>

      {/* Back Button */}
      <Button
        variant="outline"
        className="mb-6 flex items-center gap-2"
        onClick={() => router.push("/dashboard")}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Button>

      <div className="bg-white/70 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-lg p-8 md:p-12">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-gray-900 text-center">
          Join Subscription
        </h2>
        <PricingTable />
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

export default Billing;
