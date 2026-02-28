"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Chrome } from "lucide-react";

export default function SignInPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const providers = [
    { id: "google", name: "Google", icon: Chrome },
    { id: "github", name: "GitHub", icon: Github },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Health Journal</CardTitle>
          <CardDescription>Sign in to track your health journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {providers.map((provider) => {
            const Icon = provider.icon;
            return (
              <Button
                key={provider.id}
                variant="outline"
                className="w-full"
                onClick={() => signIn(provider.id, { callbackUrl: "/dashboard" })}
              >
                <Icon className="mr-2 h-4 w-4" />
                Sign in with {provider.name}
              </Button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
