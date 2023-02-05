import React, { useState, useEffect } from "react"
import scores from './data/scores.json';

import Header from "./components/Shared/Header"
import RadarChart from "./components/Main/RadarScatter"
import { TooltipContext } from "./components/Main/Tooltip";
import Legend from './components/Main/Legend'
import Table from "./components/Main/Table"
import { getPropertyName, cleanTopic, cleanCategory, cleanUnit }  from "./components/utils"

const MainPage = () => {

  const initialTooltipState = { show: false, info: {}, details: []}
  const [tooltip, setTooltip] = useState(initialTooltipState)
  const [data, setData] = useState([])

  useEffect(() => {
    const keys = Object.keys(scores[0])
    const data = scores.map(d => {
      return keys.map(key => {
        let result = getPropertyName(d, o => o[key])
        return {
          unitID: d.UnitID,
          coderID: d.CoderID,
          order: d.Order,
          unit: cleanUnit(result[0]),
          topic: cleanTopic(result.split('_')[1]),
          category: cleanCategory(result.split('_')[2]),
          value: d[result]
        }
      })
    }).flat().filter(d => d.category && d.topic && d.value !== "" && d.value !== '0')

    data.forEach(d => {
      d.entity = d.unit + '-' + d.topic + '-' + d.category + '-' + d.value
    })

    setData(data)
  }, [])

  return(
    <React.Fragment>
    <Header/>
    <div className="App__wrapper">
      <div className ='SideBarLeft'>
        <div className="Title">
        </div>
        <Legend />
        <TooltipContext.Provider value={{ ...tooltip, setTooltip }}>
          <Table />
        </TooltipContext.Provider>
      </div>

      <div className ='Main'>
        <TooltipContext.Provider value={{ ...tooltip, setTooltip }}>
          <RadarChart 
            data={data} 
          />
        </TooltipContext.Provider>
      </div>

    </div>
    </React.Fragment>
  )

}

export default MainPage
