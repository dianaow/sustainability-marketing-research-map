import React, { useState, useEffect } from "react"
import * as d3 from "d3"
import { Popup, Button, Dropdown } from "semantic-ui-react";

import Slider from "./components/Shared/slider/Slider"
import Header from "./components/Shared/Header"
import RadarChart from "./components/Main/RadarScatter"
import { TooltipContext } from "./components/Main/Tooltip";
import Legend from './components/Main/Legend'
import Table from "./components/Main/Table"
import { getPropertyName, cleanTopic, cleanCategory, onlyUnique }  from "./components/utils"

const MainPage = () => {

  const initialTooltipState = { show: false, info: {}}
  const initialSearchState = { isSelected: false, isLoading: false, isOpen: false, results: [], value: '' }
  const [tooltip, setTooltip] = useState(initialTooltipState)
  const [dataAll, setData] = useState({ data: [], bibliography: [], tooltipContent: {}, journals: [] });
  const [search, setSearch] = useState(initialSearchState)
  const [loading, setLoading] = useState(true);
  
  const changeThresholds = (lower, upper) => {
    data.forEach(d => {
      if(d.year >= lower && d.year <= upper) {
        d.opacity = 1
      } else {
        d.opacity = 0.1
      }
    })
    setData([...data])
  }

  const handleResultSelect = (e, { result }) => {
    setSearch({ 
      isLoading: false, 
      isSelected: true, 
      isOpen: false, 
      value: result.title,
      results: [result]
    })
  }

  const handleOnChange = (e, { value }) => {
    data.forEach(d => {
      if(value.indexOf(d.sourcetitle) !== -1) {
        d.opacity = 1
      } else {
        d.opacity = 0.1
      }
    })
    if(value.length === 0){
      data.forEach(d => d.opacity = 1)   
    }
    setData([...data])
  }

  const handleSearchChange = (e, { value }) => {
    setSearch({ isLoading: false, isSelected: false, isOpen: false, value })
    // setSearch({ isLoading: true, isSelected: false, isOpen: true, value })
    // setTimeout(() => {
    //   if (value.length < 1) {
    //     setSearch(initialSearchState)
    //   } else {
    //     const uniqIDs = data.filter(d=>d.label.toLowerCase().indexOf(value.toLowerCase()) !== -1).map(d => d.label).filter(onlyUnique) // unique unitIDs that are similar or same as search text
    //     const results = uniqIDs.map(d => {
    //       return {
    //         title: d
    //       }
    //     })
    //     setSearch({
    //       isLoading: false,
    //       isSelected: false, 
    //       isOpen: true,
    //       results
    //     })
    //   }
    // }, 300)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/data`);
        const result = await response.json();
        const { scores, papers, bibliography, tooltipContent } = result

        const keys = ['Cons_Self', 'Cons_Soc', 'Cons_Env', 'Busi_Prof', 'Busi_Soc', 'Busi_Env', 'Inst_Gro', 'Inst_Soc', 'Inst_Env']
        const data = scores.map(d => {
          return keys.map(key => {
            let result = getPropertyName(d, o => o[key]).split('_')
            return {
              unitID: d.Code,
              topic: cleanTopic(result[0]),
              category: cleanCategory(result[1]),
              value: d[key] === 1 ? d['SP'] : "" 
            }
          })
        }).flat().filter(d => d && d.category && d.topic && d.value !== "")

        const nested = d3.nest()
          .key(d => d.unitID)
          .key(d => d.topic)
          .key(d => d.category)
          .rollup(function(v) { return d3.mean(v, function(d) { return +d.value; }); })
          .entries(data)
    
        let aggData = []
        nested.forEach(a =>{
          const paper = papers.find(el => el.Code === a.key) || {}
          if(Object.keys(paper).length > 0) {
            a.values.forEach(b => {
              b.values.forEach(c => {
                if(c.value )
                aggData.push({
                  entity: a.key + '-' + b.key + '-' + c.key,
                  unitID: a.key,
                  topic: b.key,
                  category: c.key,
                  value: c.value,
                  count: +paper.citationCount || 1,
                  label: paper.Authors.replaceAll('|', ','),
                  authors: paper.Authors.replaceAll('|', ','),
                  abstract: paper.Abstract.replaceAll('|', ','),
                  title: paper.Title.replaceAll('|', ','),
                  url: paper.Link,
                  sourcetitle: paper['Source title'],
                  year: +paper.Year,
                  opacity: paper.sourceFile === 1 ? 1 : 0.6
                })
              })
            })
          }
        })
    
        const journalsToColor = d3.nest()
          .key(d => d.sourcetitle)
          .rollup(d => d.length)
          .entries(aggData)
          .sort(function(a,b) {return d3.descending(a.value,b.value);})
          .map(d => d.key)
          .slice(0, 8)
    
        aggData.forEach(d => {
          d.color = journalsToColor.indexOf(d.sourcetitle) !== -1 ? d.sourcetitle : 'Other journals'
        })

        setData({data: aggData, journals: journalsToColor.concat('Other journals'), bibliography, tooltipContent})

      } catch (error) {
        console.error("Error fetching data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  //const { isLoading, value, results } = search
  const { data, bibliography, tooltipContent, journals } = dataAll
  console.log(data, bibliography, tooltipContent, journals)

  const journalOptions = dataAll?.data?.map(d => d.sourcetitle).filter(onlyUnique).map(d => {
    return {
      key: d,
      text: d,
      value: d
    }
  }).sort(function(a,b) {return d3.ascending(a.key,b.key);})

  const searchResultsOptions = dataAll?.data?.sort((a, b) => a.label.trim() - b.label.trim()).map(d => d.label).filter(onlyUnique).map(d => {
    return {
      key: d,
      text: d,
      value: d
    }
  })

  return(
    <React.Fragment>
    <Header/>
    <div className="App__wrapper">
      {(loading && (!data || data.length === 0) && (!tooltipContent) && (!journals || journals.length === 0)) ? (
        <div className='App_container'><h1>Loading...</h1></div>
      ) : (
        <div className='App_container'>
          <div className ='SideBarLeft'>
            <div className="Title">
              <h1>The A-VO-S Map</h1>
            </div>
            <Slider 
              changeThresholds={changeThresholds} 
              active={true} 
              range={d3.extent(data.map(d => d.year))}
            /> 
            <div className="Search">
              {/* <Search
                icon="search"
                placeholder="SEARCH FOR A PAPER"
                size='large'
                fluid
                loading={isLoading}
                onResultSelect={handleResultSelect}
                onSearchChange={handleSearchChange}
                results={results}
                value={value} /> */}
              <h3>Search for a paper</h3>
              <Dropdown
                placeholder=''
                fluid
                search
                selection
                clearable
                options={searchResultsOptions}
                onChange={handleSearchChange}
              />
            </div>
            <div className="Search">
            <h3 style={{margin: '10px 0px', textAlign: 'left'}}>Filter by Journal</h3>
              <Dropdown
                placeholder=''
                fluid
                multiple
                search
                selection
                options={journalOptions}
                onChange={handleOnChange}
              />
            </div>
            {/* <Legend data={data.map(d => d.color).filter(onlyUnique).filter(d => d !== 'Other papers').sort()}/> */}
            <TooltipContext.Provider value={{ ...tooltip, setTooltip }}>
              <Table data={data} search={search} />
            </TooltipContext.Provider>
          </div>

          <div className ='Main'>
            <TooltipContext.Provider value={{ ...tooltip, setTooltip }}>
              <RadarChart 
                data={data} 
                search={search}
                journals={journals}
              />
              <div style={{position: 'absolute', bottom: '10px'}}>
                <div style={{display: "flex"}}>
                  {tooltipContent && Object.keys(tooltipContent).map((item) => (
                    <Popup
                      position='top center'
                      key={item}
                      header={item}
                      trigger={<Button>{item}</Button>}
                      style={{ minWidth: '500px' }}
                    >
                      {tooltipContent[item].map(d => <p>{d}</p>)}
                    </Popup>
                  ))}
                </div>
              </div>
            </TooltipContext.Provider>
            <div style={{position: 'absolute', top: '10px', right: '-50px'}}>
              <Legend data={journals}/>
            </div>
          </div>
        </div>
      )}
    </div>
      {(loading && (!bibliography || bibliography.length === 0)) ? (
        <div className="footer"></div>
      ) : (
        <div className="footer">
          {bibliography.map(text =><p>{text}</p>)}
        </div>
      )}
    </React.Fragment>
  )

}

export default MainPage
