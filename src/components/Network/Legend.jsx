import React, { useContext } from "react"

import { PanelContext } from "../contexts/PanelContext"
import Legend from "../Main/Legend"

import { round }  from "../utils"
import * as Consts from "../consts"

const NetworkLegend = () => {

  const { nodeRadiusScale, colorScale, scoreScale } = Consts.scales
  const { panelState } = useContext(PanelContext)
  const bool = panelState.country

  return(
    <div className="Chart_legend_section">
      <p>LEGEND</p>  
      <div className='legend'>
        {drawShapeLegend()}
        {drawRadiusLegend(nodeRadiusScale)}
      </div>
      { bool ? drawCategoryLegend(colorScale) : drawScoreLegend(scoreScale) }
    </div>
  )

}

const drawCategoryLegend = (colorScale) => {
  return(
    <Legend />
  )
}

const drawScoreLegend = (colorScale) => {

  const gridSize = 15
  const legendElementWidth = gridSize * 1.5
  const data = [0, 0.2, 0.4, 0.6, 0.8, 1]

  return(
    <div className='legend-color'>
      <svg width='100%' height={legendElementWidth*3}>
        <g className='legend__score' transform="translate(0,20)">
          <text className='legend-header' x={data.length / 2} y='10'>OVERALL SCORE</text>
          {data.map((d,i) => (
            <g className='legend__colorEle'>
              <rect
                x={legendElementWidth * i}
                y={legendElementWidth}
                width={legendElementWidth}
                height={legendElementWidth / 2}
                fill={colorScale(d)}/>
              <text
                className='legend-content-text'
                x={(legendElementWidth * i) + (legendElementWidth / 2)}
                y={legendElementWidth * 2}>
                { round(d) }
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}

const drawRadiusLegend = (size) => {
  return(
    <svg width='100%' height='100px'>
      <g className='legend__radius' transform="translate(0,10)">
        <text className='legend-header'>Amount of connections</text>
        {[2, 10, 30].map((d,i) => (
          <g className='legend__colorEle'>
            <circle 
              cx='45'
              cy={80 - size(d)}
              r={size(d)}
              fill='none'
              stroke='white' />
          </g>
        ))}
      </g>
    </svg>  
  )
}

const drawShapeLegend = () => {
  const size = 5
  return(
    <svg width='100%' height='60px'>
      <g className='legend__category' transform="translate(0,10)">
        <circle 
          cx={15-size} 
          cy='15' 
          r={size}
          fill='none'
          stroke='white'/>
        <text
          className='legend-content-text'
          x='30' 
          y='15' 
          fill='white'>
          1st degree
        </text>
        <circle 
          cx={15-size} 
          cy='30' 
          r={size}
          fill='white'
          stroke='none'/>
        <text
          className='legend-content-text'
          x='30' 
          y='30' 
          fill='white'>
          2nd degree
        </text>
      </g>
    </svg>  
  )
}

// const drawShapeLegend = () => {
//   const size = 5
//   return(
//     <svg width='100%' height='60px'>
//       <g className='legend__category' transform="translate(0,20)">
//         <text className='legend-header'>Person</text>
//         <text className='legend-header' x={100-size}>Organization</text>
//         <circle 
//           cx={15-size} 
//           cy='15' 
//           r={size}
//           fill='none'
//           stroke='white'/>
//         <text
//           className='legend-content-text'
//           x='30' 
//           y='15' 
//           fill='white'>
//           1st degree
//         </text>
//         <rect
//           x='100' 
//           y={15-size} 
//           width={size*2}
//           height={size*2}
//           fill='none'
//           stroke='white'/>
//         <text
//           className='legend-content-text'
//           x={100+size+15} 
//           y='15' 
//           fill='white'>
//           1st degree
//         </text>
//         <circle 
//           cx={15-size} 
//           cy='30' 
//           r={size}
//           fill='white'
//           stroke='none'/>
//         <text
//           className='legend-content-text'
//           x='30' 
//           y='30' 
//           fill='white'>
//           2nd degree
//         </text>
//         <rect
//           x='100' 
//           y={30-size} 
//           width={size*2}
//           height={size*2}
//           fill='white'
//           stroke='white'/>
//         <text
//           className='legend-content-text'
//           x={100+size+15} 
//           y='30' 
//           fill='white'>
//           2nd degree
//         </text>
//       </g>
//     </svg>  
//   )
// }

export default NetworkLegend