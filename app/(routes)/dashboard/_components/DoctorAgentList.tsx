"use client";
import { SetStateAction, useState } from "react";
import { AIDoctorAgents } from "@/public/agent/list";
import DoctorAgentCard from "./DoctorAgentCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function DoctorAgentList() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "free" | "premium">("all");

  const filteredDoctors = AIDoctorAgents.filter((doctor) => {
    const matchesSearch =
      doctor.specialist.toLowerCase().includes(search.toLowerCase()) ||
      doctor.description.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all"
        ? true
        : filter === "premium"
        ? doctor.subscriptionRequired
        : !doctor.subscriptionRequired;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="mt-12">
      {/* Heading */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
          AI Specialist Doctors
        </h2>
        <p className="text-gray-500 mt-2 text-sm md:text-base">
          Choose from a wide range of AI-powered medical specialists
        </p>
        <div className="mt-3 w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto" />
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {/* Search Box */}
        <Input
          type="text"
          placeholder="Search doctors..."
          value={search}
          onChange={(e: { target: { value: SetStateAction<string>; }; }) => setSearch(e.target.value)}
          className="w-full md:w-1/3 border-2 border-gray-200 rounded-xl"
        />

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className="rounded-xl"
          >
            All
          </Button>
          <Button
            variant={filter === "free" ? "default" : "outline"}
            onClick={() => setFilter("free")}
            className="rounded-xl"
          >
            Free
          </Button>
          <Button
            variant={filter === "premium" ? "default" : "outline"}
            onClick={() => setFilter("premium")}
            className="rounded-xl"
          >
            Premium
          </Button>
        </div>
      </div>

      {/* Grid of Doctors */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 
        lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 px-2 md:px-4"
      >
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor, index) => (
            <DoctorAgentCard key={index} doctorAgent={doctor} />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 italic">
            No doctors found matching your search.
          </p>
        )}
      </div>
    </div>
  );
}

export default DoctorAgentList;
