use crate::ast::Module;

pub fn parse(_tokens: &[crate::lexer::Token]) -> Result<Module, String> {
    Ok(Module { name: "main".into(), items: vec![] })
}
