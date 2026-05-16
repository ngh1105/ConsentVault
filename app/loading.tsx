import { StatePanel } from "@/components/state-panel";

export default function Loading() {
  return (
    <StatePanel
      label="Loading archive"
      title="Rebuilding the active ConsentVault record."
      description="The dashboard, policy links, and case evidence are being prepared so you can continue the review without losing the archive framing."
      loading
    />
  );
}
