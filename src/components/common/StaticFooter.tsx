import { useApp } from "@/contexts/AppContext";

export function StaticFooter() {
  const { t } = useApp();

  return (
    <footer className="py-8 text-center">
      <p className="text-sm text-muted-foreground">
        {t("footer.copyright")}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {t("footer.rights")}
      </p>
    </footer>
  );
}
