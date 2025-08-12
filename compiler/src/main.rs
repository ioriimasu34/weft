use clap::{Parser, Subcommand};
use std::fs;

use anyhow::{Context, Result};

mod ast;
mod effects;
mod ir;
mod lexer;
mod parser;
mod transpile_ts;
mod typer;

#[derive(Parser)]
#[command(name = "weftc", version, about = "Weft compiler CLI")]
struct Cli {
    #[command(subcommand)]
    cmd: Option<Cmd>,
}

#[derive(Subcommand)]
enum Cmd {
    /// (Step 2) Check a .weft file (lex/parse/typecheck)
    Check { file: String },
    /// (Step 2) Transpile to TypeScript
    TranspileTs {
        file: String,
        #[arg(long)]
        out: String,
    },
    /// (Step 2) Build to target: wasm|native|vm
    Build {
        file: String,
        #[arg(long)]
        target: String,
        #[arg(long, default_value = "build/")]
        out: String,
    },
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    match cli.cmd {
        None => {
            println!("weftc v{}", env!("CARGO_PKG_VERSION"));
            println!("Try: weftc --help");
        }
        Some(Cmd::Check { file }) => {
            let src = fs::read_to_string(&file)
                .with_context(|| format!("failed to read {file}"))?;
            let tokens = crate::lexer::lex(&src);
            let module = crate::parser::parse(&tokens)
                .map_err(anyhow::Error::msg)?;
            crate::typer::typecheck(&module)
                .map_err(anyhow::Error::msg)?;
            println!("OK");
        }
        Some(Cmd::TranspileTs { file, out }) => {
            let src = fs::read_to_string(&file)
                .with_context(|| format!("failed to read {file}"))?;
            let ts = crate::transpile_ts::transpile_ts(&src);
            fs::write(&out, ts)
                .with_context(|| format!("failed to write {out}"))?;
            println!("wrote {out}");
        }
        Some(Cmd::Build { file, target, out }) => {
            match target.as_str() {
                "wasm" | "native" | "vm" => {}
                _ => anyhow::bail!("unknown target '{target}'"),
            }
            let src = fs::read_to_string(&file)
                .with_context(|| format!("failed to read {file}"))?;
            let _module = crate::parser::parse(&crate::lexer::lex(&src))
                .map_err(anyhow::Error::msg)?;
            fs::create_dir_all(&out)
                .with_context(|| format!("failed to create {out}"))?;
            let out_file = std::path::Path::new(&out).join("artifact.txt");
            fs::write(&out_file, format!("build artifact for target {target}"))
                .with_context(|| format!("failed to write {}", out_file.display()))?;
            println!("built {}", out_file.display());
        }
    }
    Ok(())
}
