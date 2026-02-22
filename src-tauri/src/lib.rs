use serde::Serialize;
use std::fs;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Serialize)]
struct WorkspaceFile {
    name: String,
    path: String,
    size: u64,
    modified: u64,
    is_dir: bool,
}

#[tauri::command]
fn read_workspace_file(path: &str) -> Result<String, String> {
    let base_path = r"\\wsl.localhost\Ubuntu\home\jason\.openclaw\workspace";
    let base = std::path::Path::new(base_path);

    if !base.exists() {
        return Err(format!("Workspace base path not found: {}", base_path));
    }

    let full_path = base.join(path);
    if !full_path.exists() {
        return Err(format!("File not found: {}", path));
    }

    fs::read_to_string(&full_path).map_err(|e| format!("Failed to read {}: {}", path, e))
}

#[tauri::command]
fn write_workspace_file(path: &str, content: &str) -> Result<(), String> {
    let base_path = r"\\wsl.localhost\Ubuntu\home\jason\.openclaw\workspace";
    let base = std::path::Path::new(base_path);

    if !base.exists() {
        return Err(format!("Workspace base path not found: {}", base_path));
    }

    let full_path = base.join(path);

    // Ensure parent directory exists
    if let Some(parent) = full_path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create directory {}: {}", parent.display(), e))?;
        }
    }

    fs::write(&full_path, content).map_err(|e| format!("Failed to write {}: {}", path, e))
}

#[tauri::command]
fn list_workspace_files(path: &str) -> Result<Vec<WorkspaceFile>, String> {
    let base_path = r"\\wsl.localhost\Ubuntu\home\jason\.openclaw\workspace";
    let base = std::path::Path::new(base_path);
    let full_path = base.join(path);

    if !full_path.exists() {
        return Ok(vec![]);
    }

    let entries = fs::read_dir(full_path).map_err(|e| e.to_string())?;
    let mut files = Vec::new();

    for entry in entries {
        if let Ok(entry) = entry {
            let meta = entry.metadata().map_err(|e| e.to_string())?;
            let name = entry.file_name().to_string_lossy().to_string();

            // Strip the base prefix to get a relative path we can send to read/write
            let rel_path = match entry.path().strip_prefix(base) {
                Ok(p) => p.to_string_lossy().replace("\\", "/"),
                Err(_) => continue, // Ignore if it couldn't be stripped
            };

            let modified = meta
                .modified()
                .unwrap_or(SystemTime::now())
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs();

            files.push(WorkspaceFile {
                name,
                path: rel_path,
                size: meta.len(),
                modified,
                is_dir: meta.is_dir(),
            });
        }
    }

    Ok(files)
}

#[tauri::command]
fn delete_workspace_file(path: &str) -> Result<(), String> {
    let base_path = r"\\wsl.localhost\Ubuntu\home\jason\.openclaw\workspace";
    let base = std::path::Path::new(base_path);
    let full_path = base.join(path);

    if !full_path.exists() {
        return Err(format!("File not found: {}", path));
    }

    if full_path.is_dir() {
        fs::remove_dir_all(&full_path).map_err(|e| e.to_string())
    } else {
        fs::remove_file(&full_path).map_err(|e| e.to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            read_workspace_file,
            write_workspace_file,
            list_workspace_files,
            delete_workspace_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
