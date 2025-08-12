use clap::{Parser, Subcommand};

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
    TranspileTs { file: String, #[arg(long)] out: String },
    /// (Step 2) Build to target: wasm|native|vm
    Build { #[arg(long)] target: String, #[arg(long, default_value = "build/")] out: String },
}

fn main() {
    let cli = Cli::parse();
    match cli.cmd {
        None => {
            println!("weftc v{}", env!("CARGO_PKG_VERSION"));
            println!("Subcommands will be enabled in Step 2. Try: weftc --help");
        }
        Some(_) => {
            eprintln!("Subcommands are coming in Step 2. For now, use --help.");
            std::process::exit(2);
        }
    }
}
