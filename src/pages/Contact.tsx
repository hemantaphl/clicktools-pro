import { Send, Globe, Mail, ExternalLink } from "lucide-react";
import { StaticFooter } from "@/components/common/StaticFooter";

const contactLinks = [
  {
    icon: Send,
    label: "Telegram",
    value: "@hemantaphuyal",
    url: "https://t.me/hemantaphuyal",
    color: "from-blue-500/20 to-blue-600/10",
    iconColor: "text-blue-500",
  },
  {
    icon: Globe,
    label: "Website",
    value: "hemantaphuyal.com",
    url: "https://www.hemantaphuyal.com/",
    color: "from-primary/20 to-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Mail,
    label: "Email",
    value: "app@hemantaphuyal.com",
    url: "mailto:app@hemantaphuyal.com",
    color: "from-accent/20 to-accent/10",
    iconColor: "text-accent",
  },
];

export default function Contact() {
  return (
    <div className="px-4 py-6 animate-page-enter">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
          <Send className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Get in Touch</h1>
        <p className="text-sm text-muted-foreground">
          Have questions or feedback? We'd love to hear from you.
        </p>
      </div>

      {/* Contact Links */}
      <section className="space-y-3 mb-8">
        {contactLinks.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-card rounded-2xl shadow-sm transition-all duration-200 active:scale-[0.98] group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${link.iconColor}`} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {link.label}
                </p>
                <p className="font-semibold text-foreground">{link.value}</p>
              </div>
              <ExternalLink className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          );
        })}
      </section>

      {/* Response Time */}
      <div className="bg-surface rounded-2xl p-5 text-center">
        <p className="text-sm text-muted-foreground">
          We typically respond within <span className="font-semibold text-foreground">24 hours</span>
        </p>
      </div>

      <StaticFooter />
    </div>
  );
}
