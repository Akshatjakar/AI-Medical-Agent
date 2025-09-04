"use client";

import React from "react";
import AppHeader from "./_components/AppHeader";

function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* 🌈 Animated Gradient Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-200 via-indigo-100 to-blue-50 animate-gradient" />

      {/* ✨ Floating animated blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

      {/* Top Header */}
      <AppHeader />

      {/* Main Content */}
      <main className="flex-1 px-6 md:px-16 lg:px-32 py-10 relative z-10">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-10 animate-fade-in">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 md:px-16 lg:px-32 py-6 border-t bg-white/60 backdrop-blur relative z-10">
        <p className="text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} AI Doctor. All rights reserved.
        </p>
      </footer>

      {/* Extra Animations */}
      <style jsx global>{`
        @keyframes gradient {
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
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 20s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
}

export default DashboardLayout;
