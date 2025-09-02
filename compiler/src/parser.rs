<<<<<<< HEAD
pub fn parse<T>(_tokens: &[T]) {}
=======
use crate::ast::Module;

pub fn parse(_tokens: &[crate::lexer::Token]) -> Result<Module, String> {
    Ok(Module { name: "main".into(), items: vec![] })
}
>>>>>>> origin/pybde0-codex/create-top-level-repo-layout
