import { Link } from "react-router-dom";
import { Category } from "@/types/listing";
import * as Icons from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next"; // Import useTranslation

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const { t } = useTranslation(); // Initialize translation hook
  // Dynamically load the icon component
  const Icon = (Icons[category.icon as keyof typeof Icons] as LucideIcon) || Icons.MapPin;

  return (
    <Link to={`/listings?category=${category.slug}`}>
      <Card className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-[#ef4343] dark:bg-gray-700/50">
            <Icon className="h-8 w-8 text-[#ef4343] transition-colors group-hover:text-primary-foreground dark:text-white dark:group-hover:text-white" />
          </div>
          {/* We assume category.name might be translated outside, or used as-is */}
          <h3 className="text-lg font-semibold dark:text-white">{t(`category.name.${category.name}`, category.name)}</h3> 
          {/* Translated Count Display */}
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            {t('category.countDisplay', { count: category.count })}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}