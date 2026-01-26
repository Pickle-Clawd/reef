import { execSync } from 'child_process';

export interface CommitData {
  date: string;
  author: string;
  hash: string;
}

export interface GitOptions {
  author?: string;
  since?: string;
  until?: string;
  cwd?: string;
}

export interface DayCommits {
  date: string;
  count: number;
  dayOfWeek: number;
}

export function isGitRepo(cwd: string = process.cwd()): boolean {
  try {
    execSync('git rev-parse --is-inside-work-tree', {
      cwd,
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    return true;
  } catch {
    return false;
  }
}

export function getCommits(options: GitOptions = {}): CommitData[] {
  const { author, since, until, cwd = process.cwd() } = options;

  const args: string[] = [
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
    const output = execSync(args.join(' '), {
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
  } catch {
    return [];
  }
}

export function aggregateByDay(commits: CommitData[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const commit of commits) {
    const current = counts.get(commit.date) || 0;
    counts.set(commit.date, current + 1);
  }

  return counts;
}

export function generateDateRange(weeks: number, endDate?: Date): string[] {
  const dates: string[] = [];
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

export function buildGrid(
  dateRange: string[],
  commitCounts: Map<string, number>
): DayCommits[][] {
  const weeks: DayCommits[][] = [];
  let currentWeek: DayCommits[] = [];

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

export function getStats(commits: CommitData[]): {
  totalCommits: number;
  uniqueAuthors: number;
  mostActiveDay: string | null;
  maxCommitsInDay: number;
  averagePerDay: number;
  streak: number;
} {
  const totalCommits = commits.length;
  const uniqueAuthors = new Set(commits.map((c) => c.author)).size;

  const dailyCounts = aggregateByDay(commits);
  let mostActiveDay: string | null = null;
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
    } else if (checkDate.getTime() === today.getTime()) {
      // Today might not have commits yet, check yesterday
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
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
