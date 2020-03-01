import * as d3 from 'd3'

export const categories = ['Total Attacking', 'Total Skill', 'Total Movement', 'Total Power', 'Total Mentality', 'Total Defending']
export const region = ['Europe & Central Asia', 'Latin America & Caribbean', 'Middle East & North Africa', 'North America', 'Sub-Saharan Africa', 'East Asia & Pacific']
export const SCORE_THRESHOLD = 0.7
export const NODE_SIZE = 3
export const LEVELS = 5
export const LOWER = 0
export const UPPER = 1

export const colorScale = d3.scaleOrdinal()
  .range(['aqua', 'fuchsia', 'gold', 'white', 'white', 'white'])
  .domain(region)

export const fillScale = d3.scaleOrdinal()
  .range(['aqua', 'fuchsia', 'gold', 'white', 'transparent', 'transparent'])
  .domain(region)

export const fociRadius = d3.scaleSqrt()
    .range([3, 10])
    .domain([SCORE_THRESHOLD, UPPER])

export const bufferInRad = 10 * (Math.PI / 180)

export const angleSlice = (Math.PI * 2) / categories.length