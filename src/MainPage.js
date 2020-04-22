import React, { useState, useEffect } from "react"
import { Search } from "semantic-ui-react";
import { Link } from "react-router-dom";
import * as d3 from "d3"

import icon from "./images/icons/manager.png"
import scores from './data/soccer_player_scores1.json';
import paths from './data/output1.json';

import Header from "./components/Shared/Header"
import Slider from "./components/Shared/slider/Slider"
import RadarChart from "./components/Main/RadarScatter"
import Tooltip, { TooltipContext } from "./components/Main/Tooltip";
import Table from "./components/Main/Table"
import DistributionChart from "./components/Main/Distribution"
import Legend from './components/Main/Legend'

import { persona, categories, SCORE_THRESHOLD } from "./components/consts"

const images = require.context('./images/Pictures', true);
const faker = require('faker');

const MainPage = () => {

  const getData = (data, filter) => {
    let players = processData(data, filter.lowerLimit/20, filter.upperLimit/20)
    return{
      players: players, 
      playersMax: findmaxData(players), 
      paths: paths
    }
  }

  const initialTooltipState = { show: false, info: {entity: 0, name: "", club: "", category: "", score: "", photo: ""}, links: [], details: {} }
  const initialSearchState = { isSelected: false, isLoading: false, isOpen: false, results: [], value: '' }
  const [filter, setFilter] = useState({ lowerLimit: SCORE_THRESHOLD*20, upperLimit: 1*20 })
  const [tooltip, setTooltip] = useState(initialTooltipState)
  const [panelState, setPanelState] = useState({ entity: false, binned: true })
  const [initRender, setInitRender] = useState(true)
  const [data, setData] = useState(getData(scores, filter))
  const [search, setSearch] = useState(initialSearchState)

  const changeThresholds = (lower, upper) => {
    setFilter({
      lowerLimit: lower,
      upperLimit: upper
    })
  }

  useEffect(() => {
    setData(getData(scores, filter))
  }, [filter])

  const handleResultSelect = (e, { result }) => {
    setPanelState({ entity: true, binned: false })
    setTooltip({
      show: true,
      info: {entity: result.entity, name: result.name, club: result.club, category: result.category, score: result.overall, photo: result.photo},
      links: [],
      details: data.players.filter(d=>d.name.indexOf(result.name) !== -1) 
    })
    setSearch({ isLoading: false, isSelected: true, isOpen: false, value: result.name })
  }

  const handleSearchChange = (e, { value }) => {
    setSearch({ isLoading: true, isSelected: false, isOpen: true, value })
    setTimeout(() => {
      if (value.length < 1) {
        setTooltip(initialTooltipState)
        setSearch(initialSearchState)
      } else {
        setSearch({
          isLoading: false,
          isSelected: false, 
          isOpen: true,
          results: data.playersMax.filter(d=>d.name.indexOf(value) !== -1)
        })
      }
    }, 300)
  }

  const checkActiveBtn = (name) => {
    let activeFilter = Object.keys(panelState).filter(id=>panelState[id])
    return (activeFilter.indexOf(name) != -1) ? "btn active" : "btn";
  }

  const showToggleButtons = (active) => {
    return(
      <div className='ToggleButtons' style={{ opacity: active ? '1' : '0.5' }}>
        <input name="color_scale" 
           type="button" 
           className={checkActiveBtn('entity')}
           onClick={() => {
            setPanelState({ entity: true, binned: false })
            setInitRender(false)
           }}
           value="Entity View"
           disabled={active ? false : true} />
        <input name="color_scale" 
           type="button"
           className={checkActiveBtn('binned')} 
           onClick={() => {
            setPanelState({ entity: false, binned: true })
            setInitRender(false)
           }}
           value="Binned View"
           disabled={active ? false : true} />
      </div>
    )
  }

  const config = {lowerLimit: filter.lowerLimit/20, upperLimit: filter.upperLimit/20, panelState, initRender}
  const { isSelected, isLoading, value, results } = search

  return(
    <React.Fragment>
    <Header/>
    <div className="App__wrapper">
      <div className ='SideBarLeft'>
        <div className="Title">
          <h1>FIFA 19</h1>
          <p>Detailed attributes for every player registered in football simulation video game 'FIFA 19' is made available on the website https://sofifa.com</p>
          <p>Players are scored according to 6 categories representing their abilities. An overall score is formulated for each player based on these category scores amongst other parameters.</p>
        </div>
        <div className="Search">
          <Search
            icon="search"
            placeholder="SEARCH FOR A PLAYER"
            size='large'
            fluid
            loading={isLoading}
            onResultSelect={handleResultSelect}
            onSearchChange={handleSearchChange}
            results={results}
            value={value} />
        </div>
        <TooltipContext.Provider value={{ ...tooltip, setTooltip }}>
          <Table binned={panelState.binned} />
        </TooltipContext.Provider>
        <Legend />
      </div>

      <div className ='Main'>
        { (tooltip.show === false) ?  <Slider changeThresholds={changeThresholds} active={true} /> : <Slider changeThresholds={changeThresholds} active={false} /> }
        { (tooltip.show === false) ?  showToggleButtons(true) : showToggleButtons(false) }
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
        <p>Probability density of all  18207 entities at different <b>CATEGORY SCORES</b>, smoothed by a kernel density estimator</p>
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
          photo: player['url'],
          club: player['Club'],
          name: player['Name']
        })
      }
    })
  })

  players.sort(function(a, b){  
    return persona.indexOf(a.category) - persona.indexOf(b.category);
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
      let url
      try {
        url = images(player['photo']) 
      }
      catch (err) {
        url = icon
      }
      return {
        entity: player['entity'],
        axis: player['axis'],  // find the sub-score category that has the largest value
        value: max,   
        overall: player['overall'],
        category: player['category'],
        country: player['country'],
        photo: url,
        club: player['club'],
        name: player['name'],
        title: player['name']          
      }
    })
    .entries(data)

  return dataMax.map(d=>d.value)

}