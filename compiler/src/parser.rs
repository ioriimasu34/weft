use crate::{
    ast::{Item, Module},
    effects::Effect,
    lexer::{TokKind, Token},
};

#[derive(Debug)]
pub struct ParseError {
    pub msg: String,
    pub line: usize,
    pub col: usize,
}
impl std::fmt::Display for ParseError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{} at {}:{}", self.msg, self.line, self.col)
    }
}
impl std::error::Error for ParseError {}

fn expect(
    toks: &[Token],
    i: &mut usize,
    k: fn(&TokKind) -> bool,
    what: &str,
) -> Result<Token, ParseError> {
    let tok = toks
        .get(*i)
        .ok_or(ParseError {
            msg: format!("expected {}", what),
            line: 0,
            col: 0,
        })?
        .clone();
    if k(&tok.kind) {
        *i += 1;
        Ok(tok)
    } else {
        Err(ParseError {
            msg: format!("expected {}", what),
            line: tok.line,
            col: tok.col,
        })
    }
}

pub fn parse(toks: &[Token]) -> Result<Module, ParseError> {
    let mut i = 0usize;

    // module <ident(.ident)*>
    expect(toks, &mut i, |k| matches!(k, TokKind::Module), "module")?;
    let mut name = String::new();
    let first = expect(
        toks,
        &mut i,
        |k| matches!(k, TokKind::Ident(_)),
        "module ident",
    )?;
    if let TokKind::Ident(s) = first.kind {
        name.push_str(&s);
    }
    while matches!(toks.get(i).map(|t| &t.kind), Some(TokKind::Dot)) {
        i += 1;
        let id = expect(
            toks,
            &mut i,
            |k| matches!(k, TokKind::Ident(_)),
            "ident after dot",
        )?;
        if let TokKind::Ident(s) = id.kind {
            name.push('.');
            name.push_str(&s);
        }
    }
    let mut m = Module::new(name);

    // optional: effects <Effect (, Effect)*>
    if matches!(toks.get(i).map(|t| &t.kind), Some(TokKind::Effects)) {
        i += 1;
        loop {
            let e = expect(
                toks,
                &mut i,
                |k| matches!(k, TokKind::Ident(_)),
                "effect ident",
            )?;
            if let TokKind::Ident(s) = e.kind {
                if let Some(eff) = Effect::from_ident(&s) {
                    m.effects.push(eff);
                } else {
                    return Err(ParseError {
                        msg: format!("unknown effect '{}'", s),
                        line: e.line,
                        col: e.col,
                    });
                }
            }
            if matches!(toks.get(i).map(|t| &t.kind), Some(TokKind::Comma)) {
                i += 1;
                continue;
            }
            break;
        }
    }

    // items until EOF: actor <Ident> { ... } | fn <Ident> ...
    while !matches!(toks.get(i).map(|t| &t.kind), Some(TokKind::Eof)) {
        match toks.get(i).map(|t| t.kind.clone()) {
            Some(TokKind::Actor) => {
                i += 1;
                let name = expect(
                    toks,
                    &mut i,
                    |k| matches!(k, TokKind::Ident(_)),
                    "actor name",
                )?;
                let nm = if let TokKind::Ident(s) = name.kind {
                    s
                } else {
                    unreachable!()
                };
                skip_block(toks, &mut i)?;
                m.items.push(Item::Actor { name: nm });
            }
            Some(TokKind::Fn) => {
                i += 1;
                let name = expect(toks, &mut i, |k| matches!(k, TokKind::Ident(_)), "fn name")?;
                let nm = if let TokKind::Ident(s) = name.kind {
                    s
                } else {
                    unreachable!()
                };
                while !matches!(toks.get(i).map(|t| &t.kind), Some(TokKind::LBrace))
                    && !matches!(toks.get(i).map(|t| &t.kind), Some(TokKind::Eof))
                {
                    i += 1;
                }
                if matches!(toks.get(i).map(|t| &t.kind), Some(TokKind::LBrace)) {
                    skip_block(toks, &mut i)?;
                }
                m.items.push(Item::Func { name: nm });
            }
            Some(_) => {
                i += 1;
            }
            None => break,
        }
    }
    Ok(m)
}

fn skip_block(toks: &[Token], i: &mut usize) -> Result<(), ParseError> {
    if !matches!(toks.get(*i).map(|t| &t.kind), Some(TokKind::LBrace)) {
        while !matches!(toks.get(*i).map(|t| &t.kind), Some(TokKind::LBrace))
            && !matches!(toks.get(*i).map(|t| &t.kind), Some(TokKind::Eof))
        {
            *i += 1;
        }
    }
    let mut depth = 0usize;
    while *i < toks.len() {
        match &toks[*i].kind {
            TokKind::LBrace => {
                depth += 1;
            }
            TokKind::RBrace => {
                depth -= 1;
                if depth == 0 {
                    *i += 1;
                    return Ok(());
                }
            }
            TokKind::Eof => {
                return Err(ParseError {
                    msg: "unexpected EOF in block".into(),
                    line: toks[*i].line,
                    col: toks[*i].col,
                })
            }
            _ => {}
        }
        *i += 1;
    }
    Err(ParseError {
        msg: "unterminated block".into(),
        line: 0,
        col: 0,
    })
}
>>>>>>> origin/w5t1y7-codex/create-top-level-repo-layout
