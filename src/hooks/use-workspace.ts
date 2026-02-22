import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export function useWorkspaceFile(path: string, intervalMs = 2000) {
    const [data, setData] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        async function fetchFile() {
            try {
                // Check if we are in Tauri (window.__TAURI__ exists)
                if (window && '__TAURI_INTERNALS__' in window) {
                    const content = await invoke<string>("read_workspace_file", { path });
                    if (mounted) {
                        setData(content);
                        setError(null);
                    }
                } else {
                    throw new Error("Tauri internals not found (running in browser?)");
                }
            } catch (err: any) {
                if (mounted) {
                    const errorMessage = err.message || String(err);
                    console.error(`Failed to fetch ${path}:`, errorMessage);

                    // Fallback to mock data only if specifically and explicitly requested or in browser
                    if (!(window && '__TAURI_INTERNALS__' in window)) {
                        console.warn(`Providing mock data for ${path} as fallback`);
                        setData(getMockData(path));
                        setError(null);
                    } else {
                        setError(errorMessage);
                    }
                }
            }
        }

        fetchFile();
        const intervalId = setInterval(fetchFile, intervalMs);

        return () => {
            mounted = false;
            clearInterval(intervalId);
        };
    }, [path, intervalMs]);

    const updateFile = async (newContent: string) => {
        try {
            if (window && '__TAURI_INTERNALS__' in window) {
                await invoke("write_workspace_file", { path, content: newContent });
                setData(newContent);
                return true;
            } else {
                console.warn(`Fallback: pretending to save mock data for ${path}`);
                setData(newContent);
                return true;
            }
        } catch (err) {
            console.error("Failed to write file:", err);
            return false;
        }
    };

    return { data, error, updateFile };
}

function getMockData(path: string): string {
    if (path === "TODO.md") {
        return `
# TODO

## Inbox
- [ ] Send Jenn a draft to send to Anil around our approach (Due today)

## In Progress
- [/] Initialize Tauri 2.0 app with Vite (React/TypeScript)

## Completed
- [x] Brent → Salesforce access for Superhuman (completed 2026-02-19)
    `;
    }

    if (path.includes("time_log.csv")) {
        return `date,project,start_local,end_local,duration_minutes,duration_hours,overlaps,notes
2026-02-17,Quest,06:30,16:40,610,10.17,No,Initial Dev
2026-02-18,Superhuman,,,180,3,No,Added +3h per Jason
2026-02-19,VMi,,,60,1.00,No,New project tracked`;
    }

    return `# Mock Agent Data for ${path}\n\nRunning in browser fallback mode.`;
}
