<<<<<<< HEAD
<<<<<<< HEAD
pub fn type_check() {}
=======
pub fn typecheck() -> Result<(), String> {
    Ok(())
}
>>>>>>> origin/pybde0-codex/create-top-level-repo-layout
=======
use crate::ast::Module;
use crate::effects::Effect;

#[derive(Debug)]
pub struct TypeError(pub String);
impl std::fmt::Display for TypeError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}
impl std::error::Error for TypeError {}

pub fn typecheck(m: &Module) -> Result<(), TypeError> {
    if m.name.is_empty() {
        return Err(TypeError("empty module name".into()));
    }
    for e in &m.effects {
        match e {
            Effect::Db | Effect::Net | Effect::Now | Effect::Kms | Effect::Serial => {}
        }
    }
    Ok(())
}
>>>>>>> origin/w5t1y7-codex/create-top-level-repo-layout
