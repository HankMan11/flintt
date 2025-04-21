
import React, { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const passwordRules = /^(?=.*[0-9])(?=.*[!@#$%^&*()_\-+={[}\]|:;"'<>,.?/~`]).{8,}$/;

export default function AuthPage() {
  const { user, session, signIn, signUp, loading } = useSupabaseAuth();
  const [form, setForm] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const navigate = useNavigate();

  React.useEffect(() => {
    if (user && session) {
      navigate("/"); // Redirect when signed in.
    }
  }, [user, session, navigate]);

  // Handle avatar file input with preview and file size/type limit
  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Profile picture must be JPG or PNG");
      return;
    }
    if (file.size > 1024 * 1024) {
      setError("Profile picture too large (max 1MB)");
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  // Upload avatar to Supabase storage bucket "avatars"
  async function uploadAvatar(file: File) {
    const BUCKET = "avatars";
    const fileName = `${Date.now()}-${file.name}`;
    let uploadResult;
    try {
      uploadResult = await import("@/integrations/supabase/client").then(({ supabase }) =>
        supabase.storage.from(BUCKET).upload(fileName, file, { upsert: true })
      );
    } catch (error) {
      console.error("Exception while trying to upload avatar:", error);
      throw new Error("Avatar upload failed (unexpected error)");
    }
    const { data, error } = uploadResult;
    if (error) {
      console.error("Supabase bucket upload error:", error);
      throw new Error("Profile picture upload failed: " + (error.message || "Unknown error"));
    }
    // Get public URL
    const { data: urlData } = await import("@/integrations/supabase/client").then(({ supabase }) =>
      supabase.storage.from(BUCKET).getPublicUrl(fileName)
    );
    return urlData?.publicUrl ?? null;
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);

    // Username is required and min 3 chars
    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (!email || !email.includes("@")) {
      setError("Valid email required");
      return;
    }
    if (!password.match(passwordRules)) {
      setError("Password must be 8+ chars, include a number and a symbol");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!avatarFile) {
      setError("Profile picture is required");
      return;
    }

    setSubmitting(true);

    let avatar_url: string | undefined = undefined;
    try {
      // Upload avatar first - with new approach we don't need a user ID
      avatar_url = await uploadAvatar(avatarFile);

      const { error: signUpError } = await signUp({ email, password, username, avatar_url });
      if (signUpError) {
        setError(signUpError.message?.includes("duplicate") ? "Username or email already taken" : signUpError.message);
        setSubmitting(false);
        return;
      }
      
      toast({
        title: "Account created!",
        description: "Your account has been created successfully. Please check your email for verification.",
      });
    } catch (err: any) {
      setError("Sign up failed. " + (err?.message || ""));
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    // Success: Supabase will redirect after verifying session
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);

    if (!email || !password) {
      setError("Email and password required");
      return;
    }
    setSubmitting(true);

    const { error: loginError } = await signIn({ email, password });
    if (loginError) {
      setError("Invalid login (check email and password)");
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#D6BCFA] via-[#E5DEFF] to-[#F2FCE2] dark:from-[#1A1F2C] dark:to-[#403E43]">
      <div className="rounded-2xl shadow-xl p-8 max-w-sm w-full bg-white/90 dark:bg-[#222]/90 flex flex-col text-center gap-4 border">
        <h1 className="text-2xl font-bold text-[#9b87f5]">{form === "login" ? "Welcome Back" : "Create Account"}</h1>
        <div className="flex gap-2 mb-2 justify-center">
          <Button size="sm" variant={form === "login" ? "default" : "outline"} onClick={() => setForm("login")}>Log In</Button>
          <Button size="sm" variant={form === "signup" ? "default" : "outline"} onClick={() => setForm("signup")}>Sign Up</Button>
        </div>
        {form === "signup" ? (
          <form className="space-y-4" onSubmit={handleSignUp}>
            {/* Avatar upload */}
            <div className="flex flex-col items-center">
              <div className="relative w-20 h-20 mb-3 rounded-full bg-[#F1F0FB] dark:bg-[#333] flex items-center justify-center overflow-hidden border">
                {avatarPreview ? (
                  <img src={avatarPreview} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <User className="w-8 h-8 text-[#B39DDB]" />
                )}
                <input type="file" accept="image/*" onChange={handleAvatar} className="absolute inset-0 opacity-0 cursor-pointer" aria-label="Choose profile image"/>
              </div>
            </div>
            <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
            <Input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" minLength={3} required />
            <Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required autoComplete="new-password" />
            <Input placeholder="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={8} required autoComplete="new-password" />
            <Button className="w-full bg-[#9b87f5] hover:bg-[#6E59A5]" type="submit" disabled={submitting}>{submitting ? "Signing Up..." : "Sign Up"}</Button>
            {error && <div className="text-red-500 text-sm">{error}</div>}
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleLogin}>
            <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
            <Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required autoComplete="current-password" />
            <Button className="w-full bg-[#7E69AB] hover:bg-[#9b87f5]" type="submit" disabled={submitting}>{submitting ? "Logging in..." : "Log In"}</Button>
            {error && <div className="text-red-500 text-sm">{error}</div>}
          </form>
        )}
      </div>
    </div>
  );
}
