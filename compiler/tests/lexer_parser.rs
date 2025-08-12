use weftc::{lexer, parser};

#[test]
fn lex_parse_module_and_effects() {
    let src = r#"
        module textile.ingest
        effects Serial, Net
        actor Ingest { fn run() { } }
    "#;
    let toks = lexer::lex(src);
    let m = parser::parse(&toks).expect("parse ok");
    assert_eq!(m.name, "textile.ingest");
    assert!(m.effects.len() == 2);
    assert!(m.items.len() >= 1);
}
