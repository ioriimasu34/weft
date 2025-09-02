<<<<<<< HEAD
<<<<<<< HEAD
pub fn lex(_input: &str) {}
=======
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
>>>>>>> origin/pybde0-codex/create-top-level-repo-layout
=======
#[derive(Debug, Clone, PartialEq)]
pub enum TokKind {
    Ident(String),
    Number(String),
    String(String),
    Module,
    Effects,
    Actor,
    Fn,
    LParen,
    RParen,
    LBrace,
    RBrace,
    Comma,
    Colon,
    Semicolon,
    Dot,
    Arrow,
    Eq,
    Eof,
}
#[derive(Debug, Clone, PartialEq)]
pub struct Token {
    pub kind: TokKind,
    pub line: usize,
    pub col: usize,
}

pub fn lex(src: &str) -> Vec<Token> {
    let mut t = Vec::new();
    let (mut i, mut line, mut col) = (0usize, 1usize, 1usize);
    let b = src.as_bytes();
    let push = |kind: TokKind, line, col, t: &mut Vec<Token>| t.push(Token { kind, line, col });
    while i < b.len() {
        let c = b[i] as char;
        match c {
            ' ' | '\t' => {
                i += 1;
                col += 1;
            }
            '\n' => {
                i += 1;
                line += 1;
                col = 1;
            }
            '/' if i + 1 < b.len() && b[i + 1] as char == '/' => {
                while i < b.len() && b[i] as char != '\n' {
                    i += 1;
                    col += 1;
                }
            }
            '(' => {
                push(TokKind::LParen, line, col, &mut t);
                i += 1;
                col += 1;
            }
            ')' => {
                push(TokKind::RParen, line, col, &mut t);
                i += 1;
                col += 1;
            }
            '{' => {
                push(TokKind::LBrace, line, col, &mut t);
                i += 1;
                col += 1;
            }
            '}' => {
                push(TokKind::RBrace, line, col, &mut t);
                i += 1;
                col += 1;
            }
            ',' => {
                push(TokKind::Comma, line, col, &mut t);
                i += 1;
                col += 1;
            }
            ':' => {
                push(TokKind::Colon, line, col, &mut t);
                i += 1;
                col += 1;
            }
            ';' => {
                push(TokKind::Semicolon, line, col, &mut t);
                i += 1;
                col += 1;
            }
            '.' => {
                push(TokKind::Dot, line, col, &mut t);
                i += 1;
                col += 1;
            }
            '-' if i + 1 < b.len() && b[i + 1] as char == '>' => {
                push(TokKind::Arrow, line, col, &mut t);
                i += 2;
                col += 2;
            }
            '=' => {
                push(TokKind::Eq, line, col, &mut t);
                i += 1;
                col += 1;
            }
            '"' => {
                let (start_l, start_c) = (line, col);
                i += 1;
                col += 1;
                let mut s = String::new();
                while i < b.len() && b[i] as char != '"' {
                    let ch = b[i] as char;
                    if ch == '\n' {
                        line += 1;
                        col = 1;
                    } else {
                        col += 1;
                    }
                    s.push(ch);
                    i += 1;
                }
                i += 1;
                col += 1;
                push(TokKind::String(s), start_l, start_c, &mut t);
            }
            c if c.is_ascii_alphabetic() || c == '_' => {
                let (sl, sc) = (line, col);
                let mut s = String::new();
                while i < b.len() {
                    let ch = b[i] as char;
                    if ch.is_ascii_alphanumeric() || ch == '_' {
                        s.push(ch);
                        i += 1;
                        col += 1;
                    } else {
                        break;
                    }
                }
                let kind = match s.as_str() {
                    "module" => TokKind::Module,
                    "effects" => TokKind::Effects,
                    "actor" => TokKind::Actor,
                    "fn" => TokKind::Fn,
                    _ => TokKind::Ident(s),
                };
                push(kind, sl, sc, &mut t);
            }
            c if c.is_ascii_digit() => {
                let (sl, sc) = (line, col);
                let mut s = String::new();
                while i < b.len() && (b[i] as char).is_ascii_digit() {
                    s.push(b[i] as char);
                    i += 1;
                    col += 1;
                }
                push(TokKind::Number(s), sl, sc, &mut t);
            }
            _ => {
                i += 1;
                col += 1;
            }
        }
    }
    t.push(Token {
        kind: TokKind::Eof,
        line,
        col,
    });
    t
}
>>>>>>> origin/w5t1y7-codex/create-top-level-repo-layout
