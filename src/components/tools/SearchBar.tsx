import { Search } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const { t } = useApp();

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("search.placeholder")}
        className="w-full h-12 pl-4 pr-12 rounded-xl bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
      />
      <button className="absolute right-1 top-1 w-10 h-10 flex items-center justify-center rounded-lg bg-primary touch-feedback">
        <Search className="w-5 h-5 text-primary-foreground" />
      </button>
    </div>
  );
}
