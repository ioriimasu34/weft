<<<<<<< HEAD
<<<<<<< HEAD
pub struct Ast;
=======
#[derive(Debug, Clone)]
pub enum Expr {
    Number(f64),
    Ident(String),
=======
use crate::effects::Effect;

#[derive(Debug, Clone)]
pub enum Item {
    Actor { name: String },
    Func { name: String },
>>>>>>> origin/w5t1y7-codex/create-top-level-repo-layout
}

#[derive(Debug, Clone)]
pub struct Module {
    pub name: String,
<<<<<<< HEAD
    pub items: Vec<String>, // placeholder for future AST items
}
>>>>>>> origin/pybde0-codex/create-top-level-repo-layout
=======
    pub effects: Vec<Effect>,
    pub items: Vec<Item>,
}

impl Module {
    pub fn new(name: String) -> Self {
        Self {
            name,
            effects: vec![],
            items: vec![],
        }
    }
}
>>>>>>> origin/w5t1y7-codex/create-top-level-repo-layout
