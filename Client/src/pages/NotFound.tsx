import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next"; // 1. Import useTranslation

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation(); // 2. Initialize translation hook

  useEffect(() => {
    // 3. Translate the console error log
    console.error(`404 Error: ${t('notFound.errorLog')}`, location.pathname);
  }, [location.pathname, t]); // Add 't' to the dependency array

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-background">
      <div className="text-center">
        {/* 4. The 404 code remains untranslated */}
        <h1 className="mb-4 text-6xl font-extrabold text-[#ef4343] dark:text-white">404</h1>
        
        {/* 5. Translate the main message */}
        <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">
          {t('notFound.title')}
        </p>
        
        {/* 6. Translate the link text */}
        <a 
          href="/" 
          className="px-6 py-3 bg-[#ef4343] text-white rounded-lg hover:bg-[#ff7e7e] transition font-semibold"
        >
          {t('notFound.returnHome')}
        </a>
      </div>
    </div>
  );
};

export default NotFound;