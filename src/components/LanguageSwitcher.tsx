import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 border-0 hover:bg-white/70"
      onClick={toggleLanguage}
      title={i18n.language === 'en' ? 'Français' : 'English'}
    >
      <Languages className="h-4 w-4" />
    </Button>
  );
}