import React, { useRef, useEffect, useContext, useState } from "react"

import Chart from "../Shared/Chart"
import Graph from "./Graph"
import Timeline from "./Timeline"
import Tooltip from "./Tooltip";
import Legend from "./Legend"
import FilterPanel from "./FilterPanel"
import ZoomPanel from "./ZoomPanel"

import { TooltipProvider } from "../contexts/TooltipContext"
import { PanelProvider } from "../contexts/PanelContext"
import { ZoomProvider } from "../contexts/ZoomContext"
import { SceneProvider } from "../contexts/SceneContext"

import { useChartDimensions }  from "../utils"

const Network = () => {

  const [ref, dms] = useChartDimensions()

  return(
    <div className="Network" ref={ref}>
      <TooltipProvider>
        <PanelProvider>
          <ZoomProvider>
            <Legend />
            <SceneProvider>
              <ZoomPanel />
              <FilterPanel />
              <Chart dimensions={dms}>
                <defs>
                  <marker id="arrowheadTransparent" viewBox="-0 -5 10 10" refX="0" refY="0" orient="auto" markerWidth="7" markerHeight="10">
                    <path d="M 0,-5 L 10 ,0 L 0,5" fill="white" fillOpacity="0" stroke="none"></path>
                  </marker>
                </defs>
                <defs>
                  <marker id="arrowhead" viewBox="-0 -5 10 10" refX="0" refY="0" orient="auto" markerWidth="7" markerHeight="10">
                    <path d="M 0,-5 L 10 ,0 L 0,5" fill="white" fillOpacity="0.5" stroke="none"></path>
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
            </SceneProvider>
          </ZoomProvider>
        </PanelProvider>
      </TooltipProvider>
    </div>
  )
}

export default Network