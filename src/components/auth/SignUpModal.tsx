
import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, User } from "lucide-react";

interface SignUpModalProps {
  open: boolean;
  onClose: () => void;
}

const passwordRules = /^(?=.*[0-9])(?=.*[!@#$%^&*()_\-+={[}\]|:;"'<>,.?/~`]).{8,}$/;

export default function SignUpModal({ open, onClose }: SignUpModalProps) {
  const [username, setUsername] = useState("");
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | undefined>();
  const [password, setPassword] = useState("");
  const [showPw1, setShowPw1] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw2, setShowPw2] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setErrors(["Profile picture must be JPG or PNG"]);
        return;
      }
      if (file.size > 1024 * 1024) {
        setErrors(["Profile picture too large (max 1MB)"]);
        return;
      }
      setProfileImg(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfilePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function validate(): string[] {
    const errs: string[] = [];
    if (username.length < 3) errs.push("Username must be at least 3 characters");
    // Simulated check for already-taken username. (Replace with async check with backend)
    if (username.trim().toLowerCase() === "taken") errs.push("Username already taken");
    if (!password.match(passwordRules))
      errs.push("Password must be 8+ chars, include a number and a symbol");
    if (password !== confirmPassword) errs.push("Passwords do not match");
    if (!profileImg) errs.push("Profile picture is required");
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    setLoading(true);
    // Simulate signup
    setTimeout(() => {
      setLoading(false);
      onClose();
      window.location.replace("/");
    }, 1000);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-0 overflow-hidden rounded-xl max-w-md">
        <form onSubmit={handleSubmit} className="p-8 bg-white dark:bg-[#222] space-y-5">
          <DialogHeader>
            <DialogTitle className="text-2xl mb-1 text-[#7E69AB]">Sign Up</DialogTitle>
            <DialogDescription>Create a new account to start sharing with your groups</DialogDescription>
          </DialogHeader>

          {/* Profile image upload/preview */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-20 h-20 rounded-full bg-[#F1F0FB] dark:bg-[#333] flex items-center justify-center overflow-hidden border border-[#DED6FF] mb-3">
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="Profile Preview"
                  className="object-cover w-full h-full"
                  />
              ) : (
                <User className="text-[#B39DDB] w-10 h-10" />
              )}
              <button
                type="button"
                className="absolute z-10 bottom-1 right-1 px-2 py-1 rounded-full bg-white border transition shadow hover:bg-[#F1F1F1]"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Choose profile image"
              >
                <span className="text-xs text-[#9b87f5] font-semibold">Edit</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-left font-semibold mb-1" htmlFor="signup-username">Username</label>
            <Input
              id="signup-username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              minLength={3}
              autoComplete="username"
              placeholder="Choose a unique username"
            />
          </div>
          {/* Password */}
          <div>
            <label className="block text-left font-semibold mb-1" htmlFor="signup-pw">Password</label>
            <div className="relative">
              <Input
                id="signup-pw"
                type={showPw1 ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Password (8+ chars, 1 number & symbol)"
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-[#7E69AB] transition"
                onClick={() => setShowPw1((v) => !v)}
                tabIndex={-1}
                aria-label={showPw1 ? "Hide password" : "Show password"}
              >
                {showPw1 ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>
          {/* Confirm Password */}
          <div>
            <label className="block text-left font-semibold mb-1" htmlFor="signup-pw2">Confirm Password</label>
            <div className="relative">
              <Input
                id="signup-pw2"
                type={showPw2 ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-[#7E69AB] transition"
                onClick={() => setShowPw2((v) => !v)}
                tabIndex={-1}
                aria-label={showPw2 ? "Hide password" : "Show password"}
              >
                {showPw2 ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>
          {/* Errors */}
          {errors.length > 0 && (
            <div className="space-y-1 bg-red-50 rounded p-2 text-sm text-red-600">
              {errors.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button
              className="w-full bg-[#7E69AB] hover:bg-[#9b87f5] transition-all"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing Up..." : "Sign Up"}
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
