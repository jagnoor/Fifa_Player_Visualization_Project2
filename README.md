# FIFA Player Visualization Project

An interactive, data-driven dashboard exploring **17,054 FIFA 22 players** across 6 continents, 162 nationalities, and 700+ clubs. Built with Flask, D3.js v7, and Plotly.js, this project features **12+ interactive visualizations** ranging from force-directed network graphs and chord diagrams to zoomable treemaps and radar charts.

---

## Table of Contents

- [Live Pages](#live-pages)
- [Dataset](#dataset)
- [Getting Started](#getting-started)
- [Project Architecture](#project-architecture)
- [Pages & Visualizations](#pages--visualizations)
  - [Home Page](#home-page--)
  - [Comparison Page](#comparison-page--compare)
  - [Advanced Visualizations Page](#advanced-visualizations-page--visualizations)
  - [About Page](#about-page--about)
- [API Endpoints](#api-endpoints)
- [Technologies Used](#technologies-used)
- [Authors](#authors)
- [License](#license)

---

## Live Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | D3 circle-packing chart + 4 Plotly charts in a carousel |
| Comparison | `/compare` | Player attribute radar/spider chart with dropdown selector |
| Visualizations | `/visualizations` | 7 advanced interactive D3.js visualizations |
| About | `/about` | Project overview, methodology, and team info |

---

## Dataset

### Source

**FIFA 22 Complete Player Dataset** — originally compiled by [Stefano Leone](https://www.kaggle.com/datasets/stefanoleone992/ea-sports-fc-24-complete-player-dataset) and sourced from [SoFIFA.com](https://sofifa.com). The dataset used in this project was obtained from a [GitHub mirror](https://github.com/abineshta/FIFA-22-complete-player-dataset-EDA) of the Kaggle dataset.

### What It Contains

The dataset (`clean.csv`) includes **17,054 outfield and goalkeeper players** with 16 attributes each:

| Column | Type | Description |
|--------|------|-------------|
| `sofifa_id` | Integer | Unique player identifier from SoFIFA database |
| `player_url` | String | Direct URL to the player's SoFIFA profile page |
| `short_name` | String | Player's commonly known short name (e.g., "L. Messi") |
| `age` | Integer | Player's age at the time of the FIFA 22 game release (range: 16–54) |
| `nationality` | String | Player's country of nationality (162 unique countries) |
| `club` | String | The club team the player belongs to (701 unique clubs) |
| `overall` | Integer | The player's Overall Rating (OVR) in FIFA 22, representing general quality (range: 47–93) |
| `wage_eur` | Float | Weekly wage in Euros the player earns in Career Mode (range: €500–€350,000) |
| `player_positions` | String | Comma-separated list of positions the player can play (e.g., "ST, LW, CF") |
| `pace` | Float | Speed rating combining Sprint Speed and Acceleration (0–100) |
| `shooting` | Float | Shooting ability combining Finishing, Shot Power, Long Shots, etc. (0–100) |
| `passing` | Float | Passing ability combining Short Passing, Long Passing, Vision, etc. (0–100) |
| `dribbling` | Float | Dribbling skill combining Ball Control, Agility, Balance, etc. (0–100) |
| `defending` | Float | Defensive ability combining Marking, Tackles, Interceptions, etc. (0–100) |
| `physic` | Float | Physical attributes combining Strength, Stamina, Jumping, etc. (0–100) |
| `continent` | String | Continent derived from nationality (Europe, South America, Asia, Africa, North America, Oceania) |

### Data Processing

The raw FIFA 22 dataset contained 19,239 players with 100+ columns. The data was processed as follows:

1. **Column selection**: Extracted the 15 most relevant columns for visualization
2. **Missing data removal**: Dropped rows with null values in key stat columns (pace, shooting, etc.), reducing to 17,054 players
3. **Continent mapping**: Added a `continent` column by mapping all 162 nationalities to their geographic continent using a comprehensive lookup table
4. **Sorting**: Ordered by overall rating descending so the top players appear first in all queries

### Why FIFA 22 (Not FIFA 20 or FC 25)?

- **FIFA 20** (original dataset): Only 16,208 players, older data from 2019
- **FIFA 22** (current dataset): 17,054 players, more recent (2021), and freely downloadable as a complete CSV from GitHub
- **EA FC 25** (latest game): Full datasets with all stats are only available on Kaggle (requires account) or by running web scrapers. No complete freely-hosted CSV exists with all required attribute columns

---

## Getting Started

### Prerequisites

- Python 3.8+
- pip

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/jagnoor/Fifa_Player_Visualization_Project2.git
cd Fifa_Player_Visualization_Project2

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the application
python app.py
```

### Open in Browser

Navigate to **http://127.0.0.1:5000**

No database setup is required — the app reads directly from `clean.csv`.

### Dependencies

Listed in `requirements.txt`:

| Package | Purpose |
|---------|---------|
| `flask>=2.0` | Web framework serving HTML pages and JSON API endpoints |
| `pandas>=1.3` | Data loading, filtering, aggregation, and transformation |
| `numpy` | Numerical operations for data processing |

All frontend libraries (D3.js, Plotly.js, Bootstrap, Slick Carousel) are loaded from CDNs — no npm/yarn installation needed.

---

## Project Architecture

```
Fifa_Player_Visualization_Project2/
├── app.py                          # Flask application with all routes and API endpoints
├── clean.csv                       # Processed FIFA 22 dataset (17,054 players)
├── requirements.txt                # Python dependencies
├── fifa.sql                        # Original SQL schema (historical reference)
├── README.md                       # This file
├── .gitignore                      # Git ignore rules
├── templates/
│   ├── index.html                  # Home page (D3 circle packing + Plotly charts)
│   ├── compare.html                # Player comparison page (radar chart)
│   ├── visualizations.html         # Advanced D3 visualizations page (7 charts)
│   └── about.html                  # About page
├── static/
│   ├── css/
│   │   └── style.css               # Global styles for D3, navigation, layout
│   └── js/
│       ├── logic.js                # Home page: Plotly charts + D3 circle packing
│       ├── app.js                  # Comparison page: radar chart + stats panel
│       └── visualizations.js       # Advanced visualizations page: 7 D3 charts
├── images/                         # Screenshot images
└── rachel/                         # Original raw data files
```

---

## Pages & Visualizations

### Home Page (`/`)

The landing page features **5 interactive visualizations**:

#### 1. D3 Circle Packing — Top 2,000 Players by Nationality

- **Library**: D3.js v7
- **Data Source**: `/d3data` API endpoint (hierarchical JSON)
- **What It Shows**: A zoomable, nested circle chart where the outermost circle contains 6 continent circles, each containing country circles, each containing individual player circles. Circle size is proportional to player overall rating.
- **Interactions**:
  - **Click** a continent/country circle to zoom in
  - **Hover** over any circle to see a tooltip with name, player count, and average rating
  - **Click background** or the "Zoom Out" button in the breadcrumb to navigate back
  - **Breadcrumb trail** shows your current zoom path (e.g., Root >> Europe >> Spain)
- **What It Reveals**: Europe dominates with the most top-rated players. Within Europe, Spain, England, and Germany have the densest clusters. South America is the second-largest continent represented.

#### 2. Top 15 Highest Paid Players (Bar Chart)

- **Library**: Plotly.js
- **Data Source**: `/fifadata` — sorted by `wage_eur` descending, top 15
- **What It Shows**: A vertical bar chart of the 15 highest-paid players in FIFA 22 by weekly wage in EUR
- **Interactions**: Hover for exact wage, zoom, pan, download as PNG
- **What It Reveals**: L. Messi leads with €350,000/week. There is a steep drop-off after the top 5 earners.

#### 3. Top 10 Player-Producing Countries (Horizontal Bar)

- **Library**: Plotly.js
- **Data Source**: `/fifadata` — nationality frequency count, top 10
- **What It Shows**: The 10 countries that have produced the most FIFA players in the dataset
- **Interactions**: Hover for exact count
- **What It Reveals**: England leads (1,700+), followed by Germany, Spain, France, and Argentina. European countries dominate the top 10.

#### 4. Player Count by Age (Color-Coded Bar)

- **Library**: Plotly.js
- **Data Source**: `/fifadata` — age frequency distribution
- **What It Shows**: How many players exist at each age from 16 to 54
- **Color Coding**: Green = young (16–20), Blue = prime (21–27), Orange = veteran (28–32), Red = senior (33+)
- **What It Reveals**: Peak player count is at ages 21–27. There is a sharp decline after 33, with very few players above 40.

#### 5. Clubs with Most Players in Top 30 (Pie Chart)

- **Library**: Plotly.js
- **Data Source**: `/fifadata` — top 30 by overall, grouped by club
- **What It Shows**: Which clubs have the most representation among the world's best 30 players
- **What It Reveals**: FC Barcelona, Manchester City, Paris Saint-Germain, and Real Madrid dominate the elite tier.

---

### Comparison Page (`/compare`)

#### 6. Player Attribute Radar/Spider Chart

- **Library**: Plotly.js (scatterpolar)
- **Data Source**: `/fifadata` — filtered by selected player name
- **What It Shows**: A radar chart displaying 7 key attributes for any selected player: Overall, Pace, Passing, Physic, Shooting, Defending, Dribbling. All attributes are on a 0–100 scale.
- **Interactions**:
  - **Dropdown selector** with all 17,054 players — select any player to see their radar
  - **Stats panel** on the right shows exact numeric values
- **What It Reveals**: Forwards like L. Messi have high Dribbling/Shooting but low Defending. Defenders like V. van Dijk show the opposite pattern. This makes it easy to compare player profiles.

---

### Advanced Visualizations Page (`/visualizations`)

This page contains **7 fully interactive D3.js visualizations**, each exploring a different dimension of the dataset.

#### 7. Player Relationship Network (Force-Directed Graph)

- **Library**: D3.js v7 — `d3.forceSimulation`, `d3.forceLink`, `d3.forceManyBody`
- **Data Source**: `/api/top-players-network` — top 80 players with club and nationality links
- **What It Shows**: A physics-based network graph where each node is one of the top 80 FIFA players. Blue links connect teammates (same club), orange links connect players from the same country.
- **Interactions**:
  - **Drag** any player node to rearrange the graph — the physics simulation responds in real time
  - **Hover** over a player to highlight their connections and see stats (overall, club, nationality, wage, age)
  - **Filter buttons** (All / Club Only / Nationality Only) to isolate connection types
  - Node **size** is proportional to overall rating; **color** represents continent
- **What It Reveals**: Clusters of same-club players form tight groups (e.g., PSG, Man City, Barcelona). Nationality connections create broader bridges between club clusters. Players like K. De Bruyne (Belgium + Man City) act as bridge nodes.

#### 8. Club Quality Treemap (Zoomable)

- **Library**: D3.js v7 — `d3.treemap`, `d3.hierarchy`
- **Data Source**: `/api/club-treemap` — top 3,000 players grouped by continent > club
- **What It Shows**: A hierarchical treemap where rectangle size represents the number of top players in a club, and color intensity represents the club's average overall rating (darker = higher rating). First level shows continents, second level shows individual clubs.
- **Interactions**:
  - **Click** a continent to zoom in and see its clubs
  - **Breadcrumb** with "Back" button to navigate to the parent level
  - **Hover** over a club rectangle to see its name, player count, and average overall
- **What It Reveals**: European clubs (FC Bayern, Real Madrid, Barcelona) have both the highest counts and highest average ratings. South American clubs like Boca Juniors and River Plate appear but with lower average ratings.

#### 9. Wage vs Overall Rating Scatter Plot (with Brush)

- **Library**: D3.js v7 — `d3.brush`, `d3.scaleLinear`
- **Data Source**: `/api/wage-overall` — top 500 players by overall rating
- **What It Shows**: Each dot represents a player, positioned by their overall rating (x-axis) and weekly wage in EUR (y-axis). Dots are color-coded by continent.
- **Interactions**:
  - **Brush** (click and drag) to select a rectangular region — selected players are highlighted and listed below the chart
  - **Hover** over a dot to see the player's name, club, wage, age, and continent
  - **Continent filter** dropdown to isolate players from one continent
  - **Stats cards** at the top update dynamically showing count, average overall, average wage, and highest-paid player
- **What It Reveals**: There is a positive but nonlinear relationship between overall rating and wage. Some players are significantly underpaid relative to their rating (value picks), while a few earn disproportionately more. Most top earners are European.

#### 10. Position Distribution by Age (Stacked Area Chart)

- **Library**: D3.js v7 — `d3.stack`, `d3.area`, `d3.curveBasis`
- **Data Source**: `/api/position-age` — player count per position group per age
- **Position Groups**: GK (Goalkeeper), DEF (CB, RB, LB, RWB, LWB), MID (CDM, CM, CAM, RM, LM), FWD (RW, LW, CF, ST, RF, LF)
- **What It Shows**: Four stacked colored areas showing how many players play each position group at each age, from 16 to 44.
- **Interactions**:
  - **Hover** a vertical crosshair follows your mouse, showing exact counts for all 4 position groups at that age
  - **Hover** over a specific area to highlight that position group
- **What It Reveals**: Midfielders are the most common position group across all ages. Forward players peak earlier (ages 21–25) and decline faster than defenders, who maintain higher numbers into their 30s. Goalkeepers are the smallest group but persist longest in age.

#### 11. Position Versatility Chord Diagram

- **Library**: D3.js v7 — `d3.chord`, `d3.ribbon`, `d3.arc`
- **Data Source**: `/api/position-chord` — 13×13 co-occurrence matrix of positions
- **Positions Tracked**: GK, CB, RB, LB, CDM, CM, CAM, RM, LM, RW, LW, ST, CF
- **What It Shows**: A circular diagram where each arc represents a position and each ribbon connecting two arcs represents the number of players who can play both positions. Thicker ribbons = more players with that dual capability.
- **Interactions**:
  - **Hover** over a position arc to highlight only its connections (all other ribbons fade)
  - **Hover** over a ribbon to see the exact count of dual-position players
  - Tooltip shows the position pair and count
- **What It Reveals**: ST↔CF is the most common dual position (strikers who can play center forward). CM↔CDM and CAM↔CM are also very common midfield versatility pairs. GK is almost completely isolated — goalkeepers rarely play other positions.

#### 12. Continent Attribute Radar Comparison

- **Library**: D3.js v7 — custom radial/polar chart with `d3.lineRadial`
- **Data Source**: `/api/continent-summary` — average attribute per continent
- **Attributes Compared**: Pace, Shooting, Passing, Dribbling, Defending, Physic (all averaged per continent)
- **What It Shows**: Six overlapping radar polygons (one per continent), each vertex representing the continent's average rating in one attribute. A larger polygon means higher average stats.
- **Interactions**:
  - **Click legend items** to toggle individual continents on/off for clearer comparison
  - **Hover** over data points to see exact attribute values
  - Grid circles show scale reference (20, 40, 60, 80)
- **What It Reveals**: South American players have the highest average pace and dribbling. European players lead in passing. African players have higher average physic (physicality). All continents converge around 50–65 for most attributes, but the differences reveal real regional playing-style tendencies.

#### 13. Attribute Distribution by Continent (Bee Swarm / Strip Plot)

- **Library**: D3.js v7 — jittered scatter with `d3.scaleBand`, statistical overlays
- **Data Source**: `/api/attribute-distribution` — 3,000 sampled players, all 6 attributes
- **What It Shows**: For each continent (y-axis), individual player dots are plotted at their attribute value (x-axis), with random vertical jitter to reveal the distribution shape. Box-plot overlays show the interquartile range (IQR) and median line.
- **Interactions**:
  - **Attribute toggle buttons** (Pace, Shooting, Passing, Dribbling, Defending, Physic) to switch between attributes
  - **Hover** over any dot to see its continent and exact value
  - Distribution redraws with smooth updates when switching attributes
- **What It Reveals**: All continents have wide distributions, but the medians and IQRs differ. For "Defending," there's a broad spread reflecting the mix of forwards (low defending) and defenders (high defending) in each continent. For "Pace," African and South American players show slightly higher medians.

---

## API Endpoints

All API endpoints return JSON data. They are designed to pre-process and aggregate data server-side to keep the browser performant.

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/fifadata` | GET | All 17,054 players with 16 attributes | Array of player objects |
| `/jagdata` | GET | First 1,000 players (5 columns only) | Array of player objects |
| `/d3data` | GET | Hierarchical data: root > continent > country > player | Nested object for D3 hierarchy |
| `/api/continent-summary` | GET | Aggregated stats per continent (count, avg of all attributes) | Array of 6 continent objects |
| `/api/position-age` | GET | Player count by position group (GK/DEF/MID/FWD) at each age | Array of objects with age and counts |
| `/api/wage-overall` | GET | Top 500 players by rating with full stats | Array of player objects |
| `/api/club-treemap` | GET | Hierarchical: root > continent > club (top 3,000 players) | Nested object for D3 treemap |
| `/api/position-chord` | GET | 13×13 co-occurrence matrix of position pairs | Object with labels array and matrix |
| `/api/top-players-network` | GET | Top 80 players as nodes + club/nationality links | Object with nodes and links arrays |
| `/api/attribute-distribution` | GET | 3,000 sampled players × 6 attributes for strip plot | Array of {continent, attribute, value} |
| `/api/hexbin` | GET | All players' pace vs shooting for density plot | Array of player objects |

---

## Technologies Used

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.8+ | Server-side language |
| Flask | 3.x | Web framework, routing, template rendering, JSON APIs |
| Pandas | 2.x | Data loading, filtering, groupby aggregation, pivot operations |
| NumPy | 2.x | Numerical support for data processing |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| D3.js | 7.x | Interactive data visualizations (circle packing, force graph, treemap, chord diagram, radar, area chart, strip plot) |
| Plotly.js | Latest | Declarative charts (bar charts, pie charts, radar/spider charts) |
| Bootstrap | 5.0 | Responsive layout, navigation, grid system |
| Slick Carousel | 1.9.0 | Home page chart carousel/slider |

### Data Visualization Techniques Used
| Technique | D3 Module | Visualization |
|-----------|-----------|---------------|
| Circle Packing | `d3.pack`, `d3.hierarchy` | Home page — Players by Nationality |
| Force Simulation | `d3.forceSimulation`, `d3.forceLink` | Player Relationship Network |
| Treemap | `d3.treemap`, `d3.hierarchy` | Club Quality Treemap |
| Stacked Area | `d3.stack`, `d3.area` | Position Distribution by Age |
| Chord Diagram | `d3.chord`, `d3.ribbon`, `d3.arc` | Position Versatility |
| Radial/Polar | `d3.lineRadial`, `d3.scaleLinear` | Continent Attribute Radar |
| Strip/Bee Swarm | `d3.scaleBand`, jittered scatter | Attribute Distribution |
| Brush Selection | `d3.brush` | Wage vs Overall Scatter |
| Drag Interaction | `d3.drag` | Network Graph |
| Zoom Transition | `d3.interpolateZoom`, `d3.transition` | Circle Packing, Treemap |

---

## Authors

- **Rachel Kerr** — Rachelaburime@gmail.com
- **Jagnoor Singh** — jagnoor@gmail.com
- **Christopher Pope** — popex107@umn.edu

---

## License

This project uses the FIFA 22 player dataset which is sourced from [SoFIFA.com](https://sofifa.com). The data is used for educational and non-commercial visualization purposes only. All player names, clubs, and attributes are property of EA Sports / Electronic Arts.
