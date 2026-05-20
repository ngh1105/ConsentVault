#!/usr/bin/env node
/**
 * Seeding helper for the deployed ConsentVaultTrial contract.
 *
 * Default mode is `--dry-run`: prints the case + policy payloads and the
 * exact `genlayer-cli` invocations needed to seed each case, without
 * sending any transaction or touching the network. The dry-run output is
 * intentionally copy-paste safe so an operator with a funded Studionet
 * signer can execute it manually.
 *
 * Two cases are seeded:
 *   1. impersonation dispute   — voice clone style endorsement
 *   2. dataset consent dispute — model training without permission
 *
 * Usage:
 *   node scripts/seed-cases.mjs                                 # dry-run (default)
 *   node scripts/seed-cases.mjs --address 0xCONTRACT            # dry-run with address
 *   node scripts/seed-cases.mjs --execute                       # blocked: see below
 *
 * Execute mode is intentionally not implemented in this script. Sending a
 * `run_trial` transaction requires a funded Studionet account selected via
 * `genlayer account use <alias>`, plus a deployed contract address. Use
 * the printed `genlayer write` commands directly so the signer prompt and
 * receipt land in your own terminal.
 */

import process from "node:process";

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;
const PLACEHOLDER_ADDRESS = "0xYOUR_DEPLOYED_ADDRESS";

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));

function readOption(name) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  const next = args[idx + 1];
  if (!next || next.startsWith("--")) return undefined;
  return next;
}

const isExecute = flags.has("--execute");
const cliAddress = readOption("address");
const envAddress = process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS;
const address = (cliAddress ?? envAddress ?? "").trim() || PLACEHOLDER_ADDRESS;

if (address !== PLACEHOLDER_ADDRESS && !ADDRESS_RE.test(address)) {
  console.error(`[seed] Invalid contract address: "${address}" (expected 0x + 40 hex).`);
  process.exit(2);
}

if (isExecute) {
  console.error(
    "[seed] --execute is not implemented in this script. Run the printed " +
      "`genlayer write` commands manually so the signer prompt and receipt " +
      "stay in your terminal. See docs/contract-seeding.md.",
  );
  process.exit(2);
}

const impersonationPolicy = {
  id: "policy-impersonation",
  creatorName: "Mara Ellison",
  creatorHandle: "@maraellison",
  allowedUses: [
    "Editorial commentary with explicit credit",
    "Private classroom critique excerpts under 30 seconds",
  ],
  blockedUses: [
    "Voice cloning for ads or endorsements",
    "Synthetic avatars that imitate the creator's likeness",
    "Commercial dataset resale",
  ],
  attributionRules: "Credit Mara Ellison by name and handle in the first visible line.",
  licenseRules: "Commercial reuse requires a signed license and a dated project scope.",
  jurisdictionNote: "Creator reserves additional publicity rights protections in California.",
  createdAt: "2026-05-15T09:00:00.000Z",
};

const impersonationCase = {
  id: "seed-case-voice-clone",
  title: "Voice clone endorsement dispute",
  status: "In Review",
  policyId: impersonationPolicy.id,
  sourceUrl: "https://creator.example/mara/original-podcast",
  aiOutputUrl: "https://ai.example/renders/voice-clone",
  platformUrl: "https://platform.example/posts/mara-endorsement",
  notes: "Audio ad mimics the creator's voice cadence and implies an endorsement.",
  originalContent: "Original podcast narration discussing creator-owned licensing boundaries.",
  aiOutput: "Synthetic audio ad that sounds like a direct endorsement of a fintech app.",
  evidenceItems: [
    {
      id: "ev-imp-source",
      type: "source",
      title: "Original podcast clip",
      url: "https://creator.example/mara/original-podcast",
      description: "Reference clip from the creator's official podcast feed.",
      capturedAt: "2026-05-15T09:10:00.000Z",
    },
    {
      id: "ev-imp-output",
      type: "output",
      title: "Synthetic ad output",
      url: "https://ai.example/renders/voice-clone",
      description: "Generated voice sample captured from the ad network archive.",
      capturedAt: "2026-05-15T09:12:00.000Z",
    },
    {
      id: "ev-imp-platform",
      type: "platform",
      title: "Platform listing",
      url: "https://platform.example/posts/mara-endorsement",
      description: "Sponsored placement page showing the synthetic endorsement.",
      capturedAt: "2026-05-15T09:14:00.000Z",
    },
  ],
  createdAt: "2026-05-15T09:05:00.000Z",
};

