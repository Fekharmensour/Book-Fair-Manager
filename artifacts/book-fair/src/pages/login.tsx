import { useState } from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "@/components/language-toggle";

export default function Login() {
  const [username, setUsername] = useState("");
  const [, setLocation] = useLocation();
  const loginMutation = useLogin();
  const { login } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    loginMutation.mutate(
      { data: { username } },
      {
        onSuccess: (user) => {
          login(user);
          toast({
            title: `${t("welcome")}, ${user.username}!`,
            description: t("readyForFair"),
          });
          setLocation(user.isAdmin ? "/admin" : "/pos");
        },
        onError: (error: any) => {
          toast({
            variant: "destructive",
            title: t("loginFailed"),
            description: error?.error || t("loginErrorDesc"),
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm flex justify-between items-center mb-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t("backToShop")}
          </Button>
        </Link>
        <LanguageToggle />
      </div>
      <Card className="w-full max-w-sm shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="mx-auto w-24 h-24 flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <CardTitle className="text-xl font-serif text-foreground leading-tight">{t("appName")}</CardTitle>
            <CardDescription>{t("enterUsernameToStart")}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder={t("username")}
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
              {loginMutation.isPending ? t("loggingIn") : t("enter")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
