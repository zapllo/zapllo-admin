"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Input } from "@/components/ui/input";
import GradientText from "@/components/magicui/gradient";
import { Label } from "@/components/ui/label";
import { ShiningButton } from "@/components/ui/shiningbutton";
import { Button } from "@/components/ui/button";
import Meteors from "@/components/magicui/meteors";
import Cookies from "js-cookie";
import { Toaster, toast } from "sonner";
import { cn } from "@/lib/utils";
import { Home } from "lucide-react";
import Loader from "@/components/ui/loader"; // Import the Loader component
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [userLoading, setUserLoading] = useState<boolean | null>(false);
    const [user, setUser] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false); // State for showing/hiding password

    useEffect(() => {
        // Check if the user is already logged in
        const token = Cookies.get("token");
        if (token) {
            router.replace("/dashboard");
        }
    }, [router]);


    const onLogin = async () => {
        try {
            setLoading(true);
            setUserLoading(true)
            const response = await axios.post("/api/users/login", user);
            if (response.status === 200) {
                Cookies.set("token", response.data.token);
                router.replace("/dashboard");
            }
        } catch (error: any) {
            console.log("Login failed", error.message);
            toast.error("Invalid credentials"); // Display error toast
        } finally {
            setLoading(false);
            setUserLoading(false)
        }
    };

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    return (
        <>
            {userLoading && (
                <div className="absolute  w-screen h-screen  z-[100]  inset-0 bg-black -900  bg-opacity-90 rounded-xl flex justify-center items-center">

                    <div
                        className=" z-[100] bg-black  max-h-screen max-w-screen text-[#D0D3D3] w-[100%] rounded-lg ">
                        <div className="">
                            <div className="absolute z-50 inset-0 flex flex-col items-center justify-center text-white font-bold px-4 pointer-events-none text-3xl text-center md:text-4xl lg:text-7xl">

                                <img src="/zapllo.png" className="h-[15%] animate-pulse" />
                                <p className="bg-clip-text text-transparent drop-shadow-2xl bg-gradient-to-b text-sm from-white/80 to-white/20">
                                    Loading...
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="relative flex bg-[#211123] h-screen z-[50] items-center justify-center overflow-hidden rounded-lg bg-background md:shadow-xl">
                <div className="z-[100] bg-[#211123]">
                    <Meteors number={30} />
                </div>
                <div className="max-w-md w-full mt-4 z-[100] mx-auto rounded-none md:rounded-2xl p-8 shadow-input bg-[#FEFEFE] dark:bg-black">
                    <div className="flex justify-center">
                        <img src='/zapllo.png' className="h-7 " />
                    </div>
                    <p className="text-neutral-600 text-sm font-bold text-center max-w-sm mt-2 dark:text-neutral-300">
                        Admin Login
                    </p>
                    <div className="my-8">
                        <LabelInputContainer className="mb-4">
                            <h1 className="text-xs absolute ml-2 bg-[#FEFEFE] text-[#000000] ">Email address</h1>

                            <Input
                                id="email"
                                type="email"
                                className=" "
                                value={user.email}
                                onChange={(e) => setUser({ ...user, email: e.target.value })}
                                placeholder="example@gmail.com"
                            />
                        </LabelInputContainer>
                        <LabelInputContainer className="relative mb-4">
                            <h1 className="text-xs absolute ml-2 bg-[#FEFEFE] text-[#000000]  ">Password</h1>
                            <Input
                                id="password"
                                placeholder="Enter password"
                                value={user.password}
                                onChange={(e) => setUser({ ...user, password: e.target.value })}
                                type={showPassword ? "text" : "password"} // Toggle between text and password
                            />
                            <div
                                className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? <Eye className=" text-[#787CA5]" size={18} /> : <EyeOff className=" text-[#787CA5]" size={18} />}
                            </div>
                        </LabelInputContainer>
                        <button
                            className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                            type="submit"
                            onClick={onLogin}
                        >
                            Login →
                            <BottomGradient />
                        </button>
                        {/* <div className="p-4 flex justify-center">
                            <Link href="/signup" className="text-center hover:underline mt-2">
                                Not a <span className="bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-clip-text text-transparent font-bold">Zapllonian</span>? Register Here
                            </Link>
                        </div> */}
                        {/* <div className="text-center mt-4 ">
                            <Link href="/forgetPassword" className="hover:underline">
                                Forgot your password?
                            </Link>
                        </div> */}
                       
              
                        
                    </div>
                </div>
            </div>
        </>
    );
}

const BottomGradient = () => {
    return (
        <>
            <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
        </>
    );
};

const LabelInputContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className={cn("flex flex-col space-y-2 w-full", className)}>
            {children}
        </div>
    );
};
