import { DayCommits } from './git';
export interface RenderOptions {
    maxCommits?: number;
}
export declare function renderReef(weeks: DayCommits[][], options?: RenderOptions): string;
export declare function renderLegend(): string;
export declare function renderStats(stats: {
    totalCommits: number;
    uniqueAuthors: number;
    mostActiveDay: string | null;
    maxCommitsInDay: number;
    averagePerDay: number;
    streak: number;
}): string;
export declare function renderHeader(repoPath: string, filters: string[]): string;
export declare function renderError(message: string): string;
export declare function renderNoData(): string;
//# sourceMappingURL=renderer.d.ts.map