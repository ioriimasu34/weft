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
