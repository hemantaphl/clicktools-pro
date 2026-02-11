import { 
  Calculator, 
  Shield, 
  Layers, 
  Hash, 
  QrCode,
  Globe,
  Network,
  FileCode,
  Key,
  Fingerprint,
  Binary,
  Lock,
  MoreHorizontal,
  Palette,
  Clock,
  FileText,
  Percent,
  CalendarDays,
  LucideIcon, 
  FileCheck,
  Search,
  Activity,
  Coins,
  ArrowRightLeft,
  Ruler,
  Languages,
  CheckCircle
} from "lucide-react";

export type ToolStatus = "available" | "coming-soon";
export type ToolCategory = "network" | "finance" | "security" | "utilities" | "others";

export interface Tool {
  id: string;
  name: string;
  description: string;
  status: ToolStatus;
  category: ToolCategory;
  icon: LucideIcon;
  isNew?: boolean;
}

export const tools: Tool[] = [
  // Top Available Tools
  {
    id: "qr-scanner",
    name: "QR Scanner",
    description: "Scan QR codes using camera or upload from device",
    status: "available",
    category: "utilities",
    icon: QrCode,
    isNew: true,
  },
  {
    id: "emi-calculator",
    name: "EMI Calculator",
    description: "Calculate your Equated Monthly Installment for loans",
    status: "available",
    category: "finance",
    icon: Calculator,
    isNew: true,
  },
  {
    id: "unit-converter",
    name: "Unit Converter",
    description: "Convert between units of length, weight, temperature & more",
    status: "available",
    category: "utilities",
    icon: Ruler,
    isNew: true,
  },
  {
    id: "currency-converter",
    name: "Currency Converter",
    description: "Real-time exchange rate.",
    status: "available",
    category: "finance",
    icon: Coins,
    isNew: true,
  },
  {
    id: "age-calculator",
    name: "Age Calculator",
    description: "Calculate age from birth date",
    status: "available",
    category: "others",
    icon: CalendarDays,
    isNew: true,
  },
  {
    id: "date-converter",
    name: "Date Converter",
    description: "Convert dates between AD and BS calendars",
    status: "available",
    category: "others",
    icon: ArrowRightLeft,
    isNew: true,
  },
  {
    id: "subnet-calculator",
    name: "Subnet Calculator",
    description: "Advanced IPv4 & IPv6 subnet calculator",
    status: "available",
    category: "network",
    icon: Layers,
    isNew: true,
  },
  {
    id: "password-strength",
    name: "Password Checker",
    description: "Analyze password strength with entropy and crack time",
    status: "available",
    category: "security",
    icon: Shield,
    isNew: true,
  },
  {
    id: "port-checker",
    name: "Port Checker",
    description: "Check real time open or closed network ports",
    status: "available",
    category: "network",
    icon: Network,
    isNew: true,
  },
  {
    id: "ssl-checker",
    name: "SSL Checker",
    description: "Check SSL certificate validity and details",
    status: "available",
    category: "security",
    icon: Lock,
    isNew: true,
  },
  {
    id: "base64-encoder",
    name: "Base64 Encoder",
    description: "Encode and decode text or files using Base64",
    status: "available",
    category: "utilities",
    icon: FileCode,
    isNew: true,
  },
  {
    id: "hash-generator",
    name: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, SHA-512 hashes with HMAC",
    status: "available",
    category: "security",
    icon: Hash,
    isNew: true,
  },
  {
    id: "color-picker",
    name: "Color Picker",
    description: "Pick and copy HEX or RGB color codes",
    status: "available",
    category: "others",
    icon: Palette,
    isNew: true,
  },




  // Coming Soon Tools
  {
    id: "dns-lookup",
    name: "DNS Lookup",
    description: "Check A, MX, and TXT records for any domain",
    status: "coming-soon",
    category: "network",
    icon: Search,
  },
  {
    id: "ping-test",
    name: "Ping Test",
    description: "Check the latency/response time of a specific server.",
    status: "coming-soon",
    category: "network",
    icon: Activity,
  },

{
  id: "nepali-unicode",
  name: "Nepali Unicode",
  description: "Type Nepali text using Roman letters and convert to Unicode नेपाली.",
  status: "coming-soon",
  category: "others",
  icon: Languages,
},
{
  id: "eligibility-checker",
  name: "Eligibility Checker",
  description: "Check eligibility based on age and date (BS & AD supported).",
  status: "coming-soon",
  category: "others",
  icon: CheckCircle,
}


  
  // Coming Soon Tools
  /*{
    id: "ip-checker",
    name: "IP Checker",
    description: "Check your public IP address and geolocation",
    status: "coming-soon",
    category: "network",
    icon: Globe,
  
  },
  {
    id: "ipo-result",
    name: "IPO Result",
    description: "Check IPO allotment results using BOID",
    status: "coming-soon",
    category: "finance",
    icon: FileCheck,
  },
  {
    id: "jwt-decoder",
    name: "JWT Decoder",
    description: "Decode and verify JSON Web Tokens",
    status: "coming-soon",
    category: "security",
    icon: Key,
    
  },
  {
    id: "uuid-generator",
    name: "UUID Generator",
    description: "Generate unique UUIDs v1, v4, and v7",
    status: "coming-soon",
    category: "utilities",
    icon: Fingerprint,
    
  },
  {
    id: "binary-converter",
    name: "Binary Converter",
    description: "Convert between binary, decimal, hex, and octal",
    status: "coming-soon",
    category: "utilities",
    icon: Binary,
    
  },

  // Others category

  {
    id: "timestamp-converter",
    name: "Timestamp Tool",
    description: "Convert Unix timestamps to readable dates",
    status: "coming-soon",
    category: "others",
    icon: Clock,
    
  },
  {
    id: "lorem-generator",
    name: "Lorem Generator",
    description: "Generate placeholder text for designs",
    status: "coming-soon",
    category: "others",
    icon: FileText,
    
  },
  {
    id: "percentage-calc",
    name: "Percentage Calc",
    description: "Calculate percentages quickly",
    status: "coming-soon",
    category: "finance",
    icon: Percent,
    
  },
 */
];

export const categories: { id: ToolCategory | "all"; label: string; labelNp: string; icon?: LucideIcon }[] = [
  { id: "all", label: "All", labelNp: "सबै" },
  { id: "network", label: "Network", labelNp: "नेटवर्क", icon: Network },
  { id: "finance", label: "Finance", labelNp: "वित्त", icon: Calculator },
  { id: "security", label: "Security", labelNp: "सुरक्षा", icon: Shield },
  { id: "utilities", label: "Utilities", labelNp: "उपयोगिताहरू", icon: Layers },
  { id: "others", label: "Others", labelNp: "अन्य", icon: MoreHorizontal },
];

export const getToolsByCategory = (category: ToolCategory | "all") => {
  if (category === "all") return tools;
  return tools.filter(tool => tool.category === category);
};

export const getAvailableTools = () => tools.filter(t => t.status === "available");
export const getTopTools = () => tools.filter(t => t.status === "available").slice(0, 5);
export const getToolById = (id: string) => tools.find(t => t.id === id);
