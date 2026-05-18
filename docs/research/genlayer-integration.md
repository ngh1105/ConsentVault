# GenLayer Integration Research

> Tóm tắt API + quy trình deploy + signature SDK để các task implementation không bị chặn. Nguồn: docs.genlayer.com (truy cập 2026-05-18).

## 1. Studionet network

| Setting        | Value                                     |
| -------------- | ----------------------------------------- |
| GenLayer RPC   | `https://studio.genlayer.com/api`         |
| Chain ID       | `61999`                                   |
| Currency       | `GEN`                                     |
| Explorer       | https://explorer-studio.genlayer.com      |
| Faucet         | Built-in — nút 💧 trong account selector |

- **Persistence:** temporary (theo docs). Phù hợp hosted demo, không phù hợp persistent production data.
- Studio web app: https://studio.genlayer.com — UI cho deploy + interact contract.

## 2. Intelligent Contract (`py-genlayer`)

### Skeleton

```python
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *

class MyContract(gl.Contract):
    # Persistent fields — annotate types, no plain `int`
    counter: u256

    def __init__(self, initial: u256):
        self.counter = initial

    @gl.public.view
    def get_counter(self) -> int:
        return self.counter

    @gl.public.write
    def increment(self):
        self.counter += 1
```

### Quan trọng

- Dòng đầu file phải là magic version comment chứa hash phiên bản GenVM (lấy từ docs/example mới nhất).
- `from genlayer import *` đem mọi symbol cần thiết vào scope; namespace `gl.*` cho APIs nâng cao.
- Một file = một contract class extends `gl.Contract`.
- Constructor `__init__` không decorate; method public phải có `@gl.public.view` (read-only) hoặc `@gl.public.write` (mutable, có thể `.payable`).
- Persistent storage phải khai báo trong class body với type. Gán `self.x = ...` ngoài class body → bị discard.
- `int` cấm cho persistent field — dùng `u256`, `i32`, hoặc `bigint`. List → `DynArray[T]`, dict → `TreeMap[K, V]`.

### Equivalence Principle (LLM consensus)

3 pattern chính, từ đơn giản đến linh hoạt:

1. **`gl.eq_principle.strict_eq(fn)`** — kết quả phải khớp chuỗi sau normalize. Dùng cho RPC/REST API ổn định.

2. **`gl.eq_principle.prompt_comparative(fn, principle)`** — leader + validator cùng chạy `fn`, một LLM template `EqComparative` so sánh hai output theo `principle` (ngôn ngữ tự nhiên).
   ```python
   result = gl.eq_principle.prompt_comparative(
       lambda: classify(case_json, policy_json),
       principle="Verdicts must match. Confidence within 0.15."
   )
   ```

3. **`gl.eq_principle.prompt_non_comparative(fn, task, criteria)`** — leader làm task, validator chỉ judge output theo criteria, không re-run.
   ```python
   result = gl.eq_principle.prompt_non_comparative(
       lambda: load_input(),
       task="Summarize this dispute and produce a verdict",
       criteria="Verdict must be one of [Allowed, Needs Attribution, Needs License, Impersonation Risk, Violation]. Reasoning must cite evidence ids."
   )
   ```

LLM call thấp hơn dùng `gl.nondet.exec_prompt(prompt)` (raw) hoặc `run_nondet_unsafe` + custom validator function (full control).

### Quyết định cho ConsentVaultTrial

- Dùng `prompt_comparative` cho mỗi validator persona để vẫn giữ logic 3 reviewer độc lập (Signal House, Rights Ledger, Public Interest Lab) và để consensus engine của GenLayer nhận xét agreement.
- Method chính: `@gl.public.write def run_trial(self, case_json: str, policy_json: str) -> str` trả JSON-encoded `TrialResult`.
- Lý do `write` thay vì `view`: mỗi lần chạy có non-deterministic LLM call, cần consensus — phải là transaction. Frontend phải `writeContract` rồi đọc receipt.

## 3. genlayer-js SDK

### Client creation

```ts
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

// Read client — không cần wallet, gọi RPC trực tiếp
const readClient = createClient({ chain: studionet });

// Write client — cần account + provider (wallet)
const writeClient = createClient({
  chain: studionet,
  account: address as `0x${string}`,
  provider: window.ethereum,
});

// Đảm bảo wallet đang ở đúng chain trước khi write
await writeClient.connect("studionet");
```

### Read

```ts
const result = await readClient.readContract({
  address: contractAddress,
  functionName: "get_state",
  args: [],
  stateStatus: "accepted",
});
```

