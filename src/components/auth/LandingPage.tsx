
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import LoginModal from "./LoginModal";
import SignUpModal from "./SignUpModal";

export default function LandingPage() {
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignUp, setOpenSignUp] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#D6BCFA] via-[#E5DEFF] to-[#F2FCE2] dark:from-[#1A1F2C] dark:to-[#403E43] transition-colors">
      <div className="bg-white/90 dark:bg-[#222]/80 shadow-xl rounded-2xl p-8 max-w-sm w-full flex flex-col items-center text-center gap-6 border border-white/10">
        <img
          src="/placeholder.svg"
          alt="App Logo"
          className="w-16 h-16 mb-2 rounded-full shadow-xl"
        />
        <h1 className="text-3xl font-bold mb-1 text-[#9b87f5]">
          GroupGlow Social Hub
        </h1>
        <p className="text-neutral-500 mb-6">The private group feed for your closest circles.</p>
        <div className="flex gap-4 w-full">
          <Button
            className="flex-1 bg-[#9b87f5] hover:bg-[#6E59A5] text-white transition-all"
            onClick={() => setOpenLogin(true)}
          >
            Log In
          </Button>
          <Button
            className="flex-1 bg-[#7E69AB] hover:bg-[#9b87f5] text-white transition-all"
            onClick={() => setOpenSignUp(true)}
            variant="secondary"
          >
            Sign Up
          </Button>
        </div>
      </div>
      <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />
      <SignUpModal open={openSignUp} onClose={() => setOpenSignUp(false)} />
    </div>
  );
}
