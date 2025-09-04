"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

const menuOptions = [
  { id: 1, name: "Home", path: "/dashboard" },
  { id: 2, name: "History", path: "/dashboard/history" },
  { id: 3, name: "Pricing", path: "/dashboard/billing" },
  { id: 4, name: "Profile", path: "/dashboard/profile" },
];

function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="w-full sticky top-0 z-50 backdrop-blur-xl bg-gradient-to-r from-blue-200 via-indigo-100 to-blue-50/70 shadow-lg animate-header-fade">
      <div className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-4">
        {/* Logo */}
        <Link href="/dashboard">
          <Image
            src={"/logo1.png"}
            alt="logo"
            width={140}
            height={90}
            className="cursor-pointer hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Menu */}
        <nav className="hidden md:flex gap-10 items-center">
          {menuOptions.map((option) => {
            const isActive = pathname === option.path;
            return (
              <Link key={option.id} href={option.path}>
                <span
                  className={`cursor-pointer transition-all duration-300 font-medium ${
                    isActive
                      ? "text-blue-700 scale-105"
                      : "text-gray-700 hover:text-blue-600 hover:scale-105"
                  }`}
                >
                  {option.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <UserButton afterSignOutUrl="/" />
      </div>

      {/* Extra Animations */}
      <style jsx global>{`
        @keyframes headerFade {
          0% {
            transform: translateY(-10px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-header-fade {
          animation: headerFade 1s ease-out;
        }
      `}</style>
    </header>
  );
}

export default AppHeader;
