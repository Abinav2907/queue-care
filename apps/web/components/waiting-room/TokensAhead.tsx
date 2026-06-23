import { UsersRound } from "lucide-react";
import { Stat } from "@/components/ui/Stat";

export function TokensAhead({ value }: { value: number }) {
  return <Stat label="Tokens Ahead" value={value} icon={UsersRound} accent="text-accent" />;
}
