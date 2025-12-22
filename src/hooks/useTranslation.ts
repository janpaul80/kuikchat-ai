import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type SupportedLanguage = "en" | "es" | "de" | "fr";

export const languageLabels: Record<SupportedLanguage, string> = {
  en: "English",
  es: "Spanish",
  de: "German",
  fr: "French",
};

export const useTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const translateText = async (text: string, targetLanguage: SupportedLanguage): Promise<string | null> => {
    if (!text.trim()) return null;

    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke("translate", {
        body: { text, targetLanguage },
      });

      if (error) {
        toast({
          title: "Translation failed",
          description: error.message || "Could not translate the message",
          variant: "destructive",
        });
        return null;
      }

      return data.translatedText;
    } catch (err) {
      console.error("Translation error:", err);
      toast({
        title: "Translation failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    translateText,
    isTranslating,
    supportedLanguages: languageLabels,
  };
};
