"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Layers,
  Lock,
  Mail,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { loginUser } from "@/actions/auth";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginInput) => {
    setIsSubmitting(true);
    try {
      const res = await loginUser(values);
      if (res.success) {
        toast.success("Welcome back to JobTrackr!");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(res.error || "Invalid email or password");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to sign in. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-50 dark:bg-[#08090e] relative selection:bg-indigo-500 selection:text-white">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="flex items-center gap-2.5 group mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Layers className="h-6 w-6" />
            </div>
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Welcome to JobTrackr
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Sign in to manage your applications and AI resume matches
          </p>
        </div>

        {/* Main Sign In Card */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold">Sign In to Your Account</CardTitle>
            <CardDescription>Enter your email and password credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="candidate@example.com"
                  {...register("email")}
                  className={errors.email ? "border-rose-500 ring-rose-500/20" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-rose-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={errors.password ? "border-rose-500 ring-rose-500/20" : ""}
                />
                {errors.password && (
                  <p className="text-xs text-rose-500">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full h-11 text-sm font-bold shadow-indigo-500/25 mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-800/80 pt-4 text-xs text-slate-500 dark:text-slate-400">
            <span>Don&apos;t have an account?</span>
            <Link
              href="/register"
              className="ml-1 font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Sign Up
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
