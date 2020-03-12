import React, { useState, useEffect } from "react"
import { Search } from "semantic-ui-react";
import { Link } from "react-router-dom";
import * as d3 from "d3"

import icon from "./images/icons/manager.png"
import scores from './data/dummy_fraud_scores.json';
import paths from './data/output1.json';

import Header from "./components/Shared/Header"
import Slider from "./components/Main/Slider"
import RadarChart from "./components/Main/RadarScatter"
import Tooltip, { TooltipContext } from "./components/Main/Tooltip";
import Table from "./components/Main/Table"
import DistributionChart from "./components/Main/Distribution"
import Legend from './components/Main/Legend'

import { region, categories, SCORE_THRESHOLD } from "./components/consts"

const MainPage = () => {

  const getData = (data, filter) => {
    let players = processData(data, filter.lowerLimit/20, filter.upperLimit/20)
    return{
      players: players, 
      playersMax: findmaxData(players), 
      paths: paths
    }
  }

  var toBin = true
  const initialTooltipState = { show: false, info: {entity: 0, name: "", club: "", category: "", score: "", photo: ""}, links: [], details: {} }
  const initialSearchState = { isSelected: false, isLoading: false, results: [], value: '' }
  const [filter, setFilter] = useState({ lowerLimit: SCORE_THRESHOLD*20, upperLimit: 1*20 })
  const [tooltip, setTooltip] = useState(initialTooltipState)
  const [binned, setBinned] = useState(toBin)
  const [initRender, setInitRender] = useState(true)
  const [data, setData] = useState(getData(scores, filter))
  const [search, setSearch] = useState(initialSearchState)

  const changeThresholds = (lower, upper) => {
    setFilter({
      lowerLimit: lower,
      upperLimit: upper
    })
  }

  function toggleBin(binned) {
    toBin = !binned
    setBinned(toBin)
    setInitRender(false)
  }

  useEffect(() => {
    setData(getData(scores, filter))
  }, [filter])

  const handleResultSelect = (e, { result }) => {
    toBin = false
    setBinned(toBin) 
    setTooltip({
      show: true,
      info: {entity: result.entity, name: result.name, club: result.club, category: result.category, score: result.overall, photo: result.photo},
      links: [],
      details: data.players.filter(d=>d.name.indexOf(result.name) !== -1) 
    })
    setSearch({ isLoading: false, isSelected: true, value: result.name })
  }

  const handleSearchChange = (e, { value }) => {
    setSearch({ isLoading: true, isSelected: false, value })
    setTimeout(() => {
      if (value.length < 1) {
        setTooltip(initialTooltipState)
        setSearch(initialSearchState)
      }
      setSearch({
        isLoading: false,
        isSelected: false, 
        results: data.playersMax.filter(d=>d.name.indexOf(value) !== -1)
      })
    }, 300)
  }

  const showNavButtons = () => {
    return(
      <div className='NavButtons'>
      <Link to='/network'>
        <input name="nav" 
          type="button" 
          className='btn-large nav_1'
          value="See Network"/>
        </Link>
        <input name="nav" 
          type="button" 
          className="btn-large nav_2"
          value="See Events"/>
      </div>
    )
  }

  const buttonLabel = binned===true ? "Show entity view" : 'Show binned view'
  const config = {lowerLimit: filter.lowerLimit/20, upperLimit: filter.upperLimit/20, toBin: binned, initRender : initRender}
  const { isSelected, isLoading, value, results } = search

  return(
    <React.Fragment>
    <Header/>
    <div className="App__wrapper">
      <div className ='SideBarLeft'>
        <div className="Title">
          <h1>RISK 360</h1>
        </div>
        <div className="Search">
          <Search
            icon="search"
            placeholder="SEARCH FOR AN ENTITY"
            size='large'
            fluid
            loading={isLoading}
            onResultSelect={handleResultSelect}
            onSearchChange={handleSearchChange}
            results={results}
            value={value} />
          <div className="NavButtons">
            { isSelected && showNavButtons()}
          </div>
        </div>
        <TooltipContext.Provider value={{ ...tooltip, setTooltip }}>
          <Table />
        </TooltipContext.Provider>
        <Legend />
      </div>

      <div className ='Main'>
        <Slider changeThresholds={changeThresholds} />
        <h4 className='viewButton' onClick={()=>toggleBin(binned)}>{buttonLabel}</h4>
        <TooltipContext.Provider value={{ ...tooltip, setTooltip }}>
          <RadarChart 
            data={data} 
            config={config}
            filter={filter}
            search={search}
          />
        </TooltipContext.Provider>
      </div>

      <div className ='SideBarRight'>
        <p>Probability density of all  18207 players at different <b>CATEGORY SCORES</b>, smoothed by a kernel density estimator</p>
        <DistributionChart data={data.paths} singleData={tooltip}/>
      </div>
    </div>
    </React.Fragment>
  )

}

export default MainPage

function processData(data, lowerLimit, upperLimit) {

  // Create data object of all players and their scores across all sub-score categories, only if their overall score excees a threshold
  var players = []
  data.forEach((player,I) => { //loop through all players
    categories.forEach((cat,i) => { //loop through all sub-score categories
      if(+player['Overall']>=lowerLimit & +player['Overall']<=upperLimit){
        players.push({
          entity: player['ID'],
          axis_category: cat,
          axis : i,
          value : +player[cat],
          overall: +player['Overall'],
          category: player['Region'],
          country: player['Nationality'],
          photo: icon,
          //photo: player['Photo'],
          //photo: "./data/images/" + player['ID'] + '.jpg',
          club: 'Organization ' + player['Club'],
          name: player['ID'] === 20801 ? 'John Doe' : 'Entity ' + player['ID']
        })
      }
    })
  })

  players.sort(function(a, b){  
    return region.indexOf(a.category) - region.indexOf(b.category);
  });

  return players

}

function findmaxData(data) {

  // Filter data object to only include top score amongst the sub-score categories
  var dataMax = d3.nest()
    .key(function(d) { return d.entity })
    .rollup(function(v) { 
      let max = d3.max(v, function(d) { return d.value; })
      let rows = v.filter(d=>d.value===max)
      let player = rows[0]
      return {
        entity: player['entity'],
        axis: player['axis'],  // find the sub-score category that has the largest value
        value: max,   
        overall: player['overall'],
        category: player['category'],
        country: player['country'],
        photo: player['photo'],
        club: player['club'],
        name: player['name'],
        title: player['name']          
      }
    })
    .entries(data)

  return dataMax.map(d=>d.value)

}