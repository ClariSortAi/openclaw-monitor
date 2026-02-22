import { useMemo } from "react";
import { motion } from "framer-motion";
import { Circle, PlayCircle, CheckCircle2, Calendar } from "lucide-react";
import { useWorkspaceFile } from "../hooks/use-workspace";
import { parseTodoMd, Task } from "../lib/parser";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemAnim = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function TaskPane() {
    const { data, error } = useWorkspaceFile("TODO.md");

    const tasks = useMemo(() => {
        if (!data) return [];
        return parseTodoMd(data);
    }, [data]);

    const sections = useMemo(() => {
        const map = new Map<string, Task[]>();
        for (const t of tasks) {
            if (!map.has(t.section)) map.set(t.section, []);
            map.get(t.section)!.push(t);
        }
        // Prioritize certain sections
        const order = ["In Progress", "Urgent / Scheduled", "Inbox", "This week"];
        const sorted = Array.from(map.entries()).sort((a, b) => {
            let idxA = order.indexOf(a[0]);
            let idxB = order.indexOf(b[0]);
            if (idxA === -1) idxA = 99;
            if (idxB === -1) idxB = 99;
            return idxA - idxB;
        });
        return sorted;
    }, [tasks]);

    if (error) return <div className="text-red-500">Error reading TODO.md: {error}</div>;
    if (!data) return <div className="text-zinc-500 animate-pulse">Scanning workspace...</div>;

    return (
        <div className="h-full flex flex-col space-y-8 pb-12">
            {sections.map(([sectionName, sectionTasks]) => (
                sectionTasks.length > 0 && (
                    <div key={sectionName} className="flex flex-col space-y-4">
                        <h2 className="text-lg font-medium text-zinc-400 border-b border-zinc-800/50 pb-2 flex items-center gap-2">
                            {sectionName}
                            <span className="text-xs bg-zinc-800/50 text-zinc-500 px-2 py-0.5 rounded-full">
                                {sectionTasks.length}
                            </span>
                        </h2>
                        <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="grid gap-3"
                        >
                            {sectionTasks.map((t) => (
                                <TaskCard key={t.id} task={t} />
                            ))}
                        </motion.div>
                    </div>
                )
            ))}
        </div>
    );
}

function TaskCard({ task }: { task: Task }) {
    const isDone = task.status === "done";
    const isInProgress = task.status === "in-progress";

    return (
        <motion.div
            variants={itemAnim}
            className={`relative group flex gap-4 p-4 rounded-2xl border transition-all duration-300 ${isInProgress
                    ? "bg-indigo-500/5 border-indigo-500/20 hover:border-indigo-500/40"
                    : isDone
                        ? "bg-zinc-900/20 border-zinc-800/20 opacity-60 hover:opacity-100"
                        : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 shadow-sm"
                }`}
        >
            <div className="shrink-0 mt-0.5">
                {isInProgress ? (
                    <PlayCircle className="w-5 h-5 text-indigo-400" />
                ) : isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                    <Circle className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-[15px] leading-relaxed ${isDone ? "text-zinc-500 line-through" : "text-zinc-200"}`}>
                    {task.content}
                </p>

                {(task.dueDate || task.completedDate) && (
                    <div className="flex items-center gap-2 mt-3 mb-1">
                        {task.dueDate && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                                <Calendar className="w-3 h-3" /> Due: {task.dueDate}
                            </span>
                        )}
                        {task.completedDate && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" /> {task.completedDate}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
