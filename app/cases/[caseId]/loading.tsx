import { StatePanel } from "@/components/state-panel";

export default function CaseLoading() {
  return (
    <StatePanel
      label="Case overview"
      title="Loading the active dispute archive."
      description="The linked policy, evidence count, and latest receipt signal are being restored so the case can reopen with the same archive framing on any screen size."
      loading
    />
  );
}
