import React from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CaseIntakeScreen } from "@/components/intake/case-intake-screen";
import { useConsentVault } from "@/components/providers/consent-vault-provider";
import { samplePolicies } from "@/lib/sample-data";
import * as caseIntake from "@/lib/case-intake";
import { useRouter } from "next/navigation";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/components/providers/consent-vault-provider", () => ({
  useConsentVault: vi.fn(),
}));

vi.mock("@/lib/case-intake", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/case-intake")>();

  return {
    ...actual,
    buildPreparedIntakeCaseSubmission: vi.fn(actual.buildPreparedIntakeCaseSubmission),
  };
});

const mockedUseRouter = vi.mocked(useRouter);
const mockedUseConsentVault = vi.mocked(useConsentVault);
const mockedBuildPreparedIntakeCaseSubmission = vi.mocked(
  caseIntake.buildPreparedIntakeCaseSubmission,
);

afterEach(() => {
  cleanup();
  mockedUseRouter.mockReset();
  mockedUseConsentVault.mockReset();
  mockedBuildPreparedIntakeCaseSubmission.mockClear();
});

describe("CaseIntakeScreen", () => {
  it("prepares an explicit case id before dispatch and routes to the same case overview", async () => {
    const push = vi.fn();
    const dispatch = vi.fn();
    const user = userEvent.setup();

    mockedUseRouter.mockReturnValue({ push } as ReturnType<typeof useRouter>);
    mockedUseConsentVault.mockReturnValue({
      dispatch,
      policies: samplePolicies,
    } as ReturnType<typeof useConsentVault>);

    render(<CaseIntakeScreen />);

    fireEvent.change(screen.getByLabelText(/Suspicious content title/i), {
      target: { value: "Voice clone dispute" },
    });
    fireEvent.change(screen.getByLabelText(/Original source URL/i), {
      target: { value: "https://creator.example/source" },
    });
    fireEvent.change(screen.getByLabelText(/AI output URL/i), {
      target: { value: "https://platform.example/output" },
    });
    fireEvent.change(screen.getByLabelText(/^Platform URL$/i), {
      target: { value: "https://platform.example/post" },
    });
    fireEvent.change(screen.getByLabelText(/Intake notes/i), {
      target: { value: "Suspicious synthetic voice reuse" },
    });
    await user.click(screen.getByRole("button", { name: /Open draft case/i }));

    expect(mockedBuildPreparedIntakeCaseSubmission).toHaveBeenCalledTimes(1);

    const [submittedValues, options] = mockedBuildPreparedIntakeCaseSubmission.mock.calls[0];

    expect(submittedValues).toMatchObject({
      title: "Voice clone dispute",
      sourceUrl: "https://creator.example/source",
      aiOutputUrl: "https://platform.example/output",
      platformUrl: "https://platform.example/post",
      notes: "Suspicious synthetic voice reuse",
      policyId: samplePolicies[0].id,
    });
    expect(options).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(/^case-/),
      }),
    );

    const routedCaseId = options?.id;

    expect(dispatch).toHaveBeenCalledWith({
      type: "case/create",
      payload: expect.objectContaining({
        id: routedCaseId,
      }),
    });
    expect(push).toHaveBeenCalledWith(`/cases/${routedCaseId}`);
  });

  it("shows unsupported source urls as warning text in the live evidence preview", async () => {
    const push = vi.fn();
    const dispatch = vi.fn();
    const user = userEvent.setup();

    mockedUseRouter.mockReturnValue({ push } as ReturnType<typeof useRouter>);
    mockedUseConsentVault.mockReturnValue({
      dispatch,
      policies: samplePolicies,
    } as ReturnType<typeof useConsentVault>);

    render(<CaseIntakeScreen />);

    await user.type(screen.getByLabelText(/Suspicious content title/i), "Voice clone dispute");
    await user.type(screen.getByLabelText(/Original source URL/i), "javascript:alert(1)");

    const sourceCard = screen.getByText("Voice clone dispute source record").closest("article");

    expect(sourceCard).not.toBeNull();
    expect(
      within(sourceCard as HTMLElement).queryByRole("link", { name: /Open source/i }),
    ).not.toBeInTheDocument();
    expect(within(sourceCard as HTMLElement).getByText("javascript:alert(1)")).toBeVisible();
    expect(within(sourceCard as HTMLElement).getByText(/Invalid or unsupported URL/i)).toBeVisible();
  });

  it("ignores repeat submissions while the first navigation is still in progress", async () => {
    const dispatch = vi.fn();
    const releaseNavigation: Array<() => void> = [];
    const push = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          releaseNavigation.push(resolve);
        }),
    );
    const user = userEvent.setup();

    mockedUseRouter.mockReturnValue({ push } as ReturnType<typeof useRouter>);
    mockedUseConsentVault.mockReturnValue({
      dispatch,
      policies: samplePolicies,
    } as ReturnType<typeof useConsentVault>);

    render(<CaseIntakeScreen />);

    fireEvent.change(screen.getByLabelText(/Suspicious content title/i), {
      target: { value: "Voice clone dispute" },
    });
    fireEvent.change(screen.getByLabelText(/Original source URL/i), {
      target: { value: "https://creator.example/source" },
    });
    fireEvent.change(screen.getByLabelText(/AI output URL/i), {
      target: { value: "https://platform.example/output" },
    });
    fireEvent.change(screen.getByLabelText(/^Platform URL$/i), {
      target: { value: "https://platform.example/post" },
    });

    const submitButton = screen.getByRole("button", { name: /Open draft case/i });
    await user.dblClick(submitButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Opening case/i })).toBeDisabled();
    });

    expect(mockedBuildPreparedIntakeCaseSubmission).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledTimes(1);

    releaseNavigation.forEach((resolve) => resolve());
  });
});

