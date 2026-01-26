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
export declare function isGitRepo(cwd?: string): boolean;
export declare function getCommits(options?: GitOptions): CommitData[];
export declare function aggregateByDay(commits: CommitData[]): Map<string, number>;
export declare function generateDateRange(weeks: number, endDate?: Date): string[];
export declare function buildGrid(dateRange: string[], commitCounts: Map<string, number>): DayCommits[][];
export declare function getStats(commits: CommitData[]): {
    totalCommits: number;
    uniqueAuthors: number;
    mostActiveDay: string | null;
    maxCommitsInDay: number;
    averagePerDay: number;
    streak: number;
};
//# sourceMappingURL=git.d.ts.map