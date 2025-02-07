import React, { Component } from 'react'
import { Slider, Rail, Handles, Tracks, Ticks } from 'react-compound-slider'
import { SliderRail, Handle, Track, Tick } from './components' // example render components - source below

const sliderStyle = {
  position: 'relative',
  width: '100%',
} 

class Example extends Component {
  constructor(props) {
    super(props);
    
    const domain = props.range || [2010, 2024]; // Fallback to default range

    this.state = {
      domain,
      values: domain.slice(), // Set default values to the full range
      update: domain.slice(),
      reversed: false,
    };
  }

  onUpdate = update => {
    let lowerLimit = update[0]
    let upperLimit = update[update.length-1]
    this.setState({ update })
    this.props.changeThresholds(lowerLimit, upperLimit)
  }

  toggleReverse = () => {
    this.setState(prev => ({ reversed: !prev.reversed }))
  }

  render() {
    const {
      state: { domain, values, update, reversed },
    } = this

    return (
      <div style={{ height: '120px', width: '100%', marginTop: '0px', opacity: this.props.active ? '1' : '0.5' }}>
       <h3 style={{margin: '0px 0px 20px 0px', textAlign: 'left'}}>Filter by Year</h3>
        <Slider
          step={1}
          domain={domain}
          reversed={reversed}
          rootStyle={sliderStyle}
          onUpdate={this.onUpdate}
          values={values}
          disabled={this.props.active ? false: true}
        >
          <Rail>
            {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
          </Rail>
          <Handles>
            {({ handles, getHandleProps }) => (
              <div className="slider-handles">
                {handles.map(handle => (
                  <Handle
                    key={handle.id}
                    handle={handle}
                    domain={domain}
                    getHandleProps={getHandleProps}
                  />
                ))}
              </div>
            )}
          </Handles>
          <Tracks left={false} right={false}>
            {({ tracks, getTrackProps }) => (
              <div className="slider-tracks">
                {tracks.map(({ id, source, target }) => (
                  <Track
                    key={id}
                    source={source}
                    target={target}
                    getTrackProps={getTrackProps}
                  />
                ))}
              </div>
            )}
          </Tracks>
          <Ticks count={8}>
            {({ ticks }) => (
              <div className="slider-ticks">
                {ticks.map(tick => (
                  <Tick key={tick.id} tick={tick} count={ticks.length} />
                ))}
              </div>
            )}
          </Ticks>
        </Slider>
      </div>
    )
  }
}

export default Example
