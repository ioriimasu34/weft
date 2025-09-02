<<<<<<< HEAD
pub struct Ast;
=======
#[derive(Debug, Clone)]
pub enum Expr {
    Number(f64),
    Ident(String),
}

#[derive(Debug, Clone)]
pub struct Module {
    pub name: String,
    pub items: Vec<String>, // placeholder for future AST items
}
>>>>>>> origin/pybde0-codex/create-top-level-repo-layout
