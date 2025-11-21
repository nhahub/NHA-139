import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
// import { Checkbox } from "@/components/ui/checkbox"; // Not used in provided snippet
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useFilterStore } from "@/store/useFilterStore";
import { useTranslation } from "react-i18next"; // Import useTranslation

export function SearchFilters() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation(); // Initialize translation hook

  const {
    search,
    categories: selectedCategories,
    priceRange,
    distance,
    setSearch,
    setCategories,
    setPriceRange,
    setDistance,
    resetFilters,
  } = useFilterStore();

  const handleCategoryToggle = (categorySlug: string) => {
    if (selectedCategories.includes(categorySlug)) {
      setCategories(selectedCategories.filter((c) => c !== categorySlug));
    } else {
      setCategories([...selectedCategories, categorySlug]);
    }
  };

  const activeFiltersCount =
    selectedCategories.length +
    (priceRange[0] !== 0 || priceRange[1] !== 500 ? 1 : 0) +
    (distance !== 50 ? 1 : 0);

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-gray-500" />
        <Input
          type="text"
          placeholder={t("search.placeholder")} {/* Translated */}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="relative dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 dark:text-white dark:hover:text-white">
            <SlidersHorizontal className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
            {t("filter.button")} {/* Translated */}
            {activeFiltersCount > 0 && (
              <span className="ml-1 rounded-full bg-[#ef4343] px-1.5 py-0.5 text-xs text-white">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto dark:bg-gray-900 dark:border-gray-700">
          <SheetHeader>
            <SheetTitle className="dark:text-white">{t("filter.sheetTitle")}</SheetTitle> {/* Translated */}
            <SheetDescription className="dark:text-gray-400">
              {t("filter.sheetDesc")} {/* Translated */}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Categories */}
            <div>
              <Label className="mb-3 block text-base dark:text-white">{t("filter.label.categories")}</Label> {/* Translated */}
              {/* Note: Category rendering logic is omitted, but categories would be rendered here */}
            </div>

            {/* Price Range */}
            <div>
              <Label className="mb-3 block text-base dark:text-white">
                {t("filter.label.priceRange")}{" "}
                <span className="font-bold">${priceRange[0]} - ${priceRange[1]}</span>
              </Label> {/* Translated */}
              <Slider
                min={0}
                max={500}
                step={10}
                value={priceRange}
                onValueChange={(value) =>
                  setPriceRange(value as [number, number])
                }
                className="mt-2"
              />
            </div>

            {/* Distance */}
            <div>
              <Label className="mb-3 block text-base dark:text-white">
                {t("filter.label.distance")}{" "}
                <span className="font-bold">
                  {distance} {t("filter.unit.km")}
                </span>
              </Label> {/* Translated */}
              <Slider
                min={1}
                max={100}
                step={1}
                value={[distance]}
                onValueChange={(value) => setDistance(value[0])}
                className="mt-2"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                onClick={() => {
                  resetFilters();
                  setOpen(false);
                }}
              >
                <X className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                {t("filter.clear")} {/* Translated */}
              </Button>
              <Button className="flex-1 bg-[#ef4343] hover:bg-[#ff7e7e]" onClick={() => setOpen(false)}>
                {t("filter.apply")} {/* Translated */}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}