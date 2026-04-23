import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function LanguageToggle({ variant = "outline" }: { variant?: "outline" | "ghost" }) {
  const { lang, toggleLang } = useI18n();
  return (
    <Button
      variant={variant}
      size="sm"
      onClick={toggleLang}
      className="gap-2 h-9"
      aria-label="Toggle language"
    >
      <Globe className="w-4 h-4" />
      <span className="font-medium">{lang === "en" ? "العربية" : "English"}</span>
    </Button>
  );
}
