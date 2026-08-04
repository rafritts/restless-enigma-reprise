import type { Metadata } from "next";
import { BombeConsole } from "@/components/bombe/bombe-console";

export const metadata: Metadata = {
  title: "Bombe",
};

export default function BombePage() {
  return (
    <div className="animate-rise">
      <BombeConsole />
    </div>
  );
}
