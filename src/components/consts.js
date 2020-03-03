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

// set node, link, text color and dimensions
export const rootRadius = 35
export const nodeRadius = 40
export const nodeStrokeWidth = 2
export const nodeStroke = 'white'
export const nodeFill = '#011C54'
export const nodeOpacity = 1
export const nodeTextFill = 'white'
export const nodeTextOpacity = 0.5
export const childnodeTextOpacity = 0
export const nodeTextSize = 8

export const linkStrokeWidth = 0.6
export const linkStroke = 'white'
export const linkOpacity = 0.5
export const linkTextFill = 'white'
export const linkTextOpacity = 0
export const linkTextSize = 8
export const transitionDuration = 2000

export const linkedByIndex = {}

export const formatYear = d3.timeFormat("%Y")
export const formatDate = d3.timeFormat("%b %Y")
export const parseDate = d3.timeParse("%Y-%m-%d")
export const parseDate1 = d3.timeParse("%Y")
export const parseDate2 = d3.timeParse("%b %Y")
export const parseDate3 = d3.timeParse("%d-%b-%Y")
export const currentDateString = '2020-02-01'
export const currentDate = parseDate(currentDateString)

export const ROOT_ID = 80114141
