import { EvidenceWorkspaceScreen } from "@/components/evidence/evidence-workspace-screen";

type EvidencePageProps = {
  params: Promise<{
    caseId: string;
  }>;
};

export default async function EvidencePage({ params }: EvidencePageProps) {
  const { caseId } = await params;

  return <EvidenceWorkspaceScreen caseId={caseId} />;
}
