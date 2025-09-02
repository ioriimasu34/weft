<<<<<<< HEAD
export function query() {
  return "db";
=======
export async function query(_sql: string, _params: unknown[] = []) {
  return { rows: [], rowCount: 0 };
>>>>>>> origin/pybde0-codex/create-top-level-repo-layout
}
