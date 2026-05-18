import { ProgressRail, type ProgressStep } from "@/components/ui/progress-rail";

export default async function CaseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const steps: ProgressStep[] = [
    { id: "setup", label: "Setup", href: `/cases/${caseId}`, state: "done" },
    { id: "evidence", label: "Evidence", href: `/cases/${caseId}/evidence`, state: "current" },
    { id: "trial", label: "Trial", href: `/cases/${caseId}/trial`, state: "locked" },
    { id: "receipt", label: "Receipt", href: `/cases/${caseId}/receipt`, state: "locked" },
  ];
  return (
    <>
      <ProgressRail steps={steps} />
      {children}
    </>
  );
}
