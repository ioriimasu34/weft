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
