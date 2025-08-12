#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum Effect { Db, Net, Now, Kms, Serial }

pub fn effects_graph() -> Vec<(String, Effect)> {
    vec![]
}
