import { useEffect } from "react"; // Added useEffect
import { tools, categories, getAvailableTools } from "@/lib/tools-data";
import { useApp } from "@/contexts/AppContext";
import { ToolCard } from "@/components/tools/ToolCard";

// ✅ Added Interface to handle user and onReady signal
interface IndexProps {
  user: any;
  onReady?: () => void;
}

export default function Index({ user, onReady }: IndexProps) {
  const { language, t } = useApp();
  
  // ✅ Signal that the Home Page is ready once it mounts
  useEffect(() => {
    if (onReady) {
      // Use requestAnimationFrame to ensure the DOM has actually painted
      const handle = requestAnimationFrame(() => {
        onReady();
      });
      return () => cancelAnimationFrame(handle);
    }
  }, [onReady]);

  // 1. Get all available tools
  const availableTools = getAvailableTools();
  
  // 2. Limit Top Tools to exactly the first 8
  const topTools = availableTools.slice(0, 8);
  
  const comingSoonTools = tools.filter(t => t.status === "coming-soon");

  // ✅ Get First Name for greeting
  const firstName = user?.displayName ? user.displayName.split(" ")[0] : null;

  return (
    <div className="px-4 py-6 animate-page-enter">
      {/* ✅ Minimal Welcome Greeting */}
      {firstName && (
        <div className="mb-4 px-1 text-left">
          <p className="text-sm font-medium text-muted-foreground">
            {t("index.welcome")}, <span className="text-primary font-semibold">{firstName}</span>
          </p>
        </div>
      )}

      {/* Top Tools - Limited to 8 */}
      <section className="mb-8">
        <h2 className="text-base font-bold mb-4 text-foreground">{t("section.top")}</h2>
        <div className="grid grid-cols-4 gap-1 stagger-children">
          {topTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* New Tools */}
      {comingSoonTools.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-bold mb-4 text-foreground">{t("status.coming")}</h2>
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