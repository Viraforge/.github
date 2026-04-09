#!/usr/bin/env node

import { callMiniMax } from "./ai-review.mjs";

const MAX_AFFECTED_FILES = 5;

const SYSTEM_PROMPT = `You are a senior software engineer fixing bounded code review findings.

Rules:
- Fix only the issues described in the findings.
- Do not modify .github/workflows files.
- Return full file contents for changed files only.
- Skip anything architectural or ambiguous.

Respond with JSON only:
{
  "patches": [
    {
      "file": "path/to/file.ts",
      "content": "full updated file contents"
    }
  ],
  "explanation": "Short summary",
  "skipped": [
    {
      "file": "path/to/file.ts",
      "reason": "Why skipped"
    }
  ]
}`;

export function collectAffectedFiles(findings) {
  return [...new Set((findings || []).map((finding) => finding.file).filter(Boolean))];
}

export function parseRemediationResponse(raw) {
  let text = String(raw || "").trim();
  const fenceMatch = text.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/);
  if (fenceMatch) text = fenceMatch[1].trim();

  try {
    const parsed = JSON.parse(text);
    return {
      patches: Array.isArray(parsed.patches) ? parsed.patches : [],
      explanation: String(parsed.explanation || ""),
      skipped: Array.isArray(parsed.skipped) ? parsed.skipped : [],
    };
  } catch {
    return { patches: [], explanation: "Failed to parse remediation response", skipped: [] };
  }
}

export async function runRemediation({ apiKey, findings, fileContents, diff }) {
  const affectedFiles = collectAffectedFiles(findings);
  if (!apiKey) throw new Error("MINIMAX_API_KEY is required");
  if (affectedFiles.length === 0 || affectedFiles.length > MAX_AFFECTED_FILES) {
    return { patches: [], explanation: "No eligible remediation targets", skipped: [] };
  }

  const prompt = [
    "Findings:",
    "```json",
    JSON.stringify(findings, null, 2),
    "```",
    "Files:",
    "```json",
    JSON.stringify(fileContents, null, 2),
    "```",
    "Original diff:",
    "```diff",
    diff || "",
    "```",
  ].join("\n");

  const responseText = await callMiniMax(apiKey, SYSTEM_PROMPT, prompt);
  const result = parseRemediationResponse(responseText);
  result.patches = result.patches.filter((patch) => patch.file && !patch.file.startsWith(".github/workflows/"));
  return result;
}

async function main() {
  try {
    const result = await runRemediation({
      apiKey: process.env.MINIMAX_API_KEY,
      findings: JSON.parse(process.env.REMEDIATION_FINDINGS || "[]"),
      fileContents: JSON.parse(process.env.REMEDIATION_FILE_CONTENTS || "{}"),
      diff: process.env.REMEDIATION_DIFF || "",
    });
    console.log(JSON.stringify(result));
  } catch (error) {
    console.log(JSON.stringify({
      patches: [],
      explanation: String(error.message || "Remediation failed"),
      skipped: [],
    }));
    process.exit(1);
  }
}

main();
