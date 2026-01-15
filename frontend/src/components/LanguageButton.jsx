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
      className="center gap-2 size-fit px-5 py-3 bg-white rounded-3xl shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 hover:bg-gray-50"
      onClick={toggleLanguage}
    >
      <Globe className="size-5 text-darker-accent transition-transform duration-200 hover:rotate-12" />
      <p className="text-brown font-medium">
        {i18n.language === "en" ? "En" : "中文"}
      </p>
    </button>
  );
}

export default LanguageButton;
