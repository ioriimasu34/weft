use anyhow::{self, Result};
use clap::{Parser, Subcommand};
use std::{fs, path::Path};
use weftc::{effects, ir, lexer, parser, transpile_ts, typer};

#[derive(Parser)]
#[command(name = "weftc", version, about = "Weft compiler CLI")]
struct Cli {
    #[command(subcommand)]
    cmd: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Lex/parse/typecheck and print effects graph
    Check { file: String },
    /// Transpile to TypeScript
    TranspileTs {
        file: String,
        #[arg(long)]
        out: String,
    },
    /// Build stub to target: wasm|native|vm
    Build {
        #[arg(long)]
        target: String,
        #[arg(long, default_value = "build/")]
        out: String,
    },
}

fn load_src(p: &str) -> Result<String> {
    Ok(fs::read_to_string(p)?)
}

fn cmd_check(file: &str) -> Result<()> {
    let src = load_src(file)?;
    let toks = lexer::lex(&src);
    let module = parser::parse(&toks).map_err(|e| anyhow::anyhow!(e.to_string()))?;
    typer::typecheck(&module).map_err(|e| anyhow::anyhow!(e.to_string()))?;
    let graph = effects::effects_graph(&module);
    println!("OK: module={}", module.name);
    println!("Effects: {:?}", module.effects);
    println!("Graph edges: {:?}", graph);
    Ok(())
}

fn cmd_ts(file: &str, out: &str) -> Result<()> {
    let src = load_src(file)?;
    let module = parser::parse(&lexer::lex(&src)).map_err(|e| anyhow::anyhow!(e.to_string()))?;
    let ts = transpile_ts::emit_ts(&module);
    fs::create_dir_all(Path::new(out).parent().unwrap_or(Path::new(".")))?;
    fs::write(out, ts)?;
    println!("Wrote TypeScript to {}", out);
    Ok(())
}

fn cmd_build(target: &str, out: &str) -> Result<()> {
    let plan_ok = matches!(target, "wasm" | "native" | "vm");
    if !plan_ok {
        anyhow::bail!("--target must be wasm|native|vm");
    }
    fs::create_dir_all(out)?;
    let ir = ir::Ir { bytes: 42 };
    let plan = format!("target={target}, out={out}, ir_size={}", ir.bytes);
    fs::write(format!("{out}/plan.txt"), &plan)?;
    println!("{}", plan);
    Ok(())
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    match cli.cmd {
        Commands::Check { file } => cmd_check(&file),
        Commands::TranspileTs { file, out } => cmd_ts(&file, &out),
        Commands::Build { target, out } => cmd_build(&target, &out),
    }
}
