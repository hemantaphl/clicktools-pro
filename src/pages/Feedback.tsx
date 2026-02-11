import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  MessageSquare, 
  Wrench, 
  Send, 
  Star, 
  CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

type FeedbackType = "feedback" | "request";

export default function Feedback() {
  const navigate = useNavigate();
  
  // Form States
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("feedback");
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [toolName, setToolName] = useState("");
  
  // Status States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    // 1. Connectivity Check
    if (!navigator.onLine) {
      haptic.medium(); // Using medium() as a fallback for impact() to avoid errors
      toast({ 
        title: "No Internet Connection", 
        description: "Please connect to the internet to submit your feedback.",
        variant: "destructive" 
      });
      return;
    }

    // 2. Validation
    if (!message.trim()) {
      toast({ title: "Please enter your message", variant: "destructive" });
      return;
    }
    if (feedbackType === "request" && !toolName.trim()) {
      toast({ title: "Please enter the tool/service name", variant: "destructive" });
      return;
    }

    // 3. Lock Button and Start Submission
    setIsSubmitting(true);
    haptic.medium();

    // REPLACE with your actual Google Apps Script Web App URL
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxrzqwrRxXHcn5tqDGKw9FjL7ay8BzfHT0Y0I_QWENlNHHBhQxYzrFtAClCBP7NJ9cu/exec";

    try {
      // We use 'no-cors' because Google Scripts redirect requests
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: feedbackType,
          rating: feedbackType === "feedback" ? rating : "N/A",
          name: name || "Anonymous",
          email: email || "Not provided",
          tool: feedbackType === "request" ? toolName : "N/A",
          message: message,
        }),
      });

      // 4. Success Handling
      haptic.success();
      setIsSubmitted(true);
      toast({ title: "Feedback Sent!" });

    } catch (error) {
      console.error("Submission Error:", error);
      setIsSubmitting(false); // Unlock button so user can try again
      toast({ 
        title: "Submission Failed", 
        description: "Something went wrong. Please try again later.", 
        variant: "destructive" 
      });
    }
  };

  // --- SUCCESS VIEW ---
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <CheckCircle2 className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-3 tracking-tight">Submitted!</h2>
        <p className="text-muted-foreground mb-10 max-w-[260px] leading-relaxed">
          Thank you. Your {feedbackType} has been securely stored in our system.
        </p>
        <Button 
          onClick={() => navigate(-1)} 
          className="w-full max-w-[220px] h-14 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform"
        >
          Back to App
        </Button>
      </div>
    );
  }

  // --- MAIN FORM VIEW ---
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-4">
          <button 
            onClick={() => navigate(-1)} 
            disabled={isSubmitting}
            className="p-2 -ml-2 rounded-xl active:bg-muted transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Feedback & Requests</h1>
        </div>
      </div>

      <div className="px-4 py-6 pb-20 animate-page-enter">
        {/* Type Selector Tabs */}
        <div className="bg-card rounded-2xl p-1.5 flex gap-1 border border-border/40 mb-6">
          <button
            disabled={isSubmitting}
            onClick={() => { setFeedbackType("feedback"); haptic.light(); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all",
              feedbackType === "feedback" ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-bold">Feedback</span>
          </button>
          <button
            disabled={isSubmitting}
            onClick={() => { setFeedbackType("request"); haptic.light(); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all",
              feedbackType === "request" ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground"
            )}
          >
            <Wrench className="w-4 h-4" />
            <span className="text-sm font-bold">Request Tool</span>
          </button>
        </div>

        <div className="space-y-5">
          {/* Star Rating Section */}
          {feedbackType === "feedback" && (
            <div className="bg-card rounded-2xl p-5 border border-border/40">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 block">
                Your Rating
              </Label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => { setRating(star); haptic.light(); }}
                    className="p-1 transition-transform active:scale-90"
                  >
                    <Star
                      className={cn(
                        "w-9 h-9 transition-colors",
                        star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tool Name Input */}
          {feedbackType === "request" && (
            <div className="bg-card rounded-2xl p-5 border border-border/40">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3 block">
                Tool Name *
              </Label>
              <Input
                disabled={isSubmitting}
                placeholder="What should we build?"
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                className="bg-background border-border/50 h-12 rounded-xl focus-visible:ring-primary"
              />
            </div>
          )}

          {/* Identity/Contact Section */}
          <div className="bg-card rounded-2xl p-5 border border-border/40 space-y-4">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] block">
              Contact (Optional)
            </Label>
            <Input
              disabled={isSubmitting}
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background border-border/50 h-12 rounded-xl"
            />
            <Input
              disabled={isSubmitting}
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border-border/50 h-12 rounded-xl"
            />
          </div>

          {/* Message Section */}
          <div className="bg-card rounded-2xl p-5 border border-border/40">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3 block">
              {feedbackType === "feedback" ? "Feedback Details *" : "Description *"}
            </Label>
            <Textarea
              disabled={isSubmitting}
              placeholder="Share your thoughts..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-background border-border/50 min-h-[140px] rounded-xl resize-none"
            />
          </div>

          {/* The Locked Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-14 text-lg font-bold rounded-2xl gap-3 shadow-xl shadow-primary/10 transition-all"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit
              </>
            )}
          </Button>
        </div>

        <p className="text-[10px] text-muted-foreground text-center mt-8 px-4 leading-relaxed uppercase tracking-widest">
          Premium Tools for What’s Next
        </p>
      </div>
    </div>
  );
}