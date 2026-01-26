"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGitRepo = isGitRepo;
exports.getCommits = getCommits;
exports.aggregateByDay = aggregateByDay;
exports.generateDateRange = generateDateRange;
exports.buildGrid = buildGrid;
exports.getStats = getStats;
const child_process_1 = require("child_process");
function isGitRepo(cwd = process.cwd()) {
    try {
        (0, child_process_1.execSync)('git rev-parse --is-inside-work-tree', {
            cwd,
            stdio: 'pipe',
            encoding: 'utf-8',
        });
        return true;
    }
    catch {
        return false;
    }
}
function getCommits(options = {}) {
    const { author, since, until, cwd = process.cwd() } = options;
    const args = [
        'git',
        'log',
        "'--format=%H|%ad|%an'",
        '--date=short',
    ];
    if (author) {
        args.push(`'--author=${author}'`);
    }
    if (since) {
        args.push(`--since=${since}`);
    }
    if (until) {
        args.push(`--until=${until}`);
    }
    try {
        const output = (0, child_process_1.execSync)(args.join(' '), {
            cwd,
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: '/bin/bash',
        });
        return output
            .trim()
            .split('\n')
            .filter((line) => line.length > 0)
            .map((line) => {
            const [hash, date, author] = line.split('|');
            return { hash, date, author };
        });
    }
    catch {
        return [];
    }
}
function aggregateByDay(commits) {
    const counts = new Map();
    for (const commit of commits) {
        const current = counts.get(commit.date) || 0;
        counts.set(commit.date, current + 1);
    }
    return counts;
}
function generateDateRange(weeks, endDate) {
    const dates = [];
    const end = endDate || new Date();
    // Adjust end to be the last Saturday (end of week in our grid)
    const dayOfWeek = end.getDay();
    const daysToSaturday = (6 - dayOfWeek + 7) % 7;
    end.setDate(end.getDate() + daysToSaturday);
    const totalDays = weeks * 7;
    for (let i = totalDays - 1; i >= 0; i--) {
        const date = new Date(end);
        date.setDate(end.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
}
function buildGrid(dateRange, commitCounts) {
    const weeks = [];
    let currentWeek = [];
    for (const date of dateRange) {
        const d = new Date(date);
        const dayOfWeek = d.getDay();
        const count = commitCounts.get(date) || 0;
        currentWeek.push({ date, count, dayOfWeek });
        if (dayOfWeek === 6) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }
    if (currentWeek.length > 0) {
        weeks.push(currentWeek);
    }
    return weeks;
}
function getStats(commits) {
    const totalCommits = commits.length;
    const uniqueAuthors = new Set(commits.map((c) => c.author)).size;
    const dailyCounts = aggregateByDay(commits);
    let mostActiveDay = null;
    let maxCommitsInDay = 0;
    for (const [date, count] of dailyCounts) {
        if (count > maxCommitsInDay) {
            maxCommitsInDay = count;
            mostActiveDay = date;
        }
    }
    const activeDays = dailyCounts.size;
    const averagePerDay = activeDays > 0 ? totalCommits / activeDays : 0;
    // Calculate current streak
    let streak = 0;
    const today = new Date();
    const checkDate = new Date(today);
    while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (dailyCounts.has(dateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        }
        else if (checkDate.getTime() === today.getTime()) {
            // Today might not have commits yet, check yesterday
            checkDate.setDate(checkDate.getDate() - 1);
        }
        else {
            break;
        }
    }
    return {
        totalCommits,
        uniqueAuthors,
        mostActiveDay,
        maxCommitsInDay,
        averagePerDay,
        streak,
    };
}
//# sourceMappingURL=git.js.map