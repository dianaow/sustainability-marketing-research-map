import React, { useState, useContext } from "react"
import * as d3 from "d3"

import timeline from '../../data/test_timeline.json';
import Axis from "../Shared/Axis"
import { NetworkContext } from "../../NetworkPage"
import { ChartContext } from "../Shared/Chart"
import { SceneContext } from "../contexts/SceneContext"

import { round } from "../utils"
import * as Consts from "../consts"

let data = processData(timeline)
data = data.filter(d=>d.type != 'predicted')

function processData(timeline) {

  const timeData = timeline.map((d,i) => {
    let rand = 0.75 + (Math.random()/10)*3
    return {
      date: d.key,
      node_id: Consts.ROOT_ID,
      key: Consts.parseDate(d.key), //convert string date to datetime format
      value: rand > 1 ? 1 : rand, // TEMPORARILY ASSIGN RANDOM SCORE
      type: d.key === Consts.currentDateString ? 'present' : (Consts.parseDate(d.key)> Consts.currentDate ? 'predicted' : 'past')
    }
  })
  return timeData

}

const Timeline = () => {

    // state for single vertical line representing marker to indicate hover position 
    //const [current, setCurrent] = useState({date: Consts.currentDate, score: Math.round(data.find(d=>d.type=='present').value * 100)/10})
    const { current, dispatch } = useContext(NetworkContext)
    const { dimensions } = useContext(ChartContext)
    const { sceneState } = useContext(SceneContext)

    const scaleTime1 = d3.scaleTime().domain([Consts.parseDate1("2015"), Consts.parseDate1("2021")])
    const years = scaleTime1.ticks(d3.timeYear.every(1))

    const scaleTime2 = d3.scaleTime().domain([Consts.parseDate2("Jan 2015"), Consts.parseDate2("Jan 2021")])
    const months = scaleTime2.ticks(d3.timeMonth.every(1))

    const { width, height } = dimensions
    const targetValue = width - 80
    const sliderPosX = 40
    const sliderPosY = height - 50
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

      const { date } = current
      const score = round(data.find(d=>d.key.getTime() === date.getTime()).value)
      const currentX = xTimeMonthlyScale(date) 
      d3.selectAll('.root-label-score').html(score) // update score in center of root node

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
      <g className='slider' transform={`translate(${sliderPosX}, ${sliderPosY})`} style={{ visibility: sceneState.scene === 0 ? 'visible' : 'hidden' }}>
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
              onMouseEnter={ () => dispatch({ type: 'SET_DATE', date: d.key }) }
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