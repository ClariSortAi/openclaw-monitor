import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Folder, FileText, ArrowLeft, Trash2, Save, RefreshCw, File, Eye, Edit3, FileCode, Printer, Sheet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import html2pdf from "html2pdf.js";
import * as XLSX from "xlsx";

interface WorkspaceFile {
    name: string;
    path: string;
    size: number;
    modified: number;
    is_dir: boolean;
}

export function FilesPane() {
    const [currentPath, setCurrentPath] = useState<string>("");
    const [files, setFiles] = useState<WorkspaceFile[]>([]);
    const [loading, setLoading] = useState(false);

    // Editor state
    const [editingFile, setEditingFile] = useState<WorkspaceFile | null>(null);
    const [fileContent, setFileContent] = useState("");
    const [saving, setSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [exporting, setExporting] = useState(false);

    const fetchFiles = useCallback(async (path: string) => {
        setLoading(true);
        try {
            const result = await invoke<WorkspaceFile[]>("list_workspace_files", { path });

            // Sort: Directories first, then alphabetical
            const sorted = result.sort((a, b) => {
                if (a.is_dir && !b.is_dir) return -1;
                if (!a.is_dir && b.is_dir) return 1;
                return a.name.localeCompare(b.name);
            });

            setFiles(sorted);
        } catch (e) {
            console.error("Failed to list files", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFiles(currentPath);
    }, [currentPath, fetchFiles]);

    const navigateUp = () => {
        if (!currentPath) return;
        const parts = currentPath.split("/").filter(Boolean);
        parts.pop();
        setCurrentPath(parts.join("/"));
    };

    const navigateInto = (folderName: string) => {
        setCurrentPath(currentPath ? `${currentPath}/${folderName}` : folderName);
    };

    const openFile = async (file: WorkspaceFile) => {
        try {
            setLoading(true);
            const content = await invoke<string>("read_workspace_file", { path: file.path });
            setFileContent(content);
            setEditingFile(file);
            setPreviewMode(file.name.endsWith('.md'));
        } catch (e) {
            console.error("Failed to read file", e);
        } finally {
            setLoading(false);
        }
    };

    const saveFile = async () => {
        if (!editingFile) return;
        setSaving(true);
        try {
            await invoke("write_workspace_file", {
                path: editingFile.path,
                content: fileContent
            });
            // Refresh list to update modified time
            fetchFiles(currentPath);
        } catch (e) {
            console.error("Failed to save file", e);
        } finally {
            setSaving(false);
        }
    };

    const deleteFile = async (e: React.MouseEvent, file: WorkspaceFile) => {
        e.stopPropagation(); // prevent opening file
        if (!confirm(`Are you sure you want to delete ${file.name}?`)) return;

        try {
            setLoading(true);
            await invoke("delete_workspace_file", { path: file.path });
            if (editingFile?.path === file.path) {
                setEditingFile(null);
            }
            fetchFiles(currentPath);
        } catch (err) {
            console.error("Failed to delete file", err);
        } finally {
            setLoading(false);
        }
    };

    // Format date
    const formatDate = (timestampSecs: number) => {
        return new Date(timestampSecs * 1000).toLocaleString();
    };

    // Format size
    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    const exportPDF = () => {
        const element = document.getElementById('markdown-preview-content');
        if (!element || !editingFile) return;
        setExporting(true);
        const opt = {
            margin: 10,
            filename: `${editingFile.name.replace('.md', '')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        // @ts-ignore
        html2pdf().set(opt).from(element).save().then(() => setExporting(false));
    };

    const exportDocx = async () => {
        alert("DocX export is temporarily unavailable.");
    };

    const exportExcel = () => {
        const element = document.getElementById('markdown-preview-content');
        if (!element || !editingFile) return;

        const tables = element.querySelectorAll('table');
        if (tables.length === 0) {
            alert('No tables found in this file to export to Excel.');
            return;
        }

        const wb = XLSX.utils.book_new();
        tables.forEach((table, index) => {
            const ws = XLSX.utils.table_to_sheet(table);
            XLSX.utils.book_append_sheet(wb, ws, `Table ${index + 1}`);
        });

        XLSX.writeFile(wb, `${editingFile.name.replace('.md', '')}.xlsx`);
    };

    // Editor View
    if (editingFile) {
        return (
            <div className="flex flex-col h-full overflow-hidden bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800/50 shadow-xl overflow-hidden">
                <div className="bg-zinc-900 border-b border-zinc-800 flex items-center justify-between p-3 shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setEditingFile(null)}
                            className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <FileText className="w-4 h-4 text-indigo-400" />
                            <span>{editingFile.name}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {editingFile.name.endsWith('.md') && (
                            <div className="flex items-center bg-zinc-800/50 rounded-lg p-0.5 mr-2">
                                <button
                                    onClick={() => setPreviewMode(false)}
                                    className={`p-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium transition-colors ${!previewMode ? "bg-zinc-700 text-white shadow" : "text-zinc-400 hover:text-zinc-200"}`}
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => setPreviewMode(true)}
                                    className={`p-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium transition-colors ${previewMode ? "bg-zinc-700 text-white shadow" : "text-zinc-400 hover:text-zinc-200"}`}
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    Preview
                                </button>
                            </div>
                        )}
                        {!previewMode && (
                            <button
                                onClick={saveFile}
                                disabled={saving}
                                className="px-3 py-1.5 flex items-center gap-2 text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? "Saving..." : "Save"}
                            </button>
                        )}
                        {previewMode && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={exportPDF}
                                    disabled={exporting}
                                    title="Export to PDF"
                                    className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-rose-400 transition-colors rounded-md"
                                >
                                    <Printer className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={exportExcel}
                                    disabled={exporting}
                                    title="Export Tables to Excel"
                                    className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 transition-colors rounded-md"
                                >
                                    <Sheet className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-1 p-0 overflow-y-auto overflow-x-hidden custom-scrollbar bg-zinc-950/20">
                    {previewMode ? (
                        <div id="markdown-preview-content" className="p-6 md:p-10 bg-white dark:bg-zinc-950 text-black dark:text-zinc-200 min-h-full">
                            <div className="prose prose-zinc dark:prose-invert max-w-3xl mx-auto prose-img:rounded-xl prose-a:text-indigo-400">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {fileContent}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ) : (
                        <textarea
                            value={fileContent}
                            onChange={(e) => setFileContent(e.target.value)}
                            className="w-full min-h-full p-4 bg-transparent text-zinc-300 font-mono text-sm leading-relaxed outline-none resize-none placeholder-zinc-600"
                            placeholder="File content..."
                            spellCheck={false}
                        />
                    )}
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="flex flex-col h-full bg-zinc-900/20 backdrop-blur-md rounded-2xl border border-zinc-800/50 p-4">
            {/* Header bar */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 overflow-hidden flex-1 mr-4">
                    <button
                        onClick={navigateUp}
                        disabled={!currentPath}
                        className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white disabled:opacity-30 flex-shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="text-sm font-medium bg-zinc-800/50 px-3 py-1.5 rounded-lg text-zinc-300 overflow-hidden text-ellipsis whitespace-nowrap">
                        workspace/{currentPath}
                    </div>
                </div>
                <button
                    onClick={() => fetchFiles(currentPath)}
                    disabled={loading}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white disabled:opacity-50 border border-zinc-800"
                    title="Refresh"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-auto custom-scrollbar rounded-xl border border-zinc-800/50 bg-zinc-950/30">
                <AnimatePresence mode="popLayout">
                    {files.length === 0 && !loading ? (
                        <div className="h-full flex items-center justify-center text-zinc-500 italic text-sm">
                            No files found in this directory.
                        </div>
                    ) : (
                        files.map((file) => (
                            <motion.div
                                key={file.path}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                onClick={() => file.is_dir ? navigateInto(file.name) : openFile(file)}
                                className="group flex items-center justify-between p-3 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/50 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {file.is_dir ? (
                                        <Folder className="w-5 h-5 text-amber-400/80 shrink-0" />
                                    ) : file.name.endsWith('.md') ? (
                                        <FileText className="w-5 h-5 text-indigo-400/80 shrink-0" />
                                    ) : (
                                        <File className="w-5 h-5 text-zinc-500 shrink-0" />
                                    )}
                                    <span className="text-zinc-200 text-sm font-medium truncate">
                                        {file.name}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 shrink-0">
                                    <div className="hidden md:flex flex-col items-end opacity-60 text-xs">
                                        <span>{formatDate(file.modified)}</span>
                                        {!file.is_dir && <span>{formatSize(file.size)}</span>}
                                    </div>
                                    <button
                                        onClick={(e) => deleteFile(e, file)}
                                        className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors rounded hover:bg-red-400/10 opacity-0 group-hover:opacity-100"
                                        title={`Delete ${file.is_dir ? 'folder' : 'file'}`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
