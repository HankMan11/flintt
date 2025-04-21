
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Fake login validation (replace with backend check)
    setTimeout(() => {
      setLoading(false);
      if (username !== "demo" || password !== "Demo#2024") {
        setError("Invalid username or password");
      } else {
        // "Log in" success
        window.location.replace("/");
        onClose();
      }
    }, 1000);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-0 overflow-hidden rounded-xl max-w-md">
        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white dark:bg-[#222]">
          <DialogHeader>
            <DialogTitle className="text-2xl mb-1 text-[#9b87f5]">Welcome back!</DialogTitle>
            <DialogDescription>Sign in to access your groups</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="block text-left font-semibold mb-1" htmlFor="username">Username</label>
            <Input
              id="username"
              required
              value={username}
              autoFocus
              minLength={3}
              placeholder="yourusername"
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-left font-semibold mb-1" htmlFor="login-pw">Password</label>
            <div className="relative">
              <Input
                id="login-pw"
                type={showPw ? "text" : "password"}
                required
                value={password}
                minLength={8}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-[#9b87f5] transition"
                onClick={() => setShowPw((v) => !v)}
                tabIndex={-1}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="stay-signed-in" checked={staySignedIn} onCheckedChange={() => setStaySignedIn((v) => !v)} />
            <label htmlFor="stay-signed-in" className="text-sm">
              Stay signed in
            </label>
          </div>
          {error && (
            <div className="text-red-500 bg-red-50 rounded p-2 text-sm text-center">{error}</div>
          )}
          <DialogFooter>
            <Button
              className="w-full bg-[#9b87f5] hover:bg-[#6E59A5] transition-all"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Log In"}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="ghost" className="w-full mt-2" onClick={onClose}>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
