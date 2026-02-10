import { useCallback } from "react";

interface Toast {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const toast = useCallback((props: Toast) => {
    // Simple browser notification fallback
    const title = props.title || "Notification";
    const description = props.description || "";
    
    if (props.variant === "destructive") {
      // ...existing code...
    } else {
      // ...existing code...
    }

    // Try to show native notification if available
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body: description,
        icon: "/favicon.ico",
      });
    }
  }, []);

  return { toast };
}
