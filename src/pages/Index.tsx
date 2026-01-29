import { tools, categories, getAvailableTools } from "@/lib/tools-data";
import { useApp } from "@/contexts/AppContext";
import { ToolCard } from "@/components/tools/ToolCard";

export default function Index() {
  const { language } = useApp();
  const availableTools = getAvailableTools();
  const comingSoonTools = tools.filter(t => t.status === "coming-soon");

  return (
    <div className="px-4 py-6 animate-page-enter">
      {/* Top Tools */}
      <section className="mb-8">
        <h2 className="text-base font-bold mb-4 text-foreground">Top Tools</h2>
        <div className="grid grid-cols-4 gap-1 stagger-children">
          {availableTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* New Tools */}
      {comingSoonTools.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-bold mb-4 text-foreground">New Tools</h2>
          <div className="grid grid-cols-4 gap-1 stagger-children">
            {comingSoonTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* Category Sections */}
      {categories
        .filter(c => c.id !== "all")
        .map(cat => ({
          ...cat,
          tools: tools.filter(tool => tool.category === cat.id)
        }))
        .filter(cat => cat.tools.length > 0)
        .map((category) => (
          <section key={category.id} className="mb-8">
            <h2 className="text-base font-bold mb-4 text-foreground">
              {language === "np" ? category.labelNp : category.label}
            </h2>
            <div className="grid grid-cols-4 gap-1 stagger-children">
              {category.tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
