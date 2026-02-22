# 🧠 OpenCLAW Monitor

**OpenCLAW Monitor** is a sleek, ultra-fast, native Windows desktop application designed to bridge the gap between Windows and the OpenCLAW autonomous AI workspace residing inside the WSL (Windows Subsystem for Linux) Ubuntu environment.

Built with **Rust (Tauri)**, **React**, **TypeScript**, **Framer Motion**, and **TailwindCSS**, OpenCLAW Monitor provides an intuitive, high-performance UI tailored to cleanly present, edit, and visualize your AI's internal state, memory, heartbeat, and local files directly on your Windows desktop. 

---

## ✨ Features

- **🚀 Native Desktop Performance:** Runs effortlessly with extreme speed, low memory footprint, and system-level file access via Tauri.
- **🖼️ Beautiful, Interactive UI:** Designed with rich, glassmorphic styling, smooth micro-animations (Framer Motion), and glowing accents for a premium user experience.
- **🧩 Task Management Pane:** Instantly view tasks generated or modified by your AI agent, organized elegantly.
- **⏱️ Time Logging:** Monitor the time-log cycles and heartbeats of the OpenCLAW daemon autonomously executing within WSL. 
- **👻 Agent State ("Soul" Viewer):** Intelligently monitors the core operational and personality states (`SOUL.md`, `MEMORY.md`, `IDENTITY.md`) for deep insights.
- **📂 Workspace File Explorer:** Fully-functional integrated file manager for traversing the inner paths of OpenCLAW's workspace environment.
  - Explore, Read, Edit, and Save files bi-directionally.
  - Integrated Markdown renderer (Preview) mirroring standard modern IDEs.
  - Native **PDF Export** and **Excel Spreadsheet exports** generated natively inside the browser frontend. 

## 🛠️ Tech Stack

- **Framework:** [Tauri](https://tauri.app/)
- **Frontend Stack:** [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling & Animations:** [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide-React](https://lucide.dev/)
- **Utilities:** `react-markdown`, `html2pdf.js`, `xlsx`

---

## 🚀 Getting Started

To run or build the project locally, ensure you have **Node.js**, **npm**, and **Rust Toolkit** installed. By default, it targets the WSL default Ubuntu environment footprint for OpenCLAW (`\\wsl.localhost\Ubuntu\home\your-user\.openclaw`).

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jason/openclaw-monitor.git
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
   *Note: On Windows, your bundled NSIS and MSI setup files will be output to `src-tauri/target/release/bundle/nsis/`.*

## 📜 License

This project is open-sourced software licensed under the **MIT License**.
