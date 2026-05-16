import { StatePanel } from "@/components/state-panel";

export default function PolicyLoading() {
  return (
    <StatePanel
      label="Policy builder"
      title="Loading the creator consent record."
      description="Consent clauses, attribution rules, and restricted uses are being restored so the archive editor opens with the latest policy context."
      loading
    />
  );
}
