
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import AuthLayout from "./AuthLayout";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type FormValues = z.infer<typeof formSchema>;

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    
    try {
      const { error } = await resetPassword(data.email);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Password reset failed",
          description: error.message || "Unable to send password reset email. Please try again.",
        });
      } else {
        setEmailSent(true);
        toast({
          title: "Password reset email sent",
          description: "Check your email for a link to reset your password.",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Unable to send password reset email at this time. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your email to receive a password reset link">
      {emailSent ? (
        <div className="text-center">
          <p className="text-white mb-6">
            Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
          </p>
          <Button
            asChild
            className="bg-goldAccent text-darkBg hover:bg-goldAccent/90"
          >
            <Link to="/auth/sign-in">Return to Sign In</Link>
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="your.email@example.com"
                      disabled={isLoading}
                      className="bg-darkBg border-darkBorder text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-goldAccent text-darkBg hover:bg-goldAccent/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-400">
                Remember your password?{" "}
                <Link to="/auth/sign-in" className="text-goldAccent hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </Form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
