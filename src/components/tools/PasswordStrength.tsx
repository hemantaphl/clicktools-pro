import { useState, useMemo } from "react";
import { Eye, EyeOff, CheckCircle, XCircle, Shuffle, Copy, Check } from "lucide-react";

export function PasswordStrength() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [generatorLength, setGeneratorLength] = useState(16);
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    const chars = {
      lower: "abcdefghijklmnopqrstuvwxyz",
      upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      numbers: "0123456789",
      symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
    };
    
    const allChars = chars.lower + chars.upper + chars.numbers + chars.symbols;
    let result = "";
    
    // Ensure at least one of each type
    result += chars.lower[Math.floor(Math.random() * chars.lower.length)];
    result += chars.upper[Math.floor(Math.random() * chars.upper.length)];
    result += chars.numbers[Math.floor(Math.random() * chars.numbers.length)];
    result += chars.symbols[Math.floor(Math.random() * chars.symbols.length)];
    
    for (let i = result.length; i < generatorLength; i++) {
      result += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle
    result = result.split("").sort(() => Math.random() - 0.5).join("");
    setPassword(result);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const analysis = useMemo(() => {
    if (!password) {
      return {
        score: 0,
        label: "Enter password",
        entropy: 0,
        crackTime: "Instantly",
        checks: {
          length12: false,
          uppercase: false,
          lowercase: false,
          numbers: false,
          symbols: false,
          noCommon: true,
          noRepeating: true,
          noSequential: true,
        },
        suggestions: [
          "Use at least 12 characters",
          "Add uppercase letters (A-Z)",
          "Add lowercase letters (a-z)",
          "Add numbers (0-9)",
          "Add special symbols (!@#$%...)",
        ],
      };
    }

    const checks = {
      length12: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /[0-9]/.test(password),
      symbols: /[^A-Za-z0-9]/.test(password),
      noCommon: !/(password|123456|qwerty|admin|login)/i.test(password),
      noRepeating: !/(.)\1{2,}/.test(password),
      noSequential: !/(abc|bcd|cde|123|234|345|456|567|678|789)/i.test(password),
    };

    // Calculate entropy
    let charsetSize = 0;
    if (checks.lowercase) charsetSize += 26;
    if (checks.uppercase) charsetSize += 26;
    if (checks.numbers) charsetSize += 10;
    if (checks.symbols) charsetSize += 32;
    
    const entropy = password.length * Math.log2(charsetSize || 1);

    // Calculate crack time (simplified)
    const guessesPerSecond = 1e10; // 10 billion guesses per second
    const possibleCombinations = Math.pow(charsetSize || 1, password.length);
    const secondsToCrack = possibleCombinations / guessesPerSecond / 2;

    let crackTime = "Instantly";
    if (secondsToCrack > 31536000000) crackTime = "Centuries";
    else if (secondsToCrack > 31536000) crackTime = `${Math.floor(secondsToCrack / 31536000)} years`;
    else if (secondsToCrack > 2592000) crackTime = `${Math.floor(secondsToCrack / 2592000)} months`;
    else if (secondsToCrack > 86400) crackTime = `${Math.floor(secondsToCrack / 86400)} days`;
    else if (secondsToCrack > 3600) crackTime = `${Math.floor(secondsToCrack / 3600)} hours`;
    else if (secondsToCrack > 60) crackTime = `${Math.floor(secondsToCrack / 60)} minutes`;
    else if (secondsToCrack > 1) crackTime = `${Math.floor(secondsToCrack)} seconds`;

    // Calculate score
    const passedChecks = Object.values(checks).filter(Boolean).length;
    const score = Math.min(100, Math.round((passedChecks / 8) * 100 * (password.length / 16)));

    let label = "Weak";
    if (score >= 80) label = "Very Strong";
    else if (score >= 60) label = "Strong";
    else if (score >= 40) label = "Moderate";
    else if (score >= 20) label = "Weak";

    const suggestions: string[] = [];
    if (!checks.length12) suggestions.push("Use at least 12 characters");
    if (!checks.uppercase) suggestions.push("Add uppercase letters (A-Z)");
    if (!checks.lowercase) suggestions.push("Add lowercase letters (a-z)");
    if (!checks.numbers) suggestions.push("Add numbers (0-9)");
    if (!checks.symbols) suggestions.push("Add special symbols (!@#$%...)");
    if (!checks.noCommon) suggestions.push("Avoid common passwords");
    if (!checks.noRepeating) suggestions.push("Avoid repeating characters");
    if (!checks.noSequential) suggestions.push("Avoid sequential patterns");

    return { score, label, entropy, crackTime, checks, suggestions };
  }, [password]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-accent";
    if (score >= 60) return "text-accent";
    if (score >= 40) return "text-yellow-500";
    if (score >= 20) return "text-orange-500";
    return "text-destructive";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-accent";
    if (score >= 60) return "bg-accent";
    if (score >= 40) return "bg-yellow-500";
    if (score >= 20) return "bg-orange-500";
    return "bg-destructive";
  };

  const requirementsList = [
    { key: "length12", label: "12+ characters", passed: analysis.checks.length12 },
    { key: "uppercase", label: "Uppercase letters", passed: analysis.checks.uppercase },
    { key: "lowercase", label: "Lowercase letters", passed: analysis.checks.lowercase },
    { key: "numbers", label: "Numbers", passed: analysis.checks.numbers },
    { key: "symbols", label: "Special symbols", passed: analysis.checks.symbols },
    { key: "noCommon", label: "No common patterns", passed: analysis.checks.noCommon },
    { key: "noRepeating", label: "No repeating chars", passed: analysis.checks.noRepeating },
    { key: "noSequential", label: "No sequential patterns", passed: analysis.checks.noSequential },
  ];

  return (
    <div className="space-y-4">
      {/* Password Input */}
      <div className="bg-card rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Enter Password</h3>
        
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password..."
            className="w-full h-14 px-4 pr-24 rounded-lg bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-lg"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {password && (
              <button
                onClick={copyPassword}
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-accent" />
                ) : (
                  <Copy className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            )}
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Eye className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Your password is analyzed locally and never sent to any server.
        </p>
      </div>

      {/* Password Generator */}
      <div className="bg-card rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Generate Strong</h3>
          <button
            onClick={generatePassword}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium active:scale-[0.98] transition-transform flex items-center gap-2"
          >
            <Shuffle className="w-4 h-4" />
            Generate
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Password Length: {generatorLength}</span>
          </div>
          <input
            type="range"
            min="8"
            max="32"
            value={generatorLength}
            onChange={(e) => setGeneratorLength(Number(e.target.value))}
            className="w-full accent-primary h-2 rounded-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>8</span>
            <span>12</span>
            <span>16</span>
            <span>24</span>
            <span>32</span>
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div className="bg-card rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Requirements</h3>
        
        <div className="grid grid-cols-2 gap-2">
          {requirementsList.map((req) => (
            <div key={req.key} className="flex items-center gap-2">
              {req.passed ? (
                <CheckCircle className="w-4 h-4 text-accent shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              <span className={`text-xs ${req.passed ? "text-foreground" : "text-muted-foreground"}`}>
                {req.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Strength Meter */}
      <div className="bg-card rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Strength</h3>
          <span className={`text-sm font-medium ${getScoreColor(analysis.score)}`}>
            {analysis.label}
          </span>
        </div>

        <div className="space-y-2">
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getScoreBg(analysis.score)}`}
              style={{ width: `${analysis.score}%` }}
            />
          </div>
          <div className="text-center">
            <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
              {analysis.score}
            </span>
            <span className="text-muted-foreground">/100</span>
          </div>
        </div>
      </div>

      {/* Security Analysis */}
      <div className="bg-card rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Security Analysis</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Entropy</p>
            <p className="text-lg font-bold text-foreground">{analysis.entropy.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">bits</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Time to Crack</p>
            <p className="text-lg font-bold text-foreground">{analysis.crackTime}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Length</p>
            <p className="text-lg font-bold text-foreground">{password.length}</p>
            <p className="text-xs text-muted-foreground">characters</p>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div className="bg-surface rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Suggestions</h3>
          <ul className="space-y-1">
            {analysis.suggestions.map((suggestion, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span>•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
