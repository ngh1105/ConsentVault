# GenLayer Wallet V1 — Review Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land all caveman-review findings on `codex/genlayer-wallet-v1` as small, atomic commits, each leaving the branch shippable.

**Architecture:** Sequenced fixes in correctness → architecture → polish order. Each batch is one commit. TS fixes use Vitest TDD; Python fixes use Pytest TDD. The Tailwind false-positive (B1) is a verify-or-debunk gate before code changes.

**Tech Stack:** Next.js 15, React 19, TypeScript 5.8, Vitest 3, Playwright 1.52, Tailwind 3.4, Python 3 / GenVM, pytest.

**Spec:** `docs/superpowers/specs/2026-05-18-genlayer-wallet-v1-fixes-design.md`

---

## File Structure

**Modified TS:**
- `components/providers/genlayer-wallet-provider.tsx` — wallet correctness (B2)
- `lib/genlayer/genlayer-trial-engine.ts` — engine robustness (B3)
- `components/wallet/wallet-connect-button.tsx` — label helper + retry (B6.1)
- `components/trial/trial-screen.tsx` — collapse run helpers (B6.2)
- `components/trial/trial-guard.tsx` — hoist env reader (B6.3)
- `app/opengraph-image.tsx` — chain id + font hints (B6.4)
- `scripts/smoke-contract.mjs` — address regex (B6.5)
- `app/error.tsx` — only if B1 confirms compile failure

**Modified Python / docs:**
- `contracts/consent_vault_trial/main.py` — empty case_id assert (B4.1)
- `contracts/consent_vault_trial/test_aggregate.py` — parity + assertion tests (B4.2)
- `contracts/consent_vault_trial/README.md` — drift policy (B5)

**Tests added inline per batch (TDD).**

---

## Task 1: B1 — Verify-or-debunk `bg-destructive/8`

**Files:** `app/error.tsx:42` (conditional)

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: build completes without errors. The class `bg-destructive\/8` (or its equivalent escaped form) appears in the generated CSS bundle.

- [ ] **Step 2: Search the build output**

```bash
grep -rE "destructive/8|destructive\\\\/8" .next/static/css 2>/dev/null | head -5
```

Expected: at least one match. If found → Tailwind 3.4 compiles arbitrary `/N` opacity. Skip Step 3, proceed to Task 2.

- [ ] **Step 3 (only if no match): Replace with `/10`**

In `app/error.tsx`, line 42, change `bg-destructive/8` to `bg-destructive/10`.

- [ ] **Step 4 (only if Step 3 ran): Re-run build to confirm fix**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Commit (only if Step 3 ran)**

```bash
git add app/error.tsx
git commit -m "fix: use supported destructive opacity step in error boundary"
```

If B1 was a no-op, no commit. Move on.

---

## Task 2: B2 — Wallet rebuild on account/chain switch (test-first)

**Files:**
- Test: `tests/lib/genlayer-wallet-provider.test.tsx` (new)
- Modify: `components/providers/genlayer-wallet-provider.tsx`

- [ ] **Step 1: Write failing tests**

Create `tests/lib/genlayer-wallet-provider.test.tsx`:

