"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Toaster, toast } from "sonner";
import Cookies from "js-cookie";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check if the user is already logged in
    const token = Cookies.get("token");
    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  const onLogin = async () => {
    try {
      if (!user.email || !user.password) {
        toast.error("Please fill in all fields");
        return;
      }

      setLoading(true);
      const response = await axios.post("/api/users/login", user);

      if (response.status === 200) {
        toast.success("Login successful");
        Cookies.set("token", response.data.token);
        router.replace("/dashboard");
      }
    } catch (error: any) {
      console.log("Login failed", error.message);
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Toaster position="top-center" richColors />

      <div className="w-full max-w-md">
        <Card className="border-none shadow-xl bg-white/[0.02] backdrop-blur-md">
          <CardHeader className="space-y-1 items-center text-center pb-4">
            <div className="flex justify-center mb-2">
              <img src="/zapllo.png" alt="Zapllo Logo" className="h-12" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Admin Portal</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@zapllo.com"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-slate-100"
                onKeyDown={handleKeyDown}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-slate-300">
                  Password
                </Label>
                {/* Optional password reset link
                <Button variant="link" className="px-0 text-xs text-slate-400 hover:text-slate-300">
                  Forgot password?
                </Button>
                */}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={user.password}
                  onChange={(e) => setUser({ ...user, password: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-slate-100 pr-10"
                  onKeyDown={handleKeyDown}
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-slate-400 hover:text-slate-100"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 text-white font-medium"
              onClick={onLogin}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-4 text-center text-sm text-slate-500">
          <p>All Rights Reserved  © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}
