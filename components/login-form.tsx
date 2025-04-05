"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  redirectTo?: string;
}

export default function LoginForm({ redirectTo = "/" }: LoginFormProps) {
  const router = useRouter();
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [email, setEmail] = useState("");
  const { signIn, verifyOtp, isLoading } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await signIn(data.email, redirectTo);
      setEmail(data.email);
      setShowOtpInput(true);
      toast({
        title: "Check your email",
        description: "We've sent you a login link with a code",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send login link",
        variant: "destructive",
      });
    }
  };

  const onVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const otp = formData.get("otp") as string;

    if (!otp) return;

    try {
      await verifyOtp(email, otp);
      toast({
        title: "Success",
        description: "You have been logged in",
      });

      // Redirect to the specified path after successful login
      console.log(`Redirecting to: ${redirectTo}`);
      router.push(redirectTo);
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid or expired code",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg rounded-xl border-purple-100 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-t-lg border-b border-purple-200">
        <CardTitle className="text-2xl text-purple-800">
          {showOtpInput ? "Enter verification code" : "Sign in to continue"}
        </CardTitle>
        <CardDescription className="text-purple-600">
          {showOtpInput
            ? "Enter the code we sent to your email"
            : "We'll send you a magic link to your email"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {!showOtpInput ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="rounded-lg border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send magic link"
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={onVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification code</Label>
              <Input
                id="otp"
                name="otp"
                type="text"
                placeholder="Enter your code"
                className="rounded-lg border-purple-200 focus:border-purple-400 focus:ring-purple-400 text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify code"
              )}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center bg-gray-50 p-4 rounded-b-lg border-t border-gray-100">
        {showOtpInput && (
          <Button
            variant="ghost"
            onClick={() => setShowOtpInput(false)}
            className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
          >
            Back to login
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
