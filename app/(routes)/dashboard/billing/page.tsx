"use client";
import { PricingTable } from "@clerk/nextjs";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

function Billing() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 md:px-24 bg-gray-50">
      {/* Back Button */}
      <Button
        variant="outline"
        className="mb-6 flex items-center gap-2"
        onClick={() => router.push("/dashboard")}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Button>

      {/* Heading */}
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800 text-center">
        Join Subscription
      </h2>

      {/* Subscription Card */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8 overflow-visible relative z-10">
        <PricingTable />
      </div>
    </div>
  );
}

export default Billing;
