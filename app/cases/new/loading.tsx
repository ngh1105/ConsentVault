import { StatePanel } from "@/components/state-panel";

export default function NewCaseLoading() {
  return (
    <StatePanel
      label="Dispute intake"
      title="Preparing a new case file."
      description="Policy context, form fields, and the evidence preview bundle are loading so you can file the next archive record on a narrow or full-width screen."
      loading
    />
  );
}
