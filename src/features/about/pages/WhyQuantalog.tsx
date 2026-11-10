import { useState } from "react";
import { useTitle } from "@/shared/lib/useTitle";
import { DemoCallModal } from "@/app/shell/DemoCallModal";
import { WhyTopBar } from "../components/WhyTopBar";
import { WhyHero } from "../components/WhyHero";
import { PillarGrid } from "../components/PillarGrid";
import { GrowthJourney } from "../components/GrowthJourney";
import { StackCompare } from "../components/StackCompare";
import { TrustList } from "../components/TrustList";
import { WhyCta } from "../components/WhyCta";
import classes from "../components/Why.module.css";

export default function WhyQuantalog() {
  useTitle("Why Quantalog");
  const [callOpen, setCallOpen] = useState(false);
  const bookDemo = () => setCallOpen(true);

  return (
    <div className={classes.shell}>
      <WhyTopBar onBookDemo={bookDemo} />
      <main className={classes.page}>
        <WhyHero onBookDemo={bookDemo} />
        <PillarGrid />
        <GrowthJourney />
        <StackCompare />
        <TrustList />
        <WhyCta onBookDemo={bookDemo} />
      </main>
      <DemoCallModal opened={callOpen} onClose={() => setCallOpen(false)} />
    </div>
  );
}
