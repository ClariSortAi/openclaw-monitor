export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
    id: string;
    content: string;
    status: TaskStatus;
    dueDate?: string;
    completedDate?: string;
    section: string;
}

export function parseTodoMd(content: string): Task[] {
    const lines = content.split('\n');
    const tasks: Task[] = [];
    let currentSection = 'Inbox';

    for (const line of lines) {
        const sectionMatch = line.match(/^##\s+(.+)$/);
        if (sectionMatch) {
            currentSection = sectionMatch[1].trim();
            continue;
        }

        const taskMatch = line.match(/^\s*-\s+\[([ x/X])\]\s+(.+)$/);
        if (taskMatch) {
            const checkbox = taskMatch[1];
            const text = taskMatch[2].trim();

            let status: TaskStatus = 'todo';
            if (checkbox === 'x' || checkbox === 'X') status = 'done';
            if (checkbox === '/') status = 'in-progress';

            let dueDate: string | undefined;
            const dueMatch = text.match(/\((?:Due|due) ([^)]+)\)/i);
            if (dueMatch) {
                dueDate = dueMatch[1];
            }

            let completedDate: string | undefined;
            const completedMatch = text.match(/\(completed ([^)]+)\)/i);
            if (completedMatch) {
                completedDate = completedMatch[1];
            }

            tasks.push({
                id: crypto.randomUUID(),
                // Only strip the parsed date notes to keep it clean
                content: text.replace(/\((?:Due|due|completed) [^)]+\)/gi, '').trim(),
                status,
                dueDate,
                completedDate,
                section: currentSection
            });
        }
    }

    return tasks;
}

export interface TimeEntry {
    id: string;
    date: string;
    project: string;
    startLocal: string;
    endLocal: string;
    durationMinutes: number;
    durationHours: number;
    overlaps: string;
    notes: string;
}

export function parseCsv(content: string): TimeEntry[] {
    const lines = content.split('\n').filter(l => l.trim() !== '');
    if (lines.length < 2) return [];

    const entries: TimeEntry[] = [];
    for (let i = 1; i < lines.length; i++) {
        const raw = lines[i];
        // Simple CSV split
        const parts = raw.split(',');
        if (parts.length >= 7) {
            entries.push({
                id: crypto.randomUUID(),
                date: parts[0] || '',
                project: parts[1] || 'Unknown',
                startLocal: parts[2] || '',
                endLocal: parts[3] || '',
                durationMinutes: parseInt(parts[4]) || 0,
                durationHours: parseFloat(parts[5]) || 0,
                overlaps: parts[6] || '',
                notes: parts.slice(7).join(',').trim()
            });
        }
    }
    return entries;
}
