import React, { useRef, useEffect, useContext, useState } from "react"
import * as d3 from "d3"

import Chart from "./Chart"
import Graph from "./Graph"
import Timeline from "./Timeline"
import Tooltip from "./NetworkTooltip";
import Legend from "./NetworkLegend"
import FilterPanel from "./FilterPanel"
import ZoomPanel from "./ZoomPanel"

import { TooltipProvider } from "./contexts/TooltipContext"
import { PanelProvider } from "./contexts/PanelContext"
import { ZoomProvider } from "./contexts/ZoomContext"

import { useChartDimensions }  from "./utils"

const Network = () => {

  const [ref, dms] = useChartDimensions()

  return(
    <div className="Network" ref={ref}>
      <TooltipProvider>
        <PanelProvider>
          <ZoomProvider>
            <Chart dimensions={dms}>
              <defs>
                <marker id="arrowheadTransparent" viewBox="-0 -5 10 10" refX="0" refY="0" orient="auto" markerWidth="7" markerHeight="10">
                  <path d="M 0,-5 L 10 ,0 L 0,5" fill="white" fillOpacity="0" stroke="none"></path>
                </marker>
              </defs>
              <defs>
                <marker id="arrowhead" viewBox="-0 -5 10 10" refX="0" refY="0" orient="auto" markerWidth="7" markerHeight="10">
                  <path d="M 0,-5 L 10 ,0 L 0,5" fill="white" fillOpacity="0.3" stroke="none"></path>
                </marker>
              </defs>
              <defs>
                <marker id="arrowheadOpaque" viewBox="-0 -5 10 10" refX="0" refY="0" orient="auto" markerWidth="7" markerHeight="10">
                  <path d="M 0,-5 L 10 ,0 L 0,5" fill="white" fillOpacity="1" stroke="none"></path>
                </marker>
              </defs>    
              <Graph />  
              <Timeline />
              <Tooltip />
            </Chart>
            <Legend />
            <FilterPanel />
            <ZoomPanel />
          </ZoomProvider>
        </PanelProvider>
      </TooltipProvider>
    </div>
  )
}

export default Network