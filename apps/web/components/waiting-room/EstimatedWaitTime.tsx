import { Clock3 } from "lucide-react";
import { Stat } from "@/components/ui/Stat";

export function EstimatedWaitTime({ minutes }: { minutes: number }) {
  return <Stat label="Estimated Wait" value={`${minutes} min`} icon={Clock3} />;
}
