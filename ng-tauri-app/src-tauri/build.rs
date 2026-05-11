use std::fs;
use std::path::PathBuf;

fn main() {
    tauri_build::build();
    generate_migrations();
}

fn generate_migrations() {
    let migrations_dir = PathBuf::from("../migrations");
    let out_dir = PathBuf::from(std::env::var("OUT_DIR").unwrap());

    // Re-run this build script when any migration file changes
    println!("cargo:rerun-if-changed=../migrations");

    struct Entry {
        version: i64,
        description: String,
        sql: String,
        kind: &'static str,
    }

    let mut entries: Vec<Entry> = Vec::new();

    if migrations_dir.exists() {
        let mut files: Vec<_> = fs::read_dir(&migrations_dir)
            .expect("Failed to read migrations directory")
            .filter_map(|e| e.ok())
            .collect();

        files.sort_by_key(|e| e.file_name());

        for file in files {
            let name = file.file_name();
            let name_str = name.to_string_lossy().to_string();

            let (kind, stem): (&'static str, String) =
                if let Some(s) = name_str.strip_suffix(".up.sql") {
                    ("Up", s.to_string())
                } else if let Some(s) = name_str.strip_suffix(".down.sql") {
                    ("Down", s.to_string())
                } else {
                    continue;
                };

            let mut parts = stem.splitn(2, '_');
            let version: i64 = match parts.next().and_then(|v| v.parse().ok()) {
                Some(v) => v,
                None => panic!("Invalid migration filename (expected <timestamp>_<name>): {name_str}"),
            };
            let description = match parts.next() {
                Some(d) => d.to_string(),
                None => panic!("Missing description in migration filename: {name_str}"),
            };

            println!("cargo:rerun-if-changed={}", file.path().display());

            let sql = fs::read_to_string(file.path())
                .unwrap_or_else(|_| panic!("Failed to read migration file: {name_str}"));

            entries.push(Entry { version, description, sql, kind });
        }
    }

    // Sort by version, Up before Down within the same version
    entries.sort_by_key(|e| (e.version, if e.kind == "Up" { 0i32 } else { 1 }));

    let mut code =
        String::from("fn migrations() -> Vec<tauri_plugin_sql::Migration> {\n");
    code.push_str("    use tauri_plugin_sql::{Migration, MigrationKind};\n");
    code.push_str("    vec![\n");

    for e in &entries {
        code.push_str(&format!(
            "        Migration {{ version: {}, description: \"{}\", sql: r######\"{}\"######, kind: MigrationKind::{} }},\n",
            e.version, e.description, e.sql, e.kind
        ));
    }

    code.push_str("    ]\n");
    code.push_str("}\n");

    fs::write(out_dir.join("migrations.rs"), &code)
        .expect("Failed to write generated migrations.rs");
}
