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
  LucideIcon 
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
  },
  {
    id: "subnet-calculator",
    name: "Subnet Calculator",
    description: "Advanced IPv4 & IPv6 subnet calculator",
    status: "available",
    category: "network",
    icon: Layers,
  },
  {
    id: "hash-generator",
    name: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, SHA-512 hashes with HMAC",
    status: "available",
    category: "security",
    icon: Hash,
  },
  {
    id: "password-strength",
    name: "Password Checker",
    description: "Analyze password strength with entropy and crack time",
    status: "available",
    category: "security",
    icon: Shield,
  },
  
  // Coming Soon Tools
  {
    id: "ip-checker",
    name: "IP Checker",
    description: "Check your public IP address and geolocation",
    status: "coming-soon",
    category: "network",
    icon: Globe,
    isNew: true,
  },
  {
    id: "port-checker",
    name: "Port Checker",
    description: "Check if specific ports are open on a target host",
    status: "coming-soon",
    category: "network",
    icon: Network,
    isNew: true,
  },
  {
    id: "base64-encoder",
    name: "Base64 Encoder",
    description: "Encode and decode text or files using Base64",
    status: "coming-soon",
    category: "utilities",
    icon: FileCode,
    isNew: true,
  },
  {
    id: "jwt-decoder",
    name: "JWT Decoder",
    description: "Decode and verify JSON Web Tokens",
    status: "coming-soon",
    category: "security",
    icon: Key,
    isNew: true,
  },
  {
    id: "uuid-generator",
    name: "UUID Generator",
    description: "Generate unique UUIDs v1, v4, and v7",
    status: "coming-soon",
    category: "utilities",
    icon: Fingerprint,
    isNew: true,
  },
  {
    id: "binary-converter",
    name: "Binary Converter",
    description: "Convert between binary, decimal, hex, and octal",
    status: "coming-soon",
    category: "utilities",
    icon: Binary,
    isNew: true,
  },
  {
    id: "ssl-checker",
    name: "SSL Checker",
    description: "Check SSL certificate validity and details",
    status: "coming-soon",
    category: "security",
    icon: Lock,
    isNew: true,
  },
  // Others category
  {
    id: "color-picker",
    name: "Color Picker",
    description: "Pick and convert colors between formats",
    status: "coming-soon",
    category: "others",
    icon: Palette,
    isNew: true,
  },
  {
    id: "timestamp-converter",
    name: "Timestamp Tool",
    description: "Convert Unix timestamps to readable dates",
    status: "coming-soon",
    category: "others",
    icon: Clock,
    isNew: true,
  },
  {
    id: "lorem-generator",
    name: "Lorem Generator",
    description: "Generate placeholder text for designs",
    status: "coming-soon",
    category: "others",
    icon: FileText,
    isNew: true,
  },
  {
    id: "percentage-calc",
    name: "Percentage Calc",
    description: "Calculate percentages quickly",
    status: "coming-soon",
    category: "finance",
    icon: Percent,
    isNew: true,
  },
  {
    id: "age-calculator",
    name: "Age Calculator",
    description: "Calculate age from birth date",
    status: "coming-soon",
    category: "others",
    icon: CalendarDays,
    isNew: true,
  },
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
