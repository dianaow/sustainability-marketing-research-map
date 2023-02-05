import React, { useState, useEffect } from "react"
import { Search } from "semantic-ui-react";
import scores from './data/scores.json';

import Header from "./components/Shared/Header"
import RadarChart from "./components/Main/RadarScatter"
import { TooltipContext } from "./components/Main/Tooltip";
import Legend from './components/Main/Legend'
import Table from "./components/Main/Table"
import { getPropertyName, cleanTopic, cleanCategory, cleanUnit, onlyUnique }  from "./components/utils"

const MainPage = () => {

  const initialTooltipState = { show: false, info: {}, details: []}
  const initialSearchState = { isSelected: false, isLoading: false, isOpen: false, results: [], value: '' }
  const [tooltip, setTooltip] = useState(initialTooltipState)
  const [data, setData] = useState([])
  const [search, setSearch] = useState(initialSearchState)

  const handleResultSelect = (e, { result }) => {
    setSearch({ 
      isLoading: false, 
      isSelected: true, 
      isOpen: false, 
      value: result.title,
      results: [result]
    })
  }

  const handleSearchChange = (e, { value }) => {
    setSearch({ isLoading: true, isSelected: false, isOpen: true, value })
    setTimeout(() => {
      if (value.length < 1) {
        setSearch(initialSearchState)
      } else {
        const uniqIDs = data.filter(d=>d.unitID.indexOf(value) !== -1).map(d => d.unitID).filter(onlyUnique) // unique unitIDs that are similar or same as search text
        const results = uniqIDs.map(d => {
          return {
            title: d
          }
        })
        setSearch({
          isLoading: false,
          isSelected: false, 
          isOpen: true,
          results
        })
      }
    }, 300)
  }

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
          value: d[result], 
          //mentioned: (result.slice(1) === 'Act_Cons' || result.slice(1) === 'Act_Busi' || result.slice(1) === 'Act_Inst') ? 1 : 0
        }
      })
    }).flat().filter(d => d.category && d.topic && d.value !== "")

    data.forEach(d => {
      d.entity = d.unit + '-' + d.topic + '-' + d.category + '-' + d.value
    })
    console.log(data)
    setData(data)
  }, [])

  const { isSelected, isLoading, value, results } = search

  return(
    <React.Fragment>
    <Header/>
    <div className="App__wrapper">
      <div className ='SideBarLeft'>
        <div className="Title">
          <h1>SUSTAINABILITY MARKETING RESEARCH MAP</h1>
        </div>
        <div className="Search">
          <Search
            icon="search"
            placeholder="SEARCH FOR A PAPER"
            size='large'
            fluid
            loading={isLoading}
            onResultSelect={handleResultSelect}
            onSearchChange={handleSearchChange}
            results={results}
            value={value} />
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
            search={search}
          />
        </TooltipContext.Provider>
      </div>

    </div>
    </React.Fragment>
  )

}

export default MainPage
