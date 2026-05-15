import { CaseOverview } from "@/components/cases/case-overview";

type CasePageProps = {
  params: Promise<{
    caseId: string;
  }>;
};

export default async function CasePage({ params }: CasePageProps) {
  const { caseId } = await params;

  return <CaseOverview caseId={caseId} />;
}
