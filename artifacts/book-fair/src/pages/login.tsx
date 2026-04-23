import { useState } from "react";
import { useLocation } from "wouter";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [, setLocation] = useLocation();
  const loginMutation = useLogin();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    loginMutation.mutate(
      { data: { username } },
      {
        onSuccess: (user) => {
          login(user);
          toast({
            title: `Welcome, ${user.username}!`,
            description: "Ready for the book fair.",
          });
          setLocation("/");
        },
        onError: (error: any) => {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: error?.error || "Could not log in. Try again.",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="mx-auto bg-primary/10 w-16 h-16 flex items-center justify-center rounded-2xl">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-serif text-foreground">Book Fair POS</CardTitle>
            <CardDescription>Enter your username to start selling</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 text-lg text-center"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-lg font-medium"
              disabled={!username.trim() || loginMutation.isPending}
            >
              {loginMutation.isPending ? "Logging in..." : "Enter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
