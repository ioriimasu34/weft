<<<<<<< HEAD
pub fn analyze_effects() {}
=======
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum Effect { Db, Net, Now, Kms, Serial }

pub fn effects_graph() -> Vec<(String, Effect)> {
    vec![]
}
>>>>>>> origin/pybde0-codex/create-top-level-repo-layout
