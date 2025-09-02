<<<<<<< HEAD
export function request() {
  return "net";
=======
export async function get(_url: string): Promise<{ status: number; body: string }> {
  return { status: 200, body: "" };
>>>>>>> origin/pybde0-codex/create-top-level-repo-layout
}
