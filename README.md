# Reef

> 🤖 **AI-Generated Project** — This project was autonomously created by an AI. Built with love and lobster claws. 🦞


A colorful git activity visualizer that displays commit history as a coral reef in your terminal.

## Installation

```bash
# Clone or download this repository
cd reef

# Install dependencies
npm install

# Build the project
npm run build

# Link globally
npm link
```

## Usage

```bash
# Show reef for current repository (last 52 weeks)
reef

# Filter by author
reef --author "John Doe"
reef -a "john@example.com"

# Show commits in a date range
reef --since 2024-01-01
reef --until 2024-06-30
reef --since 2024-01-01 --until 2024-06-30

# Customize number of weeks displayed
reef --weeks 26    # Show last 6 months
reef -w 12         # Show last 3 months

# Hide legend or stats
reef --no-legend
reef --no-stats

# Combine options
reef --author "Jane" --since 2024-01-01 --weeks 26
```

## Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--author <name>` | `-a` | Filter commits by author name or email | All authors |
| `--since <date>` | `-s` | Start date (YYYY-MM-DD format) | Beginning of history |
| `--until <date>` | `-u` | End date (YYYY-MM-DD format) | Today |
| `--weeks <number>` | `-w` | Number of weeks to display (1-104) | 52 |
| `--no-stats` | | Hide statistics section | Show stats |
| `--no-legend` | | Hide legend section | Show legend |
| `--version` | `-V` | Show version number | |
| `--help` | `-h` | Show help | |

## Color Palette

Reef uses an ocean-themed color palette:

- **Deep ocean floor** - No commits
- **Deep water blues** - Few commits
- **Mid-water teals** - Moderate activity
- **Shallow reef greens** - Good activity
- **Coral pinks/oranges** - High activity

## Examples

### Basic usage
```
$ reef

  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Coral Reef - Git Activity Visualization
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

     Jan    Feb    Mar    Apr    May    Jun
Sun  █ █ █  █ █ █  █ █ █  █ █ █  █ █ █  █ █ █
Mon  █ █ █  █ █ █  █ █ █  █ █ █  █ █ █  █ █ █
Tue  █ █ █  █ █ █  █ █ █  █ █ █  █ █ █  █ █ █
Wed  █ █ █  █ █ █  █ █ █  █ █ █  █ █ █  █ █ █
Thu  █ █ █  █ █ █  █ █ █  █ █ █  █ █ █  █ █ █
Fri  █ █ █  █ █ █  █ █ █  █ █ █  █ █ █  █ █ █
Sat  █ █ █  █ █ █  █ █ █  █ █ █  █ █ █  █ █ █

  Legend:
  Less █ █ █ █ █ █ █ More

  Deep ocean -> Vibrant coral reef

  Statistics:
  Total commits:      1,234
  Unique authors:     5
  Most active day:    2024-03-15 (42 commits)
  Average per day:    3.4
  Current streak:     7 days
```

## Requirements

- Node.js >= 16.0.0
- Git installed and available in PATH
- Must be run from inside a git repository

## License

MIT
