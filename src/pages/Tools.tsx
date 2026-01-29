import { useState, useMemo } from "react";
import { getToolsByCategory, ToolCategory, tools, categories } from "@/lib/tools-data";
import { SearchBar } from "@/components/tools/SearchBar";
import { ToolCard } from "@/components/tools/ToolCard";
import { Wrench } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export default function Tools() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "all">("all");
  const { language } = useApp();

  const filteredTools = useMemo(() => {
    let result = getToolsByCategory(activeCategory);
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        tool =>
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query)
      );
    }
    return result;
  }, [activeCategory, search]);

  const totalCount = tools.length;
  const availableCount = tools.filter(t => t.status === "available").length;

  return (
    <div className="px-4 py-6 animate-page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">All Tools</h1>
          <p className="text-sm text-muted-foreground">
            {availableCount} available • {totalCount - availableCount} coming soon
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-5">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {/* Categories with Icons */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => {
            const isActive = activeCategory === category.id;
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 touch-feedback ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{language === "np" ? category.labelNp : category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tools Grid - Show all tools */}
      <div className="grid grid-cols-4 gap-1 stagger-children">
        {filteredTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">No tools found</p>
          <p className="text-sm text-muted-foreground mt-1">Try a different search or category</p>
        </div>
      )}
    </div>
  );
}
