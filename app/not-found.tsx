import { StatePanel } from "@/components/state-panel";

export default function NotFound() {
  return (
    <StatePanel
      label="Archive mismatch"
      title="This ConsentVault route could not be recovered."
      description="The record you requested is missing or expired. Return to the dashboard to reopen a seeded dispute, continue a policy review, or start a fresh intake."
      href="/"
      actionLabel="Back to dashboard"
    />
  );
}
