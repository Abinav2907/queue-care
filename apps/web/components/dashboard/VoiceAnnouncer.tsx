"use client";

import { SOCKET_EVENTS } from "@queue-cure/shared";
import { Volume2 } from "lucide-react";
import { useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";

export function VoiceAnnouncer() {
  const { socket } = useSocket();

  useEffect(() => {
    function announce(payload: { message: string }) {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(payload.message));
    }

    socket.on(SOCKET_EVENTS.VOICE_ANNOUNCEMENT, announce);
    return () => {
      socket.off(SOCKET_EVENTS.VOICE_ANNOUNCEMENT, announce);
    };
  }, [socket]);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-sm text-muted-foreground">
      <Volume2 className="size-4 text-primary" />
      Voice announcements enabled
    </div>
  );
}
