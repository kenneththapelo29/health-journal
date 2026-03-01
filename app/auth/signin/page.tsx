"use client";
import { signIn, getProviders } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";

interface Provider {
  id: string;
  name: string;
}

const PROVIDER_ICONS: Record<string, string> = {
  google: "🔵",
  github: "⚫",
};

export default function SignInPage() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null);

  useEffect(() => {
    getProviders().then(setProviders);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-2">
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Health Journal</h1>
          <p className="text-muted-foreground">Your personal health tracking dashboard</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Sign in to access your health dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {providers
              ? Object.values(providers).map((provider) => (
                  <Button
                    key={provider.id}
                    variant="outline"
                    className="w-full h-12 text-base"
                    onClick={() => signIn(provider.id, { callbackUrl: "/dashboard" })}
                  >
                    <span className="mr-3 text-lg">{PROVIDER_ICONS[provider.id] || "🔑"}</span>
                    Continue with {provider.name}
                  </Button>
                ))
              : (
                <div className="space-y-3">
                  <div className="h-12 bg-muted animate-pulse rounded-md" />
                  <div className="h-12 bg-muted animate-pulse rounded-md" />
                </div>
              )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By signing in, you agree that your health data is stored securely and privately.
        </p>
      </div>
    </div>
  );
}

