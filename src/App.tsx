import { useState } from "react";
import { ListTodo, Clock, BrainCircuit, Folder } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TaskPane } from "./components/TaskPane";
import { TimePane } from "./components/TimePane";
import { AgentPane } from "./components/AgentPane";
import { FilesPane } from "./components/FilesPane";

function App() {
  const [activeTab, setActiveTab] = useState<"tasks" | "time" | "soul" | "files">("tasks");

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden selection:bg-zinc-800">
      {/* Sidebar */}
      <aside className="w-16 md:w-64 border-r border-zinc-800/50 bg-zinc-950/50 backdrop-blur-xl flex flex-col p-4 z-10">
        <div className="flex items-center gap-3 px-2 mb-8 mt-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <BrainCircuit className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight hidden md:block bg-gradient-to-br from-zinc-100 to-zinc-500 bg-clip-text text-transparent">
            OpenCLAW
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem
            icon={<ListTodo className="w-5 h-5" />}
            label="Tasks"
            active={activeTab === "tasks"}
            onClick={() => setActiveTab("tasks")}
          />
          <NavItem
            icon={<Clock className="w-5 h-5" />}
            label="Time Log"
            active={activeTab === "time"}
            onClick={() => setActiveTab("time")}
          />
          <NavItem
            icon={<Folder className="w-5 h-5" />}
            label="Workspace Files"
            active={activeTab === "files"}
            onClick={() => setActiveTab("files")}
          />
          <NavItem
            icon={<BrainCircuit className="w-5 h-5" />}
            label="Agent State"
            active={activeTab === "soul"}
            onClick={() => setActiveTab("soul")}
          />
        </nav>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 relative overflow-hidden bg-zinc-950">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl opacity-50 mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-50 mix-blend-screen pointer-events-none" />

        <div className="relative h-full overflow-hidden flex flex-col p-8">
          <AnimatePresence mode="wait">
            {activeTab === "tasks" && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex-1 overflow-auto"
              >
                <h1 className="text-3xl font-semibold tracking-tight text-white mb-6">Active Tasks</h1>
                <TaskPane />
              </motion.div>
            )}
            {activeTab === "time" && (
              <motion.div
                key="time"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex-1 overflow-auto w-full max-w-4xl mx-auto"
              >
                <h1 className="text-3xl font-semibold tracking-tight text-white mb-6">Time Log</h1>
                <TimePane />
              </motion.div>
            )}
            {activeTab === "soul" && (
              <motion.div
                key="soul"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex-1 overflow-auto w-full max-w-4xl mx-auto"
              >
                <h1 className="text-3xl font-semibold tracking-tight text-white mb-6">Agent State</h1>
                <AgentPane />
              </motion.div>
            )}
            {activeTab === "files" && (
              <motion.div
                key="files"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex-1 overflow-hidden flex flex-col w-full max-w-5xl mx-auto"
              >
                <h1 className="text-3xl font-semibold tracking-tight text-white mb-6 shrink-0">Files</h1>
                <FilesPane />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${active ? "text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
        }`}
    >
      {active && (
        <motion.div
          layoutId="active-nav-bg"
          className="absolute inset-0 bg-zinc-800/80 rounded-xl"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <span className="relative z-10">{icon}</span>
      <span className="relative z-10 font-medium hidden md:block">{label}</span>
    </button>
  );
}

export default App;
