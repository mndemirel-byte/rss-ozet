// .claude/hooks/check.mjs — computational sensor: tip + lint + test
// PostToolUse'ta exit 2 düzenlemeyi geri almaz; stderr'i ajana besler [3].
import { spawnSync } from "node:child_process";

const checks = [
  ["TİP", "npx", ["tsc", "--noEmit"]],
  ["LINT", "npm", ["run", "--silent", "lint"]],
  ["TEST", "npm", ["test", "--silent"]],
];

let failures = "";
for (const [name, cmd, args] of checks) {
  const r = spawnSync(cmd, args, {
    encoding: "utf8",
    cwd: process.env.CLAUDE_PROJECT_DIR ?? process.cwd(),
    shell: process.platform === "win32",
  });
  if (r.status !== 0) {
    failures += `\n--- ${name} ---\n${r.stdout ?? ""}${r.stderr ?? ""}`;
  }
}

if (failures) {
  console.error(
    "Son düzenleme aşağıdaki kontrolleri kırdı. Başka bir işe geçmeden " +
      "önce bunları düzelt:" +
      failures +
      "\nYönerge: Önce tip hatalarını, sonra lint'i, sonra testleri düzelt. " +
      "Testi zayıflatarak geçirme; kaynağı düzelt. " +
      "Düzeltmenden sonra bu kontroller otomatik yeniden çalışacak."
  );
  process.exit(2);
}
process.exit(0);
