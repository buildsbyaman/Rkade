"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import ImageSlider from "@/components/auth/ImageSlider";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Create User
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // 2. Auto Login
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Should not happen if registration worked, but fallback
        router.push("/auth/signin");
      } else {
        router.push("/events");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/events" });
  };

  return (
    <main className="flex min-h-screen bg-[#0e0e0e] text-white overflow-hidden pt-4 pb-35">
      {/* LEFT LOGIN */}
      <section className="w-full lg:w-[40%] flex items-center justify-center p-4 md:p-8 relative">
        {/* Background noise/grids could go here */}

        <div className="w-full max-w-[380px] z-10">
          <div className="mb-6 md:mb-10 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-acid text-black mb-4 shadow-[0_0_20px_rgba(204,255,0,0.3)]">
              <span className="material-symbols-outlined text-3xl">
                person_add
              </span>
            </div>
            <h1 className="text-3xl font-display font-bold uppercase tracking-wide text-white">
              Rkade<span className="text-acid">.</span>
            </h1>
          </div>

          <p className="text-center text-gray-400 mb-8 font-mono text-sm">
            Create your account
          </p>

          <button
            onClick={handleGoogleLogin}
            className="w-full mb-3 py-3 rounded-lg bg-[#1a1a1a] border border-[#333] hover:border-white/20 hover:bg-[#222] transition-all flex items-center justify-center gap-3 group cursor-pointer"
          >
            <svg
              className="w-5 h-5 text-white group-hover:text-acid transition-colors"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-sm font-bold text-gray-200">
              Continue with Google
            </span>
          </button>

          <div className="relative text-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#333]"></div>
            </div>
            <span className="relative bg-[#0e0e0e] px-2 text-xs text-gray-500 uppercase tracking-widest">
              OR
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <div className="flex gap-3 mb-3">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-[#111] border border-[#333] outline-none text-white focus:border-acid/50 focus:bg-[#161616] transition-all placeholder:text-gray-600"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-[#111] border border-[#333] outline-none text-white focus:border-acid/50 focus:bg-[#161616] transition-all placeholder:text-gray-600"
              />
            </div>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mb-3 p-3 rounded-lg bg-[#111] border border-[#333] outline-none text-white focus:border-acid/50 focus:bg-[#161616] transition-all placeholder:text-gray-600"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mb-4 p-3 rounded-lg bg-[#111] border border-[#333] outline-none text-white focus:border-acid/50 focus:bg-[#161616] transition-all placeholder:text-gray-600"
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 rounded-lg bg-acid hover:bg-white hover:text-black text-black font-bold transition-all uppercase tracking-wide text-sm shadow-[0_0_15px_rgba(204,255,0,0.3)] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] cursor-pointer"
            >
              {loading ? "Creating Account..." : "Sign up"}
            </Button>
          </form>

          <p className="text-center text-sm mt-4 md:mt-8 text-gray-500">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-acid hover:underline font-bold cursor-pointer"
            >
              Log in
            </Link>
          </p>
        </div>
      </section>

      {/* RIGHT SLIDER */}
      <ImageSlider />
    </main>
  );
}