### Write + wait

```ts
import { TransactionStatus, ExecutionResult } from "genlayer-js/types";

const txHash = await writeClient.writeContract({
  address: contractAddress,
  functionName: "run_trial",
  args: [caseJson, policyJson],
  value: BigInt(0),
});

const receipt = await readClient.waitForTransactionReceipt({
  hash: txHash,
  status: TransactionStatus.FINALIZED,
});

if (receipt.txExecutionResultName === ExecutionResult.FINISHED_WITH_RETURN) {
  // safe to readContract for any state derived
} else if (receipt.txExecutionResultName === ExecutionResult.FINISHED_WITH_ERROR) {
  throw new Error("Contract execution failed");
}
```

### Decode return data

`writeContract` return là tx hash, không phải data. Để lấy giá trị `run_trial` trả ra:
- Lưu `TrialResult` vào storage trong contract: `self.last_result_for_case[case_id] = result`.
- Frontend `writeContract` → `waitForTransactionReceipt` → `readContract({ functionName: "get_result_for_case", args: [case_id] })`.
- Hoặc đọc `receipt.return_data` (hex-encoded) qua `debugTraceTransaction`.

→ Quyết định cho MVP: **lưu vào storage `last_result_by_case_id: TreeMap[str, str]`** rồi `readContract` lấy ra. Đơn giản và minh bạch hơn parse return_data.

## 4. Deploy

### Lựa chọn: Studio Web UI (khuyến nghị MVP)

1. Mở https://studio.genlayer.com.
2. Connect wallet (MetaMask) → bấm 💧 nhận test GEN.
3. Tab "Contracts" → paste/upload `contracts/consent_vault_trial/main.py`.
4. Studio tự detect constructor params từ code → fill values → bấm Deploy.
5. Sau deploy thành công, copy contract address (định dạng `0x...`).
6. Lưu address vào `.env.local`: `NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0x...`.

### Lựa chọn: CLI (`genlayer-cli`, reproducible)

```bash
npm install -g genlayer-cli
genlayer init
genlayer network set studionet
genlayer account create   # hoặc import existing
genlayer deploy --contract contracts/consent_vault_trial/main.py
```

Output sẽ có contract address. CLI tự gọi `https://studio.genlayer.com/api` khi `network=studionet`.

## 5. Frontend integration plan

```
trial-screen.tsx
  └── getTrialEngine() ── factory ──> GenLayerTrialEngine
                                          │
                                          ├── readClient (chain=studionet)
                                          ├── writeClient (account+provider từ wallet)
                                          └── runTrial({ case, policy }):
                                                 ├── caseJson = JSON.stringify(case)
                                                 ├── policyJson = JSON.stringify(policy)
                                                 ├── tx = writeContract(run_trial, [caseJson, policyJson])
                                                 ├── waitForTransactionReceipt(FINALIZED)
                                                 ├── result = readContract(get_result_by_case, [case.id])
                                                 ├── parsed = JSON.parse(result)
                                                 └── return TrialResult với wallet metadata
```

## 6. Open items / risks

- **Studionet ephemeral storage:** Demo URL có thể mất state nếu Studionet reset. Cần document rõ "demo state is ephemeral" trong README.
- **LLM latency:** `prompt_comparative` chạy 3 LLM calls (1 leader + 2 validator compare) per validator persona × 3 persona = 9 LLM calls. Có thể chậm 30–60s. Cần spinner + progress copy trong UI.
- **Cost:** Mỗi `writeContract` tiêu test GEN. Faucet cấp đủ cho demo, nhưng nhiều run liên tục có thể cạn — UI cần gracefully handle failure.
- **Magic version hash:** Hash trong magic comment có thể thay đổi theo thời gian. Trước khi deploy nên check Studio web UI cho hash mới nhất. Hash hiện tại lấy từ docs example: `1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`.

## 7. Decisions cho các task tiếp theo

- [R1] Funding: dùng built-in faucet 💧 trên Studionet — không cần task riêng.
- [R2] Deploy method: **Studio web UI** cho deploy ban đầu (đơn giản nhất); CLI là backup option document trong `docs/deploy-contract.md`.
- [R3] Reference: dựa vào `docs.genlayer.com` example `Wizard of Coin` + `LLM Hello World Comparative` cho pattern — không cần repo bên ngoài.

---

_Last updated: 2026-05-18. Source: docs.genlayer.com pages: networks, intelligent-contracts/first-contract, equivalence-principle, examples/wizard-of-coin, decentralized-applications/genlayer-js, api-references/genlayer-cli/contracts/deploy._
