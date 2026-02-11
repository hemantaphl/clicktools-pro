import { useEffect } from "react"; // Added useEffect
import { useParams, useNavigate } from "react-router-dom";
import { getToolById } from "@/lib/tools-data";
import { ErrorScreen } from "@/components/common/ErrorScreen";
import { EmiCalculator } from "@/components/tools/EmiCalculator";
import { PasswordStrength } from "@/components/tools/PasswordStrength";
import { SubnetCalculator } from "@/components/tools/SubnetCalculator";
import { HashGenerator } from "@/components/tools/HashGenerator";
import { QrScanner } from "@/components/tools/QrScanner";
import { ColorPicker } from "@/components/tools/ColorPicker";
import { PortChecker } from "@/components/tools/PortChecker";
import { SslChecker } from "@/components/tools/SslChecker";
import { Base64Encoder } from "@/components/tools/Base64Encoder";
import { AgeCalculator } from "@/components/tools/AgeCalculator";
import { DateConverter } from "@/components/tools/DateConverter";
import { UnitConverter } from "@/components/tools/UnitConverter";
import { CurrencyConverter } from "@/components/tools/CurrencyConverter";
import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';

const toolComponents: Record<string, React.ComponentType> = {
  "qr-scanner": QrScanner,
  "emi-calculator": EmiCalculator,
  "password-strength": PasswordStrength,
  "subnet-calculator": SubnetCalculator,
  "hash-generator": HashGenerator,
  "color-picker": ColorPicker,
  "port-checker": PortChecker,
  "ssl-checker": SslChecker,
  "base64-encoder": Base64Encoder,
  "age-calculator": AgeCalculator,
  "date-converter": DateConverter,
  "unit-converter": UnitConverter,
  "currency-converter": CurrencyConverter,
};

export default function ToolPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const tool = id ? getToolById(id) : null;
  const ToolComponent = id ? toolComponents[id] : null;

  // ✅ Analytics Effect: Log usage whenever the tool ID changes
  useEffect(() => {
    if (tool && id) {
      const trackUsage = async () => {
        try {
          // 1. Log the specific tool event
          await FirebaseAnalytics.logEvent({
            name: 'tool_usage',
            params: {
              tool_id: id,
              tool_name: tool.name,
              category: tool.category || 'general'
            }
          });

          // 2. Also set this as a screen view for path analysis
          await FirebaseAnalytics.setScreenName({
            screenName: `Tool: ${tool.name}`,
            nameOverride: `tool_${id}`
          });
        } catch (error) {
          console.error("Analytics Error:", error);
        }
      };

      trackUsage();
    }
  }, [id, tool]);

  if (!tool || !ToolComponent) {
    return <ErrorScreen onRetry={() => navigate("/")} />;
  }

  return (
    <div className="px-4 py-6 animate-page-enter">
      {/* Tool Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
          <tool.icon className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">{tool.name}</h1>
          <p className="text-sm text-muted-foreground">{tool.description}</p>
        </div>
      </div>

      {/* Tool Content */}
      <ToolComponent />
    </div>
  );
}