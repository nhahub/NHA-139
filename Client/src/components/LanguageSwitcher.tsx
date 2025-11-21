import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageSwitcher() {
  // Access the i18n instance and the t function
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Store the selected language
    localStorage.setItem('language', lng);
    // Update HTML direction (RTL for Arabic, LTR otherwise)
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="dark:text-gray-300 dark:hover:bg-gray-700">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover z-50 dark:bg-gray-800 dark:border-gray-700">
        <DropdownMenuItem 
          onClick={() => changeLanguage('en')}
          className={i18n.language === 'en' ? 'bg-muted dark:bg-gray-700' : 'dark:hover:bg-gray-700'}
        >
          {t('language.en')} {/* Translated */}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage('ar')}
          className={i18n.language === 'ar' ? 'bg-muted dark:bg-gray-700' : 'dark:hover:bg-gray-700'}
        >
          {t('language.ar')} {/* Translated */}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}