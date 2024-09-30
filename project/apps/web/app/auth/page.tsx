"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import { PublicPageWrapper } from "@/components/auth-wrappers/PublicPageWrapper";
import { LANDING } from "@/lib/routes";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <PublicPageWrapper redirect={{ strict: true, defaultUrl: LANDING }}>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>
              {isSignUp ? "Create an account" : "Sign in to your account"}
            </CardTitle>
            <CardDescription>
              {isSignUp
                ? "Enter your details to create a new account"
                : "Enter your credentials to access your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSignUp ? <SignUpForm /> : <SignInForm />}{" "}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="link"
              className="w-full"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PublicPageWrapper>
  );
}
