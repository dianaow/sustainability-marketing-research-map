import React from "react"
import { region, colorScale } from "./consts"

const NetworkLegend = ({size}) => {
  return(
    <div className="Chart_legend_section">
      <p>LEGEND</p>  
      <div className='legend'>
        {drawShapeLegend()}
        {drawRadiusLegend(size)}
      </div>
      {drawCategoryLegend()}
    </div>
  )
}

const drawCategoryLegend = () => {
  return(
    <div className='legend-color'>
      <svg width='100%' height='100px'>
        <g className='legend__category' transform="translate(0,20)">
          <text className='legend-header'>COUNTRY</text>
          {region.map((d,i) => (
            <g className='legend__colorEle'>
              <circle 
                cx='15'
                cy={15 + i*15}
                r='5'
                fill={colorScale(d)}
                stroke={colorScale(d)}/>
              <text
                className='legend-content-text'
                x='30'
                y={15 + i*15}>
                {d}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}


const drawRadiusLegend = (size) => {
  const valuesToShow = [1, 10, 30]
  return(
    <svg width='100%' height='100px'>
      <g className='legend__radius' transform="translate(0,20)">
        <text className='legend-header'>AMOUNT OF CONNECTIONS</text>
        {[1, 10, 30].map((d,i) => (
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
      <g className='legend__category' transform="translate(0,20)">
        <text className='legend-header'>Person</text>
        <text className='legend-header' x={100-size}>Organization</text>
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
          '1st degree'
        </text>
        <rect
          x='100' 
          y={15-size} 
          width={size*2}
          height={size*2}
          fill='none'
          stroke='white'/>
        <text
          className='legend-content-text'
          x={100+size+15} 
          y='15' 
          fill='white'>
          '1st degree'
        </text>
        <circle 
          cx={15-size} 
          cy='30' 
          r={size}
          fill='none'
          stroke='white'/>
        <text
          className='legend-content-text'
          x='30' 
          y='30' 
          fill='white'>
          '2nd degree'
        </text>
        <rect
          x='100' 
          y={30-size} 
          width={size*2}
          height={size*2}
          fill='white'
          stroke='white'/>
        <text
          className='legend-content-text'
          x={100+size+15} 
          y='30' 
          fill='white'>
          '2nd degree'
        </text>
      </g>
    </svg>  
  )
}

export default NetworkLegend