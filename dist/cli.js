#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const git_1 = require("./git");
const renderer_1 = require("./renderer");
const program = new commander_1.Command();
program
    .name('reef')
    .description('🪸 Coral Reef - A beautiful git activity visualizer for your terminal')
    .version('1.0.0')
    .option('-a, --author <name>', 'Filter commits by author')
    .option('-s, --since <date>', 'Show commits since date (e.g., 2024-01-01)')
    .option('-u, --until <date>', 'Show commits until date (e.g., 2024-12-31)')
    .option('-w, --weeks <number>', 'Number of weeks to display', '52')
    .option('--no-stats', 'Hide statistics')
    .option('--no-legend', 'Hide legend')
    .action((options) => {
    const cwd = process.cwd();
    // Check if we're in a git repository
    if (!(0, git_1.isGitRepo)(cwd)) {
        console.log((0, renderer_1.renderError)('Not a git repository'));
        console.log('  Run this command from inside a git repository, or navigate to one first.\n');
        process.exit(1);
    }
    const weeks = parseInt(options.weeks, 10);
    if (isNaN(weeks) || weeks < 1 || weeks > 104) {
        console.log((0, renderer_1.renderError)('Invalid weeks value. Must be between 1 and 104.'));
        process.exit(1);
    }
    // Build filters description
    const filters = [];
    if (options.author)
        filters.push(`author: ${options.author}`);
    if (options.since)
        filters.push(`since: ${options.since}`);
    if (options.until)
        filters.push(`until: ${options.until}`);
    // Calculate date range
    let endDate;
    if (options.until) {
        endDate = new Date(options.until);
    }
    // If --since is provided but not --weeks, calculate weeks from since to now/until
    let effectiveWeeks = weeks;
    if (options.since && options.weeks === '52') {
        const sinceDate = new Date(options.since);
        const untilDate = endDate || new Date();
        const diffTime = Math.abs(untilDate.getTime() - sinceDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        effectiveWeeks = Math.min(104, Math.ceil(diffDays / 7) + 1);
    }
    // Get commits from git
    const commits = (0, git_1.getCommits)({
        author: options.author,
        since: options.since,
        until: options.until,
        cwd,
    });
    // Generate date range and build the grid
    const dateRange = (0, git_1.generateDateRange)(effectiveWeeks, endDate);
    const commitCounts = (0, git_1.aggregateByDay)(commits);
    const grid = (0, git_1.buildGrid)(dateRange, commitCounts);
    // Render output
    console.log((0, renderer_1.renderHeader)(cwd, filters));
    if (commits.length === 0) {
        console.log((0, renderer_1.renderNoData)());
    }
    else {
        console.log((0, renderer_1.renderReef)(grid));
        if (options.legend !== false) {
            console.log((0, renderer_1.renderLegend)());
        }
        if (options.stats !== false) {
            const stats = (0, git_1.getStats)(commits);
            console.log((0, renderer_1.renderStats)(stats));
        }
    }
});
program.parse();
//# sourceMappingURL=cli.js.map