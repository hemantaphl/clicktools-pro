import { StaticFooter } from "@/components/common/StaticFooter";
import { Shield } from "lucide-react";

export default function Privacy() {
  return (
    <div className="px-4 py-6 animate-page-enter">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground">Last updated: January 30, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        <section className="bg-card rounded-2xl p-5 shadow-sm border border-border/40">
          <h2 className="text-base font-bold mb-3 text-foreground">Introduction</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            ClickTools Pro ("we", "our", or "us") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, and safeguard your information 
            when you use our mobile application, including our integration with Google Services.
          </p>
        </section>

        <section className="bg-card rounded-2xl p-5 shadow-sm border border-border/40">
          <h2 className="text-base font-bold mb-3 text-foreground">Information We Collect</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            We may collect information that you provide directly to us or via third-party services:
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              Account info (Name, Email, and Profile Picture via Google Sign-In)
            </li>
            <li className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              IP address information (when using IP or Network tools)
            </li>
            <li className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              Tool usage data and device info for Firebase Analytics
            </li>
          </ul>
        </section>

        <section className="bg-card rounded-2xl p-5 shadow-sm border border-border/40">
          <h2 className="text-base font-bold mb-3 text-foreground">How We Use Your Information</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
              Authenticate users and maintain secure app access
            </li>
            <li className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
              Improve and personalize your experience based on usage trends
            </li>
            <li className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
              Respond to support requests and technical questions
            </li>
            <li className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
              Analyze app performance and tool popularity via Firebase
            </li>
          </ul>
        </section>

        <section className="bg-card rounded-2xl p-5 shadow-sm border border-border/40">
          <h2 className="text-base font-bold mb-3 text-foreground">Data Security</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We implement appropriate technical measures and use Google Firebase's secure 
            infrastructure to protect your personal information against unauthorized access, 
            alteration, disclosure, or destruction.
          </p>
        </section>

        <section className="bg-card rounded-2xl p-5 shadow-sm border border-border/40">
          <h2 className="text-base font-bold mb-3 text-foreground">Contact Us</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:app@hemantaphuyal.com.np" className="text-primary font-medium">
              app@hemantaphuyal.com.np
            </a>
          </p>
        </section>
      </div>

      <StaticFooter />
    </div>
  );
}