```tsx
import * as React from "react";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GenLayerWalletProvider,
  useGenLayerWallet,
} from "@/components/providers/genlayer-wallet-provider";

type Listener = (...args: unknown[]) => void;

function createMockProvider() {
  const listeners = new Map<string, Set<Listener>>();
  const provider = {
    request: vi.fn<(args: { method: string }) => Promise<unknown>>(),
    on: vi.fn((event: string, listener: Listener) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(listener);
    }),
    removeListener: vi.fn((event: string, listener: Listener) => {
      listeners.get(event)?.delete(listener);
    }),
    emit: (event: string, payload: unknown) => {
      listeners.get(event)?.forEach((listener) => listener(payload));
    },
  };
  return provider;
}

function Probe() {
  const ctx = useGenLayerWallet();
  return (
    <div>
      <span data-testid="address">{ctx.address ?? "none"}</span>
      <span data-testid="chainId">{ctx.chainId ?? "none"}</span>
      <span data-testid="status">{ctx.status}</span>
      <span data-testid="error">{ctx.error ?? "none"}</span>
      <span data-testid="hasClient">{ctx.client ? "yes" : "no"}</span>
      <button onClick={() => void ctx.connect()}>connect</button>
    </div>
  );
}

describe("GenLayerWalletProvider", () => {
  let mockProvider: ReturnType<typeof createMockProvider>;

  beforeEach(() => {
    mockProvider = createMockProvider();
    Object.defineProperty(window, "ethereum", {
      configurable: true,
      value: mockProvider,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as { ethereum?: unknown }).ethereum;
  });

  async function connect(addresses: string[], chainHex: string) {
    mockProvider.request.mockImplementation(async ({ method }) => {
      if (method === "eth_requestAccounts") return addresses;
      if (method === "eth_chainId") return chainHex;
      throw new Error(`unexpected ${method}`);
    });
    render(
      <GenLayerWalletProvider>
        <Probe />
      </GenLayerWalletProvider>,
    );
    await act(async () => {
      screen.getByText("connect").click();
    });
  }

  it("rejects malformed addresses with status=error", async () => {
    await connect(["0xnothex"], "0xf22f");
    expect(screen.getByTestId("status").textContent).toBe("error");
    expect(screen.getByTestId("error").textContent).toContain("invalid address");
    expect(screen.getByTestId("hasClient").textContent).toBe("no");
  });

  it("rebuilds client and chainId on accountsChanged", async () => {
    const validA = "0x" + "a".repeat(40);
    const validB = "0x" + "b".repeat(40);
    await connect([validA], "0xf22f");
    expect(screen.getByTestId("address").textContent).toBe(validA);
    expect(screen.getByTestId("hasClient").textContent).toBe("yes");

    await act(async () => {
      mockProvider.emit("accountsChanged", [validB]);
    });
    expect(screen.getByTestId("address").textContent).toBe(validB);
    expect(screen.getByTestId("hasClient").textContent).toBe("yes");
  });

  it("rebuilds client on chainChanged", async () => {
    const validA = "0x" + "a".repeat(40);
    await connect([validA], "0xf22f");
    const beforeChainId = screen.getByTestId("chainId").textContent;

    await act(async () => {
      mockProvider.emit("chainChanged", "0xf230");
    });
    expect(screen.getByTestId("chainId").textContent).not.toBe(beforeChainId);
    expect(screen.getByTestId("hasClient").textContent).toBe("yes");
  });
});
```

- [ ] **Step 2: Run tests — expect failures**

```bash
npm test -- tests/lib/genlayer-wallet-provider.test.tsx
```

Expected: 3 failures (malformed addresses currently accepted; account/chain change does not rebuild client).

- [ ] **Step 3: Implement provider fixes**

Replace `components/providers/genlayer-wallet-provider.tsx` body. Key changes (preserve everything not listed):

```tsx
const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

function isValidAddress(value: string): value is `0x${string}` {
  return ADDRESS_RE.test(value);
}

async function connectClientToStudionet(client: GenLayerWalletClient) {
  if ("connect" in client && typeof client.connect === "function") {
    try {
      await client.connect("studionet");
    } catch (caught) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[consentvault] studionet connect failed:", caught);
      }
    }
  }
}
```

In `connect`, after obtaining `nextAddress`:

```tsx
if (!isValidAddress(nextAddress)) {
  setStatus("error");
  setError("Wallet returned an invalid address.");
  return;
}
const accountAddress = nextAddress;
```

Add a `rebuildClientForAccount(provider, address)` helper used by both `connect` and `accountsChanged`:

