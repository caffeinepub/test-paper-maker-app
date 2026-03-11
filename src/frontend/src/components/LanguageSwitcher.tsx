import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { LANGUAGES, type Language } from "../lib/i18n/translations";
import { useLanguage } from "../lib/i18n/useLanguage";

interface LanguageSwitcherProps {
  variant?: "compact" | "full";
  className?: string;
}

export function LanguageSwitcher({
  variant = "compact",
  className = "",
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  const currentLang = LANGUAGES.find((l) => l.code === language);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {variant === "full" && (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Globe className="h-4 w-4" />
          <span>Language</span>
        </div>
      )}
      <Select
        value={language}
        onValueChange={(val) => setLanguage(val as Language)}
      >
        <SelectTrigger
          className="h-8 gap-1 border-border bg-background text-sm"
          style={{
            minWidth: variant === "full" ? "160px" : "auto",
            width: variant === "full" ? "200px" : "auto",
          }}
          data-ocid="language_switcher.select"
        >
          {variant === "compact" ? (
            <div className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5 shrink-0" />
              <span>{currentLang?.nativeLabel ?? "EN"}</span>
            </div>
          ) : (
            <SelectValue placeholder="Select language" />
          )}
        </SelectTrigger>
        <SelectContent
          className="max-h-72"
          data-ocid="language_switcher.dropdown_menu"
        >
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="font-medium">{lang.nativeLabel}</span>
              {variant === "full" && (
                <span className="ml-2 text-xs text-muted-foreground">
                  {lang.label}
                </span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
