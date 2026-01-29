import { useParams, useNavigate } from "react-router-dom";
import { getToolById } from "@/lib/tools-data";
import { ErrorScreen } from "@/components/common/ErrorScreen";
import { EmiCalculator } from "@/components/tools/EmiCalculator";
import { PasswordStrength } from "@/components/tools/PasswordStrength";
import { SubnetCalculator } from "@/components/tools/SubnetCalculator";
import { HashGenerator } from "@/components/tools/HashGenerator";
import { QrScanner } from "@/components/tools/QrScanner";
import { IpChecker } from "@/components/tools/IpChecker";
import { PortChecker } from "@/components/tools/PortChecker";
import { SslChecker } from "@/components/tools/SslChecker";
import { ColorPicker } from "@/components/tools/ColorPicker";

const toolComponents: Record<string, React.ComponentType> = {
  "qr-scanner": QrScanner,
  "emi-calculator": EmiCalculator,
  "password-strength": PasswordStrength,
  "subnet-calculator": SubnetCalculator,
  "hash-generator": HashGenerator,
  "ip-checker": IpChecker,
  "port-checker": PortChecker,
  "ssl-checker": SslChecker,
  "color-picker": ColorPicker,
};

export default function ToolPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const tool = id ? getToolById(id) : null;
  const ToolComponent = id ? toolComponents[id] : null;

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
