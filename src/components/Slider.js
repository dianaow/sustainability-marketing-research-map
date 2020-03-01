import React, { Component } from "react"

import "./slider.css"

import { SCORE_THRESHOLD } from "./consts"

class Slider extends Component {

    state = {
      slots: 20,
      start: SCORE_THRESHOLD * 20,
      end: 1 * 20,
      labelMode: "mid",   // mid, long
    }
    
    onDragOver = (e) => {
      e.preventDefault();
    }
    
    onDragStart = (e) => {
      let slider  = e.target.dataset.slider;
      this.sliderType = slider;
    }
    
    onDrag = (e) => {
    }
    
    onDrop = (e, target) => {

      let source = this.sliderType;
      let slot = Number(e.target.dataset.slot);
      
      if (isNaN(slot)) return;
      
      if (source === "min") {
        if (slot >= this.state.end) return;
        let lowerLimit = slot
        let upperLimit = this.state.end
        this.props.changeThresholds(lowerLimit, upperLimit)
        this.setState({
          start: slot
        })
      } else if (source === "max") {
        if (slot <= this.state.start) return;
        let lowerLimit = this.state.start
        let upperLimit = slot
        this.props.changeThresholds(lowerLimit, upperLimit)
        this.setState({
          end: slot
        })
      }
      this.sliderType = null;

    }
    
    MinSlider=()=> {
      return (
        <div data-slider="min" 
            onDragStart={this.onDragStart} 
            onTouchStart={this.onDragStart}
            onDrag = {this.onDrag}
            draggable className="slider-thumb slider-thumb-min">
        </div>
      );
    }

    MaxSlider=()=> {
      return (
        <div data-slider="max" 
            onDragStart={this.onDragStart}  
            onTouchStart={this.onDragStart}
            onDrag={this.onDrag}
            draggable className="slider-thumb slider-thumb-max"></div>
      );
    }
   
    render() {
      let scale = [];
      let slider=[];
      let currentScale = [];
      let minThumb = null;
      let maxThumb = null
        
      for (let i = 0; i <= this.state.slots;i++) {
        let label = "";
        
        if (i === 0 || i === 10 || i === 20) {
          label = i / 20;
        }
        
        scale.push(
          <div 
            key={i} 
            className="slot-scale">
            {label}
          </div>
        );
      
        let currentLabel = "";
        
        if (i === this.state.start || i === this.state.end) {
          currentLabel = i / 20;
        }
        
        currentScale.push(
          <div 
            key={i} 
            className="slot-scale">
            {currentLabel}
          </div>
        );
        
        if (i === this.state.start) {
          minThumb = <this.MinSlider />
        } else if (i === this.state.end) {
          maxThumb = <this.MaxSlider />
        } else {
          minThumb = null;
          maxThumb = null;
        }
               
        let lineClass = "line";
        
        if (i > this.state.start && i < this.state.end) {
           lineClass += " line-selected";
        }

        slider.push(
          <div 
            data-slot={i}
            onDragOver={this.onDragOver} 
            onTouchMove = {this.onDragOver}
            onTouchEnd = {this.onDrop}
            onDrop = {this.onDrop}
            key={i} 
            className="slot">
              <div  data-slot={i} className={lineClass}/>
              <span className="scale-mark"></span>
              {minThumb}
              {maxThumb}
          </div>
        );
      }
     
      return (
        <div className="slider-container">
         
          <div className="slider-scale">
             {scale}
          </div>
    
          <div className="slider">
              {slider}
          </div>
         
          <div className="slider-selected-scale">
              {currentScale}
          </div>
         
        </div>
      );
    }
}

export default Slider