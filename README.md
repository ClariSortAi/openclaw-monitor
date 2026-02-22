# OpenCLAW Monitor

OpenCLAW Monitor is a native Windows desktop application designed to bridge the gap between Windows and the OpenCLAW autonomous AI workspace residing inside the WSL (Windows Subsystem for Linux) Ubuntu environment.

Built with Rust (Tauri), React, TypeScript, Framer Motion, and TailwindCSS, OpenCLAW Monitor provides an intuitive, high-performance interface to cleanly present, edit, and visualize your AI's internal state, memory, heartbeat, and local files directly on your Windows desktop. 

![Tasks View](assets/tasks_screenshot.png)

## Features

* **Native Desktop Performance:** Runs effortlessly with extreme speed, low memory footprint, and system-level file access via Tauri.
* **Beautiful, Interactive UI:** Designed with rich, glassmorphic styling, smooth micro-animations (Framer Motion), and glowing accents for a premium user experience.
* **Task Management Pane:** Instantly view tasks generated or modified by your AI agent, organized elegantly.
* **Time Logging:** Monitor the time-log cycles and heartbeats of the OpenCLAW daemon autonomously executing within WSL. 
* **Agent State Viewer:** Intelligently monitors the core operational and personality states (`SOUL.md`, `MEMORY.md`, `IDENTITY.md`) for deep insights.
* **Workspace File Explorer:** Fully-functional integrated file manager for traversing the inner paths of OpenCLAW's workspace environment.
  * Explore, Read, Edit, and Save files bi-directionally.
  * Integrated Markdown renderer matching standard modern development environments.
  * Support for PDF and Excel Spreadsheet exports generated natively inside the browser frontend. 

![Workspace Files View](assets/files_screenshot.png)

## OpenCLAW Workspace Schema and Configuration

For OpenCLAW Monitor to visualize your agent's state properly, your OpenCLAW agent (usually running inside WSL) needs to format its core tracking files using a specific markdown and CSV structure. 

### Quick Setup

If you want to automatically configure your OpenCLAW environment to adopt this schema, use the official setup plugin. Simply direct your CLI-based AI (like Claude Code) to run the plugin:

```bash
# Example prompt for your AI explicitly telling it to adopt the Monitor schema:
"Please clone https://github.com/ClariSortAi/openclaw-manager-plugin.git and run its setup instructions to configure my workspace so it is compatible with OpenCLAW Monitor."
```

### Manual Schema Rules

If you prefer to configure your prompt schemas manually, instruct your agent to emit the following exact formats into its workspace directory:

#### 1. Task Tracking (`TODO.md`)
Tasks must be grouped under `##` headers (forming sections) and use standard GitHub checklist syntax. Date parsing supports `(Due ...)` or `(completed ...)`.
```md
## In Progress
- [ ] Implement new database schema (Due Friday)
- [/] Working on the API wrapper

## Completed
- [x] Initial repository setup (completed 2026-02-18)
```

#### 2. Time Logging (`time/time_log.csv`)
If your agent tracks time, it must append to a CSV file structured with at least 7 columns (headers are required on the first row).
```csv
Date,Project,Start,End,Duration (Mins),Duration (Hrs),Overlaps,Notes
2026-02-22,OpenCLAW Monitor,09:00,10:30,90,1.5,None,Built the Workspace Files Pane
```

#### 3. Agent Core State Files
The Agent State tab continuously monitors the primary persistent files the AI uses to define its working memory. OpenCLAW Monitor natively renders the following files if they exist in the root workspace directory map:
* `SOUL.md`: Identity, instructions, and overarching goals.
* `MEMORY.md`: Long-term memory context or project decisions.
* `IDENTITY.md` or `HEARTBEAT.md`: Rolling states and system heartbeats.

## Tech Stack

* **Framework:** Tauri
* **Frontend Stack:** React, TypeScript, Vite
* **Styling and Animations:** Tailwind CSS v4, Framer Motion
* **Icons:** Lucide-React
* **Utilities:** react-markdown, html2pdf.js, xlsx

## Getting Started

To run or build the project locally, ensure you have Node.js, npm, and the Rust Toolkit installed. By default, it targets the WSL default Ubuntu environment footprint for OpenCLAW (`\\wsl.localhost\Ubuntu\home\your-user\.openclaw`).

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ClariSortAi/openclaw-monitor.git
   cd openclaw-monitor
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the local development environment:**
   ```bash
   npm run tauri dev
   ```

4. **Build for Production (Installer):**
   ```bash
   npm run tauri build
   ```
   Note: On Windows, your bundled NSIS and MSI setup files will be output to `src-tauri/target/release/bundle/nsis/`.

## License

This project is open-sourced software licensed under the MIT License.