const datasetPolicy = {
  id: "policy-dataset-consent",
  creatorName: "Lior Hagen",
  creatorHandle: "@liorhagen",
  allowedUses: [
    "Academic research with informed consent and de-identified samples",
    "Personal portfolio reposts with attribution",
  ],
  blockedUses: [
    "Inclusion in commercial training datasets without a written agreement",
    "Resale or sublicensing of derived embeddings",
    "Use to fine-tune models that imitate the author's writing voice",
  ],
  attributionRules: "Cite the original publication URL in dataset metadata and any derived release notes.",
  licenseRules: "Commercial training requires a per-project license and revocation clause.",
  jurisdictionNote: "Author asserts GDPR and CCPA data subject rights; opt-out requests must be honored within 30 days.",
  createdAt: "2026-05-16T08:30:00.000Z",
};

const datasetCase = {
  id: "seed-case-dataset-consent",
  title: "Dataset consent dispute — unlicensed training corpus",
  status: "In Review",
  policyId: datasetPolicy.id,
  sourceUrl: "https://creator.example/lior/essays",
  aiOutputUrl: "https://ai.example/models/style-clone",
  platformUrl: "https://dataset.example/listings/style-clone-corpus",
  notes:
    "Author's essay archive appears in a third-party training corpus advertised for commercial fine-tuning. " +
    "No license, opt-in, or attribution recorded.",
  originalContent: "Long-form essay archive published with explicit non-commercial training restriction.",
  aiOutput: "Fine-tuned model card markets the ability to imitate the author's prose style.",
  evidenceItems: [
    {
      id: "ev-ds-source",
      type: "source",
      title: "Author essay archive",
      url: "https://creator.example/lior/essays",
      description: "Public essay archive with policy banner restricting training reuse.",
      capturedAt: "2026-05-16T08:40:00.000Z",
    },
    {
      id: "ev-ds-listing",
      type: "platform",
      title: "Training dataset listing",
      url: "https://dataset.example/listings/style-clone-corpus",
      description:
        "Commercial dataset listing that names the author's archive as a contributing source.",
      capturedAt: "2026-05-16T08:46:00.000Z",
    },
    {
      id: "ev-ds-model",
      type: "output",
      title: "Fine-tuned model card",
      url: "https://ai.example/models/style-clone",
      description: "Model card advertising prose-style imitation derived from the listed corpus.",
      capturedAt: "2026-05-16T08:52:00.000Z",
    },
    {
      id: "ev-ds-policy",
      type: "policy",
      title: "Author training policy snapshot",
      url: "https://creator.example/lior/policy",
      description: "Snapshot of the author's published policy disallowing commercial training reuse.",
      capturedAt: "2026-05-16T08:55:00.000Z",
    },
  ],
  createdAt: "2026-05-16T08:35:00.000Z",
};

const seeds = [
  { label: "1. impersonation dispute", policy: impersonationPolicy, case: impersonationCase },
  { label: "2. dataset consent dispute", policy: datasetPolicy, case: datasetCase },
];

function shellQuoteJson(value) {
  return JSON.stringify(value).replace(/'/g, `'\\''`);
}

function printSeed({ label, policy, case: kase }) {
  const caseJson = JSON.stringify(kase);
  const policyJson = JSON.stringify(policy);
  console.log("");
  console.log(`# ${label}`);
  console.log(`# case id:   ${kase.id}`);
  console.log(`# policy:    ${policy.creatorName} (${policy.creatorHandle})`);
  console.log(`# evidence:  ${kase.evidenceItems.length} item(s)`);
  console.log("");
  console.log("# case payload:");
  console.log(JSON.stringify(kase, null, 2));
  console.log("# policy payload:");
  console.log(JSON.stringify(policy, null, 2));
  console.log("");
  console.log("# seed (run_trial):");
  console.log(
    `genlayer write \\\n  --address ${address} \\\n  --function run_trial \\\n  --args '[${shellQuoteJson(caseJson)}, ${shellQuoteJson(policyJson)}]'`,
  );
  console.log("");
  console.log("# verify (get_result_by_case):");
  console.log(
    `genlayer call \\\n  --address ${address} \\\n  --function get_result_by_case \\\n  --args '[${shellQuoteJson(kase.id)}]'`,
  );
}

console.log("# ConsentVaultTrial seeding plan (dry-run)");
console.log(`# contract:  ${address}${address === PLACEHOLDER_ADDRESS ? "  (placeholder — pass --address or set NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS)" : ""}`);
console.log(`# network:   studionet (chain id 61999)`);
console.log(`# rpc:       https://studio.genlayer.com/api (default; override with NEXT_PUBLIC_GENLAYER_RPC_URL)`);
console.log(`# seeds:     ${seeds.length}`);
console.log("#");
console.log("# Preconditions before running the printed commands:");
console.log("#   - genlayer-cli installed and on PATH (npm install -g genlayer-cli)");
console.log("#   - genlayer network set studionet");
console.log("#   - a funded Studionet account selected via `genlayer account use <alias>`");

for (const seed of seeds) {
  printSeed(seed);
}

console.log("");
console.log("# After both writes finalize, smoke the read path with:");
console.log(`#   npm run smoke:contract -- ${address}`);
