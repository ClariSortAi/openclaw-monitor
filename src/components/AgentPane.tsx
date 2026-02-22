import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useWorkspaceFile } from "../hooks/use-workspace";
import { Shield, Activity, Database, Cpu, Edit2, Save, X, Check } from "lucide-react";

const NAV_ITEMS = [
    { id: "SOUL.md", label: "Soul", icon: Shield },
    { id: "HEARTBEAT.md", label: "Heartbeat", icon: Activity },
    { id: "MEMORY.md", label: "Memory", icon: Database },
    { id: "AGENTS.md", label: "Agents", icon: Cpu },
];

export function AgentPane() {
    const [activeDoc, setActiveDoc] = useState(NAV_ITEMS[0].id);

    return (
        <div className="h-full flex flex-col -mx-2">
            {/* Sub Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-6 px-2 scrollbar-none">
                {NAV_ITEMS.map((item) => {
                    const isActive = activeDoc === item.id;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveDoc(item.id)}
                            className={`relative flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="subnav"
                                    className="absolute inset-0 bg-zinc-800 rounded-full"
                                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10"><Icon className="w-4 h-4" /></span>
                            <span className="relative z-10 text-sm font-medium tracking-wide">{item.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="flex-1 overflow-auto px-2 pb-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeDoc}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="prose prose-invert prose-zinc max-w-none prose-headings:font-semibold prose-a:text-indigo-400 prose-p:leading-relaxed"
                    >
                        <DocumentRenderer path={activeDoc} />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

function DocumentRenderer({ path }: { path: string }) {
    const { data, error, updateFile } = useWorkspaceFile(path);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [savedState, setSavedState] = useState(false);

    if (error) return <div className="text-red-500">Failed to read {path}: {error}</div>;
    if (data === null) return <div className="text-zinc-500 animate-pulse">Reading engrams...</div>;

    const handleEditStart = () => {
        setEditContent(data || "");
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const success = await updateFile(editContent);
        if (success) {
            setSavedState(true);
            setTimeout(() => {
                setSavedState(false);
                setIsEditing(false);
            }, 1000);
        }
        setIsSaving(false);
    };

    return (
        <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl flex flex-col backdrop-blur-sm shadow-xl overflow-hidden min-h-[400px]">
            {/* Action Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-800/50 bg-zinc-900/50">
                <span className="text-xs font-mono text-zinc-500 tracking-wider uppercase">{path}</span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            // This is a bit of a hack but it works for a simple "refresh" 
                            // by forcing the component to re-render or re-trigger the hook
                            // Actually, let's just use the activeDoc to trigger it if we wanted to be fancy
                            // but for now, we'll just rely on the interval or a manual trigger if we had one.
                            // Since we don't have a direct "trigger" in the hook yet, 
                            // I'll just add the button for visual completion and maybe add a simple state trigger.
                            window.location.reload(); // Simple refresh for now to ensure everything is synced
                        }}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                        title="Refresh"
                    >
                        <Activity className="w-4 h-4" />
                    </button>
                    <AnimatePresence mode="wait">
                        {isEditing ? (
                            <motion.div
                                key="edit-actions"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex gap-2"
                            >
                                <button
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                    className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 rounded-md transition-colors text-sm font-medium"
                                >
                                    {savedState ? (
                                        <><Check className="w-4 h-4" /> Saved</>
                                    ) : isSaving ? (
                                        <><div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /> Saving</>
                                    ) : (
                                        <><Save className="w-4 h-4" /> Save</>
                                    )}
                                </button>
                            </motion.div>
                        ) : (
                            <motion.button
                                key="start-edit"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={handleEditStart}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors text-sm font-medium"
                            >
                                <Edit2 className="w-4 h-4" /> Edit
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6 md:p-8 flex-1 flex flex-col">
                {isEditing ? (
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="flex-1 w-full bg-zinc-950/50 text-zinc-100 p-4 border border-zinc-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl resize-none outline-none font-mono text-sm shadow-inner transition-colors"
                        autoFocus
                        spellCheck={false}
                    />
                ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{data}</ReactMarkdown>
                )}
            </div>
        </div>
    );
}
