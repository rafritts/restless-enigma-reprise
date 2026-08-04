import type { Metadata } from "next";
import { EnigmaConsole } from "@/components/enigma/enigma-console";

export const metadata: Metadata = {
  title: "Enigma",
};

export default function EnigmaPage() {
  return (
    <div className="animate-rise">
      <EnigmaConsole />
    </div>
  );
}
