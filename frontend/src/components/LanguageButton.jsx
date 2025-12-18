import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

function LanguageButton() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "zh" ? "en" : "zh";
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      className="center gap-2 size-fit px-5 py-3 bg-white rounded-3xl shadow-md"
      onClick={toggleLanguage}
    >
      <Globe className="size-5 text-darker-accent" />
      <p className="text-brown font-medium">
        {i18n.language === "en" ? "En" : "中文"}
      </p>
    </button>
  );
}

export default LanguageButton;
