<<<<<<< HEAD
<<<<<<< HEAD
pub fn analyze_effects() {}
=======
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum Effect { Db, Net, Now, Kms, Serial }

pub fn effects_graph() -> Vec<(String, Effect)> {
    vec![]
}
>>>>>>> origin/pybde0-codex/create-top-level-repo-layout
=======
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum Effect {
    Db,
    Net,
    Now,
    Kms,
    Serial,
}

impl Effect {
    pub fn from_ident(s: &str) -> Option<Self> {
        match s {
            "Db" => Some(Effect::Db),
            "Net" => Some(Effect::Net),
            "Now" => Some(Effect::Now),
            "Kms" => Some(Effect::Kms),
            "Serial" => Some(Effect::Serial),
            _ => None,
        }
    }
}

pub fn effects_graph(m: &crate::ast::Module) -> Vec<(String, Effect)> {
    m.effects
        .iter()
        .cloned()
        .map(|e| (m.name.clone(), e))
        .collect()
}
>>>>>>> origin/w5t1y7-codex/create-top-level-repo-layout
