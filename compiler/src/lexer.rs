#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Token {
    Ident(String),
    Number(String),
    LParen, RParen, LBrace, RBrace,
    Arrow, Colon, Semicolon, Comma,
    Eof,
}

pub fn lex(_src: &str) -> Vec<Token> {
    // Minimal stub; real lexer lands in Step 2.
    vec![Token::Eof]
}
