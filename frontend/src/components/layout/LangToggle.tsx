import { useTranslation } from "react-i18next";

export function LangToggle() {
  const { i18n, t } = useTranslation();
  const setLang = (lng: "en" | "hu") => {
    void i18n.changeLanguage(lng);
    localStorage.setItem("lang", lng);
  };

  return (
    <div
      className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm"
      data-testid="lang-selector"
      aria-label={t("lang.label")}
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
          i18n.language === "en"
            ? "bg-slate-900 text-white"
            : "text-slate-600 hover:bg-slate-100"
        }`}
        aria-pressed={i18n.language === "en"}
        data-testid="lang-en"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("hu")}
        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
          i18n.language === "hu"
            ? "bg-slate-900 text-white"
            : "text-slate-600 hover:bg-slate-100"
        }`}
        aria-pressed={i18n.language === "hu"}
        data-testid="lang-hu"
      >
        HU
      </button>
    </div>
  );
}
