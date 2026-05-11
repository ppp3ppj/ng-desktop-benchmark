use tauri_plugin_sql::Builder as SqlBuilder;

// Auto-generated from migrations/*.up.sql / *.down.sql at build time.
// Add new migrations by dropping files into migrations/ — no code changes needed.
include!(concat!(env!("OUT_DIR"), "/migrations.rs"));

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            SqlBuilder::default()
                .add_migrations("sqlite:app.db", migrations())
                .build(),
        )
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
