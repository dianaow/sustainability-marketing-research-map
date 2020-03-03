import React, { useState, useContext } from "react"
import * as d3 from "d3"
import Axis from "./Axis"
import * as Consts from "./consts"
import { MyContext } from "../NetworkPage"
import { round } from "./utils"

const Timeline = ({data, dimensions}) => {

    // state for single vertical line representing marker to indicate hover position 
    //const [current, setCurrent] = useState({date: Consts.currentDate, score: Math.round(data.find(d=>d.type=='present').value * 100)/10})
    const { current, dispatch } = useContext(MyContext)

    const scaleTime1 = d3.scaleTime().domain([Consts.parseDate1("2015"), Consts.parseDate1("2021")])
    const years = scaleTime1.ticks(d3.timeYear.every(1))

    const scaleTime2 = d3.scaleTime().domain([Consts.parseDate2("Jan 2015"), Consts.parseDate2("Jan 2021")])
    const months = scaleTime2.ticks(d3.timeMonth.every(1))

    const { width, height } = dimensions
    const targetValue = width - 80
    const sliderPosX = 40
    const sliderPosY = height - 45
    const sliderHeight = 60

    const xTimeScale = d3.scaleTime()
        .domain([years[0], years[years.length-1]])
        .range([0, targetValue])

    const xTimeMonthlyScale = d3.scaleTime()
        .domain([months[0], months[months.length-1]])
        .range([0, targetValue])

    const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([sliderHeight, 0])

    const line = d3.line()
        .x(function(d) { return xTimeScale(d.key) }) 
        .y(function(d) { return yScale(d.value); });
 
    const marker = (current) => {

      const { date, score } = current
      const currentX = xTimeMonthlyScale(date) 
        
      return(
        <g className='marker' transform={`translate(0, ${sliderHeight})`}>
          <rect 
            className='handle'
            width='2'
            height={sliderHeight+30}
            x={currentX}
            y={-sliderHeight-30}
            strokeWidth='0'
          />
          <text
            className='label'
            x={currentX+10}
            y={-sliderHeight-20}
            textAnchor='left'
            fontSize='12px'
          >
            { "Score: " + score }
          </text>
          <text
            className='label_2'
            x={currentX+10}
            y={-sliderHeight-8}
            textAnchor='left'
            fontSize='11px'
          >
            { Consts.formatDate(date) }
          </text>  
        </g>
      )

    }

    return(
      <g className='slider' transform={`translate(${sliderPosX}, ${sliderPosY})`}>
        <g className='line-group' transform={`translate(0, ${-sliderHeight})`}>
          <rect 
            width={targetValue}
            height={sliderHeight}
            fill={Consts.nodeFill}
            fillOpacity='0.6'
          />
          {[data].map(d=>(
            <path 
              className='line'
              d={line(d)}
              stroke='white'
              strokeWidth='2'
              fill='none' 
            />
          ))}
          {data.map(d=>(
            <line 
              className='line-hover'
              x1={xTimeScale(d.key)}
              y1={sliderHeight}
              x2={xTimeScale(d.key)}
              y2={yScale(d.value)}
              fill='none'
              stroke='white'
              strokeWidth='2'
              strokeOpacity='0'
              pointerEvents='all'
              onMouseEnter={ () => dispatch({ type: 'SET_DATE', date: d.key, score: round(d.value) }) }
            />
          ))}
          <Axis
            dimension='x'
            dimensions={{'boundedWidth': targetValue, 'boundedHeight': sliderHeight}}
            scale={xTimeScale}
            formatTick={Consts.formatYear}
          />
          <Axis
            dimension='y'
            dimensions={{'boundedWidth': 0, 'boundedHeight': sliderHeight}}
            scale={yScale}
          />
          { marker(current) }
        </g>
      </g>
    )
}

export default Timeline