"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  LogOut,
  User as UserIcon,
  Key,
  ChevronDown,
} from "lucide-react";
import { ChangePasswordModal } from "./ChangePasswordModal";

interface HeaderProps {
  userEmail?: string;
  userName?: string;
}

export function Header({ userEmail, userName }: HeaderProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setLoggingOut(false);
    }
  };

  // Compute clean display name (e.g. "user01", "trader")
  const cleanEmail = userEmail
    ? userEmail.replace(/@(example\.com|tradelog\.internal)$/i, "")
    : "";
  const displayName = userName || cleanEmail || userEmail || "Trader";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand - matching user's original screenshot */}
          <Link
            href="/"
            className="flex items-center gap-3 group transition-transform active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-shadow">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Trade<span className="text-emerald-600">Log</span>
            </span>
          </Link>

          {/* Right side controls: Profile Avatar with dropdown (Theme toggle removed) */}
          <div className="flex items-center gap-3">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="User profile menu"
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-slate-100 border border-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40 group active:scale-95"
              >
                {/* Profile Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {avatarLetter}
                </div>
                <span className="text-xs font-semibold text-slate-700 hidden sm:inline max-w-[140px] truncate">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </button>

              {/* Profile Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-fade-in text-sm">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Signed in as
                    </p>
                    <p className="text-sm font-bold text-slate-800 truncate mt-0.5">
                      {displayName}
                    </p>
                  </div>

                  {/* Change Password Option */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setPasswordModalOpen(true);
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/70 transition-colors font-medium text-xs sm:text-sm"
                    >
                      <Key className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Change Password</span>
                    </button>
                  </div>

                  {/* Logout Option */}
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="w-full px-4 py-2 text-left flex items-center gap-3 text-rose-600 hover:bg-rose-50 transition-colors font-medium text-xs sm:text-sm disabled:opacity-50"
                    >
                      <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{loggingOut ? "Signing out..." : "Log Out"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </>
  );
}
