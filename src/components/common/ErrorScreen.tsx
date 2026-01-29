import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";

interface ErrorScreenProps {
  onRetry?: () => void;
}

export function ErrorScreen({ onRetry }: ErrorScreenProps) {
  const navigate = useNavigate();
  const { t } = useApp();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center animate-fade-up bg-background">
      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <AlertTriangle className="w-10 h-10 text-destructive" />
      </div>
      <h1 className="text-xl font-semibold text-foreground mb-2">
        {t("error.title")}
      </h1>
      <p className="text-muted-foreground mb-8">
        Please check your connection and try again.
      </p>
      <div className="flex gap-3">
        {onRetry && (
          <button 
            onClick={onRetry} 
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium touch-feedback"
          >
            {t("error.retry")}
          </button>
        )}
        <button 
          onClick={() => navigate(-1)} 
          className="px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium touch-feedback"
        >
          {t("error.back")}
        </button>
      </div>
    </div>
  );
}
