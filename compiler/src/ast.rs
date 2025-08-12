use crate::effects::Effect;

#[derive(Debug, Clone)]
pub enum Item {
    Actor { name: String },
    Func { name: String },
}

#[derive(Debug, Clone)]
pub struct Module {
    pub name: String,
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