```tsx
function rebuildClientForAccount(
  provider: EthereumProvider,
  address: `0x${string}`,
): GenLayerWalletClient {
  const next = createGenLayerWalletClient(provider, address);
  void connectClientToStudionet(next);
  return next;
}
```

Replace the listener effect:

```tsx
React.useEffect(() => {
  const provider = getBrowserEthereumProvider();
  if (!hasEthereumProvider(provider)) return;

  const handleAccountsChanged = (accounts: unknown) => {
    const next = firstAccount(accounts);
    if (!next || !isValidAddress(next)) {
      setAddress(null);
      setClient(null);
      setStatus(next ? "error" : "disconnected");
      setError(next ? "Wallet returned an invalid address." : null);
      return;
    }
    setAddress(next);
    setClient(rebuildClientForAccount(provider, next));
    setStatus("connected");
    setError(null);
  };

  const handleChainChanged = (nextChainId: unknown) => {
    const parsed = parseChainId(nextChainId);
    setChainId(parsed);
    const currentAddress = addressRef.current;
    if (currentAddress && isValidAddress(currentAddress)) {
      setClient(rebuildClientForAccount(provider, currentAddress));
    }
  };

  const handleFocus = () => {
    if (statusRef.current === "missing" && getBrowserEthereumProvider()) {
      setStatus("disconnected");
    }
  };

  provider.on?.("accountsChanged", handleAccountsChanged);
  provider.on?.("chainChanged", handleChainChanged);
  window.addEventListener("focus", handleFocus);

  return () => {
    provider.removeListener?.("accountsChanged", handleAccountsChanged);
    provider.removeListener?.("chainChanged", handleChainChanged);
    window.removeEventListener("focus", handleFocus);
  };
}, []);
```

Add refs at the top of the component:

```tsx
const addressRef = React.useRef<string | null>(null);
const statusRef = React.useRef<WalletConnectionStatus>("disconnected");
React.useEffect(() => { addressRef.current = address; }, [address]);
React.useEffect(() => { statusRef.current = status; }, [status]);
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- tests/lib/genlayer-wallet-provider.test.tsx
```

Expected: all 3 pass.

- [ ] **Step 5: Run full vitest + lint**

```bash
npm test && npm run lint
```

Expected: green.

- [ ] **Step 6: Commit**

```bash
git add tests/lib/genlayer-wallet-provider.test.tsx components/providers/genlayer-wallet-provider.tsx
git commit -m "fix(wallet): rebuild client on account/chain switch + validate address"
```

---

## Task 3: B3 — Trial engine robustness (test-first)

**Files:**
- Modify test: `tests/lib/genlayer-trial-engine.test.ts`
- Modify: `lib/genlayer/genlayer-trial-engine.ts`

- [ ] **Step 1: Append failing tests**

Add to `tests/lib/genlayer-trial-engine.test.ts` (inside the existing describe block, importing the existing helpers):

```ts
it("throws when writeContract returns undefined", async () => {
  const walletClient = {
    writeContract: vi.fn().mockResolvedValue(undefined),
  } as unknown as GenLayerWalletClient;
  const readClient = {
    waitForTransactionReceipt: vi.fn(),
    readContract: vi.fn(),
  } as unknown as GenLayerReadClient;

  const engine = new GenLayerTrialEngine({
    contractAddress: "0xabc" as `0x${string}`,
    walletClient,
    readClient,
  });

  await expect(
    engine.runTrial({ case: sampleCase, policy: samplePolicy, wallet: undefined }),
  ).rejects.toThrow(/invalid transaction hash/i);
  expect(readClient.waitForTransactionReceipt).not.toHaveBeenCalled();
});

it("throws when writeContract returns a non-hex string", async () => {
  const walletClient = {
    writeContract: vi.fn().mockResolvedValue("not-a-hash"),
  } as unknown as GenLayerWalletClient;
  const readClient = {
    waitForTransactionReceipt: vi.fn(),
    readContract: vi.fn(),
  } as unknown as GenLayerReadClient;

  const engine = new GenLayerTrialEngine({
    contractAddress: "0xabc" as `0x${string}`,
    walletClient,
    readClient,
  });

  await expect(
    engine.runTrial({ case: sampleCase, policy: samplePolicy, wallet: undefined }),
  ).rejects.toThrow(/invalid transaction hash/i);
});
```

