import { categories, ToolCategory } from "@/lib/tools-data";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

interface CategoryChipsProps {
  activeCategory: ToolCategory | "all";
  onSelect: (category: ToolCategory | "all") => void;
}

export function CategoryChips({ activeCategory, onSelect }: CategoryChipsProps) {
  const { language } = useApp();

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap touch-feedback transition-colors",
            activeCategory === cat.id
              ? "bg-primary text-primary-foreground"
              : "bg-surface text-surface-foreground"
          )}
        >
          {language === "np" ? cat.labelNp : cat.label}
        </button>
      ))}
    </div>
  );
}
