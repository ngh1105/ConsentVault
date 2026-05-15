import { ReceiptScreen } from "@/components/receipt/receipt-screen";

type ReceiptPageProps = {
  params: Promise<{
    caseId: string;
  }>;
};

export default async function ReceiptPage({ params }: ReceiptPageProps) {
  const { caseId } = await params;

  return <ReceiptScreen caseId={caseId} />;
}