(If `sampleCase` / `samplePolicy` aren't already defined in this file, copy fixtures from the existing tests in the same file.)

- [ ] **Step 2: Run — expect failures**

```bash
npm test -- tests/lib/genlayer-trial-engine.test.ts
```

Expected: 2 new failures (current code stringifies undefined into `"undefined"` and proceeds).

- [ ] **Step 3: Apply engine fixes**

In `lib/genlayer/genlayer-trial-engine.ts`:

Replace L189-191 (txHash assignment) with:

```ts
const rawHash = (await walletClient.writeContract({
  address: contractAddress,
  functionName: "run_trial",
  args: [caseJson, policyJson],
})) as unknown;

if (typeof rawHash !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(rawHash)) {
  throw new GenLayerTrialEngineExecutionError(
    `writeContract returned an invalid transaction hash: ${String(rawHash)}`,
  );
}
const txHash = rawHash;
```

Note: `value: BigInt(0)` is dropped from the args object.

Replace L201-204 (waitArgs cast) with a typed local interface:

```ts
interface WaitForReceiptArgs {
  hash: string;
  status: "FINALIZED";
}
const waitArgs: WaitForReceiptArgs = { hash: txHash, status: "FINALIZED" };
receiptStatus = (await readClient.waitForTransactionReceipt(
  waitArgs as Parameters<typeof readClient.waitForTransactionReceipt>[0],
)) as { txExecutionResultName?: string };
```

Replace L83-89 (`normalizeJudgment` fallback id) with:

```ts
function normalizeJudgment(raw: RawJudgment, index: number): ValidatorJudgment {
  const validatorName = ensureString(raw.validatorName, `Validator ${index + 1}`);
  const fallbackSlug = (validatorName || "unknown").toLowerCase().replace(/\s+/g, "-");
  return {
    id: ensureString(raw.id, `validator-${fallbackSlug}-${index}`),
    validatorName,
    verdict: ensureVerdict(raw.verdict),
    confidence: ensureNumber(raw.confidence),
    reasoning: ensureString(raw.reasoning),
    citedEvidenceIds: ensureStringArray(raw.citedEvidenceIds),
  };
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm test -- tests/lib/genlayer-trial-engine.test.ts
```

Expected: all pass (existing + 2 new).

- [ ] **Step 5: Commit**

```bash
git add tests/lib/genlayer-trial-engine.test.ts lib/genlayer/genlayer-trial-engine.ts
git commit -m "fix(genlayer-engine): validate txHash, type wait args, stable judgment ids"
```

---

## Task 4: B4 — Contract empty case_id + verdict-copy parity test (test-first)

**Files:**
- Test: `contracts/consent_vault_trial/test_aggregate.py` (modify)
- Modify: `contracts/consent_vault_trial/main.py`

- [ ] **Step 1: Append parity + assertion tests**

Add to `contracts/consent_vault_trial/test_aggregate.py`:

```python
import ast
from pathlib import Path

import pytest

from contracts.consent_vault_trial import aggregate

GOLDEN_VERDICT_COPY = {
    ("Allowed", "Acme", 0, 1): (
        "1 validators found the use compatible with Acme's policy after reviewing 0 linked evidence references.",
        "Archive the receipt, preserve the evidence trail, and monitor for future policy drift.",
    ),
    ("Needs Attribution", "Acme", 5, 2): (
        "2 validators agreed the reuse is likely permissible, but Acme's attribution requirements were not carried through the 5 cited records.",
        "Request corrected crediting and synthetic labeling before escalating beyond Acme's policy workflow.",
    ),
    ("Needs License", "Acme", 5, 3): (
        "3 validators found that the reuse exceeds Acme's standing permissions and points to a licensing gap across 5 cited records.",
        "Pause further distribution and obtain a documented license or remove the reused material.",
    ),
    ("Impersonation Risk", "Acme", 5, 1): (
        "1 validators detected likely identity imitation tied to Acme's protected persona, supported by 5 cited evidence references.",
        "Escalate to trust and safety with the evidence bundle and request urgent review for deceptive synthetic media.",
    ),
    ("Violation", "Acme", 5, 2): (
        "2 validators concluded the reuse conflicts directly with Acme's policy and the 5 cited records support enforcement-ready escalation.",
        "Preserve the receipt, notify the platform, and prepare a formal enforcement or takedown request.",
    ),
}


@pytest.mark.parametrize("args,expected", list(GOLDEN_VERDICT_COPY.items()))
def test_aggregate_verdict_copy_matches_golden(args, expected):
    verdict, creator, evidence, support = args
    assert aggregate.verdict_copy(verdict, creator, evidence, support) == expected


def _extract_verdict_copy_from_main():
    main_src = Path(__file__).parent / "main.py"
    tree = ast.parse(main_src.read_text(encoding="utf-8"))
    for node in tree.body:
        if isinstance(node, ast.FunctionDef) and node.name == "_verdict_copy":
            module = ast.Module(body=[node], type_ignores=[])
            namespace: dict = {}
            exec(compile(module, str(main_src), "exec"), namespace)
            return namespace["_verdict_copy"]
    raise RuntimeError("_verdict_copy not found in main.py")


@pytest.mark.parametrize("args,expected", list(GOLDEN_VERDICT_COPY.items()))
def test_main_py_verdict_copy_matches_golden(args, expected):
    main_verdict_copy = _extract_verdict_copy_from_main()
    assert main_verdict_copy(*args) == expected


def test_aggregate_caller_preserves_case_id():
    judgments = aggregate.normalize_judgments([
        {"id": "v1", "verdict": "Allowed", "confidence": 0.9, "validatorName": "A"},
        {"id": "v2", "verdict": "Allowed", "confidence": 0.8, "validatorName": "B"},
        {"id": "v3", "verdict": "Allowed", "confidence": 0.7, "validatorName": "C"},
    ])
    result_with_id = aggregate.aggregate(judgments, {"id": "case-123"}, {"creatorName": "Acme"})
    assert result_with_id["caseId"] == "case-123"

    result_without_id = aggregate.aggregate(judgments, {"id": ""}, {"creatorName": "Acme"})
    assert result_without_id["caseId"] == ""  # aggregate stays pure; main.py asserts upstream
```

- [ ] **Step 2: Run — expect golden + parity tests pass**

```bash
cd contracts/consent_vault_trial && python -m pytest test_aggregate.py -v
```

Expected: all golden + parity tests pass against the current code (since `aggregate.py` and `main.py` are currently in sync). If a test fails, the duplicated copy is already drifted — fix the drift before continuing.

- [ ] **Step 3: Add empty-`case_id` assertion to `main.py`**

In `contracts/consent_vault_trial/main.py`, modify `run_trial`:

```python
@gl.public.write
def run_trial(self, case_json: str, policy_json: str) -> str:
    """Run the three-validator trial and persist the JSON-encoded result."""
    case = json.loads(case_json)
    policy = json.loads(policy_json)
    case_id = case.get("id", "")
    assert case_id, "case_id must be non-empty"
    prompt = _build_prompt(case, policy)
    # ... rest unchanged, but use the local `case_id` variable instead of
    # re-reading case.get("id", "") later
```

Replace the trailing block:

```python
        result = gl.eq_principle.prompt_comparative(...)
        assert isinstance(result, str)
        case_id = case.get("id", "")
        if case_id:
            self.last_result_by_case[case_id] = result
        return result
```

with:

```python
        result = gl.eq_principle.prompt_comparative(...)
        assert isinstance(result, str)
        self.last_result_by_case[case_id] = result
        return result
```

- [ ] **Step 4: Re-run pytest**

```bash
cd contracts/consent_vault_trial && python -m pytest test_aggregate.py -v
```

Expected: all green. (`main.py` is parsed via AST in the parity test, so the new `assert case_id` inside `run_trial` does not affect the standalone `_verdict_copy` extraction.)

- [ ] **Step 5: Commit**

```bash
git add contracts/consent_vault_trial/main.py contracts/consent_vault_trial/test_aggregate.py
git commit -m "fix(contract): reject empty case_id + parity test for verdict copy"
```

---

## Task 5: B5 — Drift policy doc

**Files:** `contracts/consent_vault_trial/README.md`

- [ ] **Step 1: Append drift policy section**

Append to the end of `contracts/consent_vault_trial/README.md`:

```markdown
## Drift policy

The TypeScript `lib/mock-trial-engine.ts` and the Python contract aggregator
(`main.py` + `aggregate.py`) are independent implementations.

- The mock engine is the offline demo fixture, served when
  `NEXT_PUBLIC_TRIAL_ENGINE` is unset.
- The contract is canonical when `NEXT_PUBLIC_TRIAL_ENGINE=genlayer`.
- Receipt JSON may differ between the two paths — this is intentional for the
  hybrid MVP.
- The parity test in `test_aggregate.py` verifies only that `main.py` and
  `aggregate.py` agree on verdict copy. TS ↔ Python drift is allowed and
  re-evaluated after the demo.
```

- [ ] **Step 2: Commit**

```bash
git add contracts/consent_vault_trial/README.md
git commit -m "docs(contract): document mock engine vs contract drift policy"
```

---

## Task 6: B6.1 — Wallet button label helper + retry

**Files:**
- Modify test: `components/wallet/wallet-connect-button.test.tsx`
- Modify: `components/wallet/wallet-connect-button.tsx`

- [ ] **Step 1: Append failing test**

Add to `components/wallet/wallet-connect-button.test.tsx` (using the existing mocking pattern in this file — the snippet below assumes a vi.mock wrapper for `useGenLayerWallet` already exists):

```tsx
it("offers reload action when wallet is missing", async () => {
  const reload = vi.fn();
  vi.stubGlobal("location", { ...window.location, reload });
  // mockUseGenLayerWallet returns status "missing", address null.
  render(<WalletConnectButton />);
  const button = screen.getByRole("button");
  expect(button).not.toBeDisabled();
  expect(button.textContent).toMatch(/reload/i);
  button.click();
  expect(reload).toHaveBeenCalledOnce();
});
```

If the existing test file has no shared mock harness, mock at the top of the file:

```tsx
vi.mock("@/components/providers/genlayer-wallet-provider", () => ({
  useGenLayerWallet: () => ({
    address: null,
    chainId: null,
    client: null,
    error: null,
    networkName: "Studionet",
    status: "missing",
    wallet: null,
    connect: vi.fn(),
  }),
}));
```

- [ ] **Step 2: Run — expect failure**

```bash
npm test -- components/wallet/wallet-connect-button.test.tsx
```

Expected: FAIL — current button is disabled when missing.

- [ ] **Step 3: Refactor the component**

Replace `components/wallet/wallet-connect-button.tsx`:

```tsx
"use client";

import { LoaderCircle, PlugZap, RefreshCw, Wallet } from "lucide-react";
import { useGenLayerWallet } from "@/components/providers/genlayer-wallet-provider";
import { formatWalletAddress } from "@/lib/genlayer/wallet";
import type { WalletConnectionStatus } from "@/lib/genlayer/wallet";

function buttonLabel(status: WalletConnectionStatus, address: string | null) {
  if (address) return formatWalletAddress(address);
  switch (status) {
    case "missing":
      return "Reload after install";
    case "connecting":
      return "Connecting wallet";
    default:
      return "Connect wallet";
  }
}

function buttonIcon(status: WalletConnectionStatus, address: string | null) {
  if (status === "connecting") {
    return <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />;
  }
  if (address) {
    return <Wallet className="h-4 w-4 text-accent" aria-hidden="true" />;
  }
  if (status === "missing") {
    return <RefreshCw className="h-4 w-4 text-accent" aria-hidden="true" />;
  }
  return <PlugZap className="h-4 w-4 text-accent" aria-hidden="true" />;
}

export function WalletConnectButton() {
  const { address, connect, error, networkName, status } = useGenLayerWallet();
  const isConnecting = status === "connecting";
  const isMissing = status === "missing";

  const handleClick = () => {
    if (isMissing) {
      window.location.reload();
      return;
    }
    void connect();
  };

  return (
    <div className="flex flex-col gap-2 lg:items-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={isConnecting}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-ink/10 bg-card/70 px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition hover:border-accent/20 hover:bg-accent/8 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {buttonIcon(status, address)}
        {buttonLabel(status, address)}
      </button>
      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
        {address ? networkName : error ?? "GenLayer wallet"}
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm test -- components/wallet/wallet-connect-button.test.tsx
```

Expected: green.

- [ ] **Step 5: Commit**

```bash
git add components/wallet/wallet-connect-button.tsx components/wallet/wallet-connect-button.test.tsx
git commit -m "fix(wallet-button): extract label helper, allow reload after install"
```

---

## Task 7: B6.2 — Collapse trial-screen runners

**Files:** `components/trial/trial-screen.tsx`

- [ ] **Step 1: Refactor runner**

In `TrialWorkspace`, replace `executeTrial` (L67-84) and the auto-run effect (L93-132) with one shared helper:

```tsx
const runTrial = React.useCallback(
  async (cancelledRef: React.MutableRefObject<boolean>) => {
    setStatus("running");
    setErrorMessage(null);
    try {
      const engine = getTrialEngine({ walletClient: walletClientRef.current });
      const nextResult = await engine.runTrial({
        case: consentCaseRef.current,
        policy: policyRef.current,
        wallet: buildReceiptWalletMetadata(walletRef.current),
      });
      if (cancelledRef.current) return;
      setResult(nextResult);
      dispatch({ type: "receipt/save", payload: nextResult.receipt });
      setStatus("complete");
    } catch (caught) {
      if (cancelledRef.current) return;
      setErrorMessage(caught instanceof Error ? caught.message : "Trial run failed.");
      setStatus("error");
    }
  },
  [dispatch],
);

const manualCancelRef = React.useRef({ current: false });

const executeTrial = React.useCallback(() => {
  void runTrial(manualCancelRef.current);
}, [runTrial]);

React.useEffect(() => {
  if (hasSeededReceipt) return;
  const cancelled = { current: false };
  void runTrial(cancelled);
  return () => { cancelled.current = true; };
}, [caseId, policyId, hasSeededReceipt, runTrial]);
```

- [ ] **Step 2: Run existing tests**

```bash
npm test
```

Expected: trial-related tests still pass (existing coverage exercises the same flow).

- [ ] **Step 3: Manual smoke**

```bash
npm run dev
```

Open `/cases/<seeded-id>/trial` and click "Re-run trial". Verify the consensus meter updates and no console errors.

- [ ] **Step 4: Commit**

```bash
git add components/trial/trial-screen.tsx
git commit -m "refactor(trial-screen): unify auto-run and manual run via shared helper"
```

---

## Task 8: B6.3 + B6.4 + B6.5 — Misc polish

**Files:**
- `components/trial/trial-guard.tsx`
- `app/opengraph-image.tsx`
- `scripts/smoke-contract.mjs`

- [ ] **Step 1: Tighten `getConfiguredContractAddress` regex**

In `components/trial/trial-guard.tsx`, replace:

```tsx
function getConfiguredContractAddress(): string | null {
  const value = (process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS ?? "").trim();
  return value.startsWith("0x") ? value : null;
}
```

with:

```tsx
const CONTRACT_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

function getConfiguredContractAddress(): string | null {
  const value = (process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS ?? "").trim();
  return CONTRACT_ADDRESS_RE.test(value) ? value : null;
}
```

(Helper is already at module scope in current code.)

- [ ] **Step 2: OpenGraph chain id + font hints**

In `app/opengraph-image.tsx`:

```tsx
import { studionet } from "genlayer-js/chains";
```

Replace L85:

```tsx
<span>{`Studionet · Chain id ${studionet.id}`}</span>
```

Drop `fontFamily: "Georgia, serif"` from the outer div's style (L23) and `fontFamily: "ui-monospace, monospace"` from L28 and L40 — `ImageResponse` ignores them. Leave the rest intact.

- [ ] **Step 3: Smoke script regex**

In `scripts/smoke-contract.mjs`, replace `resolveContractAddress`:

```js
const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

function resolveContractAddress() {
  const fromCli = process.argv[2];
  const fromEnv = process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS;
  const candidate = (fromCli ?? fromEnv ?? "").trim();
  return ADDRESS_RE.test(candidate) ? candidate : null;
}
```

In `main()`, tighten the failure message:

```js
if (!address) {
  console.error(
    "[smoke] Missing or malformed contract address. Pass a 0x-prefixed 40-hex-char address as the first arg or set NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS.",
  );
  process.exit(2);
}
```

- [ ] **Step 4: Verify**

```bash
npm run lint && npm run build
```

Expected: green.

- [ ] **Step 5: Commit**

```bash
git add components/trial/trial-guard.tsx app/opengraph-image.tsx scripts/smoke-contract.mjs
git commit -m "fix(polish): tighter address regex, dynamic chain id in OG image"
```

---

## Task 9: Final verification

- [ ] **Step 1: Full test suite**

```bash
npm test
```

Expected: all green.

- [ ] **Step 2: Lint + build**

```bash
npm run lint && npm run build
```

Expected: green.

- [ ] **Step 3: Pytest**

```bash
cd contracts/consent_vault_trial && python -m pytest -v && cd ../..
```

Expected: green.

- [ ] **Step 4: E2E sanity (dashboard only)**

```bash
npm run test:e2e -- --grep dashboard
```

Expected: green. (Skip full E2E; meta + dashboard cover the changed surface.)

- [ ] **Step 5: Manual demo flow**

```bash
npm run dev
```

Walk: dashboard → policy → new case → evidence → trial (re-run) → receipt. No console errors. Wallet connect button shows "Reload after install" when MetaMask is uninstalled (test in incognito or after extension disable).

- [ ] **Step 6: Push branch (only if user approves)**

```bash
git push -u origin codex/genlayer-wallet-v1
```

Then open a PR via `gh pr create` per repo conventions.

---

## Spec coverage check

| Spec section | Implementing task |
|---|---|
| B1 verify Tailwind | Task 1 |
| B2 wallet rebuild + validate + focus + non-silent catch | Task 2 |
| B3 txHash + judgment id + drop BigInt + typed wait args | Task 3 |
| B4 empty case_id + parity test | Task 4 |
| B5 drift policy doc | Task 5 |
| B6.1 button label + reload | Task 6 |
| B6.2 trial-screen collapse | Task 7 |
| B6.3 hoist env reader | Task 8 |
| B6.4 OG chain id + font | Task 8 |
| B6.5 smoke regex | Task 8 |
| B7 tests | Inlined into Tasks 2/3/4/6 (TDD) |
| Verification commands | Task 9 |

All spec sections mapped. No placeholders remain.
