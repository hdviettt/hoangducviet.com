# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a data analysis project focused on analyzing search engine results and AI overview citations for multiple brands (Techcombank, Beucare, Bhaya Cruises). The project uses DataForSEO API results stored as JSON files and performs competitor analysis, citation tracking, and brand mention analysis.

## Project Structure

```
techcombank/
├── 1. techcombank/           # Techcombank brand analysis
│   ├── techcombank.json      # DataForSEO API results
│   ├── techcombank-competitor.csv
│   └── techcombank-traffic.csv
├── 2. beucare/               # Beucare brand analysis  
│   ├── care.json             # DataForSEO API results
│   ├── vna-traffic.csv
│   └── vna-traffic-competitor.csv
├── 3. bhayacruises/          # Bhaya Cruises brand analysis
│   ├── bhayacruises.json     # DataForSEO API results
│   ├── brand-mention-summary.csv
│   └── keywords.csv
└── analysis.ipynb            # Main analysis notebook
```

## Key Analysis Components

The project performs several types of analysis:

1. **AI Overview Analysis**: Extracts and analyzes AI-generated overviews from search results
2. **Citation Analysis**: Tracks which sources are cited in AI overviews and their ranking positions
3. **Competitor Analysis**: Identifies most cited competitors and their citation probabilities
4. **Brand Mention Analysis**: Detects brand mentions in AI overview content using regex patterns

## Development Commands

### Run Jupyter Notebook
```bash
jupyter notebook analysis.ipynb
```

### Execute notebook cells programmatically
```bash
jupyter nbconvert --to notebook --execute analysis.ipynb
```

## Data Processing Workflow

1. **Load JSON data**: Each brand folder contains DataForSEO API results in JSON format with nested structure
2. **Extract AI Overviews**: Filter results to find keywords that trigger AI overviews
3. **Process Markdown Content**: Clean AI overview markdown by removing citations and formatting
4. **Extract References**: Parse citation references to identify domains and sources
5. **Competitor Analysis**: Aggregate citation data to identify top competitors
6. **Export Results**: Generate CSV files with analysis results

## Key Data Structures

- **DataForSEO JSON**: Nested dictionary with search results containing `keyword`, `items`, `type`, etc.
- **AI Overview Items**: Contains `markdown` content and `references` list
- **References**: List of dictionaries with `domain`, `source`, `url`, and `rank`

## Python Environment

- Python 3.13.3
- Key packages: pandas, plotly, json, re
- Jupyter environment for interactive analysis

## Important Notes

- JSON files are large (7-126MB) and contain deeply nested structures
- The analysis focuses on extracting AI overview content when present in search results
- Brand names and domains are configurable at the top of the notebook
- Citation cleaning uses regex to remove reference markers while preserving content