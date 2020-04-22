import React, { Component } from 'react'
import { Slider, Rail, Handles, Tracks, Ticks } from 'react-compound-slider'
import { SliderRail, Handle, Track, Tick } from './components' // example render components - source below

const sliderStyle = {
  position: 'relative',
  width: '100%',
}

const defaultValues = [0.7, 1]

class Example extends Component {
  state = {
    domain: [0, 1],
    values: defaultValues.slice(),
    update: defaultValues.slice(),
    reversed: false,
  }

  onUpdate = update => {
    let lowerLimit = update[0]*20
    let upperLimit = update[update.length-1]*20
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
      <div style={{ height: '60px', width: '80%', marginTop: '20px', opacity: this.props.active ? '1' : '0.5' }}>
       <p style={{margin: '10px 0px', textAlign: 'center'}}>OVERALL SCORE</p>
        <Slider
          step={0.05}
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
          <Ticks count={10}>
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
