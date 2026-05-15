import { TrialScreen } from "@/components/trial/trial-screen";

type TrialPageProps = {
  params: Promise<{
    caseId: string;
  }>;
};

export default async function TrialPage({ params }: TrialPageProps) {
  const { caseId } = await params;

  return <TrialScreen caseId={caseId} />;
}
