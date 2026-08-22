"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { persistSession, resolveSessionFromUsername } from "@/lib/session";

/**
 * Pixel reference: docs/project-plan.html (login the reference). Split hero
 * layout, ICAR mark + zone seal, username/password with reveal toggle.
 * No auth call is wired up yet - Step 2/3 of the build (database) replaces
 * the submit handler below with a real sign-in request.
 */
export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="/brand/hero-farmland.jpg"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/35 to-transparent" />
        <div className="absolute bottom-14 left-12 right-12 text-white">
          <p className="text-sm font-semibold tracking-wider uppercase">
            AMS - ATARI Zone (IV) Patna
          </p>
          <h1 className="mt-3 text-5xl leading-[1.1] font-bold text-shadow-lg">
            ICAR - Agricultural Technology Application Research Institute
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/90">
            ATARI is mandated for Coordination and Monitoring of Technology
            Application and Frontline Extension Education Programmes.
            <br />
            Strengthening Agricultural Extension Research and Knowledge
            Management.
          </p>
        </div>
      </div>

      {/* Exact background sampled from the reference login screen (#f1eee4) -
 distinct from the app's regular off-white content background. */}
      <div className="flex w-full flex-col items-center justify-center bg-[#f1eee4] px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between">
            <Image
              src="/brand/icar-logo.png"
              alt="ICAR"
              width={812}
              height={1084}
              className="h-20 w-auto"
            />
            <Image
              src="/brand/zone-seal-patna.png"
              alt="ATARI Zone IV Patna"
              width={1254}
              height={1254}
              className="h-20 w-20 rounded-full"
            />
          </div>

          <h2 className="text-4xl font-bold text-[#034541]">Welcome Back!</h2>

          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              // No auth check yet - the role is inferred from the username
              // pattern (e.g. "kvkbhagalpur@...") rather than a real
              // credential lookup. Replace with a real sign-in call once
              // the database is connected; the resulting session shape
              // (role decided once, here, not switched later) stays the same.
              persistSession(resolveSessionFromUsername(username));
              router.push("/dashboard");
            }}
          >
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-sm font-semibold text-[#034541]"
              >
                Username
              </label>
              <Input
                id="username"
                placeholder="Enter Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                className="h-13 rounded-lg border-black/15 bg-transparent px-4 text-base placeholder:text-muted-foreground/80"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-semibold text-[#034541]"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  className="h-13 rounded-lg border-black/15 bg-transparent px-4 pr-11 text-base placeholder:text-muted-foreground/80"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="size-4.5" />
                  ) : (
                    <Eye className="size-4.5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="h-13 w-full rounded-lg bg-[#034541] text-base font-semibold text-white hover:bg-[#034541]/90"
            >
              Continue
            </Button>
          </form>

          <div className="mt-6 space-y-1 text-center text-sm">
            <a
              href="#"
              className="block text-[#034541] underline underline-offset-2"
            >
              Download User Manual
            </a>
            <a
              href="#"
              className="block font-semibold text-destructive underline underline-offset-2"
            >
              Feedback / Help &amp; Support: Google Form
            </a>
            <p className="text-muted-foreground">
              Or reach out to us at{" "}
              <a
                href="mailto:atariams.kvk@gmail.com"
                className="text-[#034541]"
              >
                atariams.kvk@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
