#!/usr/bin/env node

import { Command } from 'commander';
import {
  isGitRepo,
  getCommits,
  aggregateByDay,
  generateDateRange,
  buildGrid,
  getStats,
} from './git';
import {
  renderReef,
  renderLegend,
  renderStats,
  renderHeader,
  renderError,
  renderNoData,
} from './renderer';

const program = new Command();

program
  .name('reef')
  .description(
    '🪸 Coral Reef - A beautiful git activity visualizer for your terminal'
  )
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
    if (!isGitRepo(cwd)) {
      console.log(renderError('Not a git repository'));
      console.log(
        '  Run this command from inside a git repository, or navigate to one first.\n'
      );
      process.exit(1);
    }

    const weeks = parseInt(options.weeks, 10);
    if (isNaN(weeks) || weeks < 1 || weeks > 104) {
      console.log(renderError('Invalid weeks value. Must be between 1 and 104.'));
      process.exit(1);
    }

    // Build filters description
    const filters: string[] = [];
    if (options.author) filters.push(`author: ${options.author}`);
    if (options.since) filters.push(`since: ${options.since}`);
    if (options.until) filters.push(`until: ${options.until}`);

    // Calculate date range
    let endDate: Date | undefined;
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
    const commits = getCommits({
      author: options.author,
      since: options.since,
      until: options.until,
      cwd,
    });

    // Generate date range and build the grid
    const dateRange = generateDateRange(effectiveWeeks, endDate);
    const commitCounts = aggregateByDay(commits);
    const grid = buildGrid(dateRange, commitCounts);

    // Render output
    console.log(renderHeader(cwd, filters));

    if (commits.length === 0) {
      console.log(renderNoData());
    } else {
      console.log(renderReef(grid));

      if (options.legend !== false) {
        console.log(renderLegend());
      }

      if (options.stats !== false) {
        const stats = getStats(commits);
        console.log(renderStats(stats));
      }
    }
  });

program.parse();
