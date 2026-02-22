import { useMemo } from "react";
import { motion } from "framer-motion";
import { useWorkspaceFile } from "../hooks/use-workspace";
import { parseCsv, TimeEntry } from "../lib/parser";
import { Timer, Clock } from "lucide-react";

const containerAnim = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
    },
};

const itemAnim = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function TimePane() {
    const { data, error } = useWorkspaceFile("time/time_log.csv");

    const entries = useMemo(() => {
        if (!data) return [];
        // Ensure newest first if appended at the bottom
        return parseCsv(data).reverse();
    }, [data]);

    const groupedByDate = useMemo(() => {
        const m = new Map<string, TimeEntry[]>();
        for (const e of entries) {
            if (!m.has(e.date)) m.set(e.date, []);
            m.get(e.date)!.push(e);
        }
        return Array.from(m.entries()); // Already newest first due to reverse() earlier assuming chronological csv
    }, [entries]);

    if (error) return <div className="text-red-500">Error reading time_log.csv: {error}</div>;
    if (!data) return <div className="text-zinc-500 animate-pulse">Syncing chronological records...</div>;

    const formatDateHeading = (dateStr: string) => {
        try {
            // dateStr is typically "YYYY-MM-DD"
            const dateObj = new Date(dateStr + "T00:00:00"); // Force local timezone interpretation without shifting
            if (isNaN(dateObj.getTime())) return dateStr;

            return new Intl.DateTimeFormat('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }).format(dateObj);
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="h-full pr-4 pb-12">
            <motion.div
                variants={containerAnim}
                initial="hidden"
                animate="show"
                className="relative border-l border-zinc-800/60 ml-3 md:ml-6 space-y-12"
            >
                {groupedByDate.map(([date, dayEntries]) => (
                    <div key={date} className="relative">
                        {/* Date Node */}
                        <div className="absolute -left-3.5 top-0 bg-zinc-950 p-1">
                            <div className="w-5 h-5 rounded-full border-2 border-indigo-500/50 bg-indigo-500/20 shadow-[0_0_12px_rgba(99,102,241,0.4)]" />
                        </div>

                        <div className="pl-8 pt-0.5">
                            <h3 className="text-xl font-semibold text-white mb-6 align-middle tracking-tight flex items-center gap-3">
                                {formatDateHeading(date)}
                                <span className="text-xs font-medium px-2.5 py-1 bg-zinc-800/60 text-zinc-400 rounded-full inline-flex">
                                    {dayEntries.reduce((acc, curr) => acc + curr.durationHours, 0).toFixed(1)} hrs total
                                </span>
                            </h3>

                            <div className="grid gap-3">
                                {dayEntries.map((entry) => (
                                    <TimeCard key={entry.id} entry={entry} />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}

function TimeCard({ entry }: { entry: TimeEntry }) {
    return (
        <motion.div
            variants={itemAnim}
            className="group relative bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700/80 hover:bg-zinc-800/40 p-4 rounded-xl flex flex-col md:flex-row md:items-center gap-4 transition-all"
        >
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-sm font-semibold text-indigo-400 tracking-wide uppercase">
                        {entry.project}
                    </span>
                    {entry.startLocal && entry.endLocal && (
                        <span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {entry.startLocal} — {entry.endLocal}
                        </span>
                    )}
                </div>

                {entry.notes && (
                    <p className="text-[14px] text-zinc-300 leading-relaxed max-w-2xl">{entry.notes}</p>
                )}
            </div>

            <div className="shrink-0 flex items-center gap-2 bg-indigo-500/10 text-indigo-300 px-3 py-1.5 rounded-lg border border-indigo-500/20">
                <Timer className="w-4 h-4" />
                <span className="font-semibold">{entry.durationHours.toFixed(2)}h</span>
            </div>
        </motion.div>
    );
}
