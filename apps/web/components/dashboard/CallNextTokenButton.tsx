"use client";

import { Megaphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/providers/SocketProvider";

export function CallNextTokenButton({
  onCallNext,
  disabled,
  loading
}: {
  onCallNext: () => Promise<void>;
  disabled: boolean;
  loading: boolean;
}) {
  const { notify } = useToast();

  async function handleClick() {
    try {
      await onCallNext();
      notify({ title: "Next token called", description: "Waiting room updated instantly.", tone: "success" });
    } catch (error) {
      notify({
        title: "No token called",
        description: error instanceof Error ? error.message : "Please try again.",
        tone: "error"
      });
    }
  }

  return (
    <Button onClick={handleClick} disabled={disabled} loading={loading} className="w-full sm:w-auto">
      <Megaphone className="size-4" />
      Call Next Token
    </Button>
  );
}
