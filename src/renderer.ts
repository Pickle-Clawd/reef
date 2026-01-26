import chalk from 'chalk';
import { DayCommits } from './git';

// Ocean-themed color palette
// From deep ocean (no commits) to vibrant coral (many commits)
const OCEAN_COLORS = {
  empty: '#0a1628',      // Deep ocean floor
  level1: '#1a3a5c',     // Deep water
  level2: '#2d6a7a',     // Mid-water teal
  level3: '#3d9a8a',     // Shallow reef
  level4: '#5bc4a8',     // Bright reef
  level5: '#ff7f6e',     // Coral pink
  level6: '#ff5a47',     // Vibrant coral
};

const CORAL_CHARS = {
  block: '█',
  coral1: '▓',
  coral2: '▒',
  coral3: '░',
  bubble: '○',
  wave: '~',
};

export interface RenderOptions {
  maxCommits?: number;
}

function getColorLevel(count: number, maxCommits: number): number {
  if (count === 0) return 0;
  if (maxCommits <= 0) return 1;

  const ratio = count / maxCommits;

  if (ratio <= 0.1) return 1;
  if (ratio <= 0.25) return 2;
  if (ratio <= 0.5) return 3;
  if (ratio <= 0.75) return 4;
  if (ratio <= 0.9) return 5;
  return 6;
}

function getColorForLevel(level: number): chalk.Chalk {
  switch (level) {
    case 0:
      return chalk.hex(OCEAN_COLORS.empty);
    case 1:
      return chalk.hex(OCEAN_COLORS.level1);
    case 2:
      return chalk.hex(OCEAN_COLORS.level2);
    case 3:
      return chalk.hex(OCEAN_COLORS.level3);
    case 4:
      return chalk.hex(OCEAN_COLORS.level4);
    case 5:
      return chalk.hex(OCEAN_COLORS.level5);
    case 6:
      return chalk.hex(OCEAN_COLORS.level6);
    default:
      return chalk.hex(OCEAN_COLORS.empty);
  }
}

export function renderReef(
  weeks: DayCommits[][],
  options: RenderOptions = {}
): string {
  const lines: string[] = [];

  // Find max commits for color scaling
  const maxCommits =
    options.maxCommits ||
    Math.max(1, ...weeks.flatMap((week) => week.map((day) => day.count)));

  // Header with ocean waves
  const waveColor = chalk.hex('#4a90a4');
  const headerWidth = Math.min(weeks.length * 2 + 10, 120);
  lines.push('');
  lines.push(
    waveColor('  ' + CORAL_CHARS.wave.repeat(Math.min(headerWidth, 60)))
  );
  lines.push(
    chalk.hex('#5bc4a8').bold('  🐚 Coral Reef - Git Activity Visualization 🪸')
  );
  lines.push(
    waveColor('  ' + CORAL_CHARS.wave.repeat(Math.min(headerWidth, 60)))
  );
  lines.push('');

  // Month labels
  const monthLabels = getMonthLabels(weeks);
  lines.push('     ' + monthLabels);

  // Days of week labels
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Render grid (7 rows for days of week)
  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
    const dayLabel = chalk.hex('#6a9ab0')(dayLabels[dayOfWeek].padEnd(4));
    let row = dayLabel + ' ';

    for (const week of weeks) {
      const day = week.find((d) => d.dayOfWeek === dayOfWeek);
      if (day) {
        const level = getColorLevel(day.count, maxCommits);
        const color = getColorForLevel(level);
        row += color(CORAL_CHARS.block + ' ');
      } else {
        row += '  ';
      }
    }

    lines.push(row);
  }

  lines.push('');

  return lines.join('\n');
}

function getMonthLabels(weeks: DayCommits[][]): string {
  const months: { month: string; position: number }[] = [];
  let currentMonth = '';

  for (let i = 0; i < weeks.length; i++) {
    const week = weeks[i];
    if (week.length > 0) {
      const date = new Date(week[0].date);
      const monthName = date.toLocaleString('default', { month: 'short' });

      if (monthName !== currentMonth) {
        months.push({ month: monthName, position: i });
        currentMonth = monthName;
      }
    }
  }

  // Build label string
  let label = '';
  let lastPos = 0;

  for (const { month, position } of months) {
    const spaces = (position - lastPos) * 2;
    label += ' '.repeat(Math.max(0, spaces)) + chalk.hex('#6a9ab0')(month);
    lastPos = position + Math.ceil(month.length / 2);
  }

  return label;
}

export function renderLegend(): string {
  const lines: string[] = [];

  lines.push(chalk.hex('#5bc4a8').bold('  Legend:'));
  lines.push('');

  const legendItems = [
    { level: 0, label: 'No commits' },
    { level: 1, label: 'Low' },
    { level: 2, label: '' },
    { level: 3, label: '' },
    { level: 4, label: '' },
    { level: 5, label: '' },
    { level: 6, label: 'High' },
  ];

  let legendRow = '  Less ';
  for (const item of legendItems) {
    const color = getColorForLevel(item.level);
    legendRow += color(CORAL_CHARS.block) + ' ';
  }
  legendRow += 'More';

  lines.push(chalk.hex('#6a9ab0')(legendRow));
  lines.push('');

  // Ocean depth key
  lines.push(chalk.hex('#4a90a4')('  🌊 Deep ocean → 🪸 Vibrant coral reef'));
  lines.push('');

  return lines.join('\n');
}

export function renderStats(stats: {
  totalCommits: number;
  uniqueAuthors: number;
  mostActiveDay: string | null;
  maxCommitsInDay: number;
  averagePerDay: number;
  streak: number;
}): string {
  const lines: string[] = [];

  const titleColor = chalk.hex('#5bc4a8').bold;
  const labelColor = chalk.hex('#6a9ab0');
  const valueColor = chalk.hex('#ff7f6e').bold;

  lines.push(titleColor('  Statistics:'));
  lines.push('');
  lines.push(
    labelColor('  Total commits:      ') + valueColor(stats.totalCommits.toString())
  );
  lines.push(
    labelColor('  Unique authors:     ') + valueColor(stats.uniqueAuthors.toString())
  );

  if (stats.mostActiveDay) {
    lines.push(
      labelColor('  Most active day:    ') +
        valueColor(`${stats.mostActiveDay} (${stats.maxCommitsInDay} commits)`)
    );
  }

  lines.push(
    labelColor('  Average per day:    ') +
      valueColor(stats.averagePerDay.toFixed(1))
  );

  if (stats.streak > 0) {
    lines.push(
      labelColor('  Current streak:     ') +
        valueColor(`${stats.streak} day${stats.streak > 1 ? 's' : ''} 🔥`)
    );
  }

  lines.push('');

  return lines.join('\n');
}

export function renderHeader(repoPath: string, filters: string[]): string {
  const lines: string[] = [];

  const pathColor = chalk.hex('#4a90a4');
  const filterColor = chalk.hex('#6a9ab0');

  lines.push(pathColor(`  Repository: ${repoPath}`));

  if (filters.length > 0) {
    lines.push(filterColor(`  Filters: ${filters.join(', ')}`));
  }

  lines.push('');

  return lines.join('\n');
}

export function renderError(message: string): string {
  return chalk.hex('#ff5a47').bold(`\n  ❌ Error: ${message}\n`);
}

export function renderNoData(): string {
  const lines: string[] = [];

  lines.push('');
  lines.push(chalk.hex('#4a90a4')('  🌊 The ocean is calm...'));
  lines.push(chalk.hex('#6a9ab0')('  No commits found for the specified criteria.'));
  lines.push('');

  return lines.join('\n');
}
