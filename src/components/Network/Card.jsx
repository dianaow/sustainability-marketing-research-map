import React from "react"

import photo from '../../images/najib_razak.jpg';
import { calculateAspectRatioFit } from "../utils"

import "./card.css"

const displayImage = (data) => {
  let ratio
  let img = new Image();
  img.src = photo
  img.onload = function() {
    ratio = calculateAspectRatioFit(img.width, img.height, 80, 120) 
    return(
      <div className='image'>
        <svg>
          <image
            xlinkHref={photo}
            x='4'
            y='4'
            width='80'
            opacity='1'
          />
          <rect
            stroke='white'
            strokeWidth='2px'
            x='4'
            y='4'
            width={ratio.width}
            height={ratio.height}
          />
        </svg>
      </div>
    )
  }
}

const Card = ({data}) => {

  return(
    <div className="Card">
      <div className='card-title'>
        <div className='card-title-name'>{data.name}</div>
      </div>

      <div className='Card__section card-info'>
        <div className='header'><p>GENERAL INFORMATION</p></div>
        <div className='Card__content'>
          <div className='list'>
            <div className="row">
              <div className="cell cell-20">
                <div className="value">Name</div>
              </div>
              <div className="cell cell-80">
                <div className="value">{data.full_name}</div>
              </div>
            </div> 
            <div className="row">
              <div className="cell cell-20">
                <div className="value">Entity ID</div>
              </div>
              <div className="cell cell-80">
                <div className="value">{data.entity}</div>
              </div>
            </div> 
            <div className="row">
              <div className="cell cell-20">
                <div className="value">DOB</div>
              </div>
              <div className="cell cell-80">
                <div className="value">{data.dob}</div>
              </div>
            </div>  
            <div className="row">
              <div className="cell cell-20">
                <div className="value">Country</div>
              </div>
              <div className="cell cell-80">
                <div className="value">{data.nationality}</div>
              </div>
            </div> 
          </div>
          {displayImage(data.image)}
        </div>
      </div>

      <div className='Card__section card-notes'>
        <div className='header'><p>SANCTIONS & WATCH LISTS</p></div>
        <div className="table-row-header">
          <div className="cell cell-50">
            <div className="value">Name</div>
          </div>
          <div className="cell cell-20">
            <div className="value">Start Date</div>
          </div>
          <div className="cell cell-20">
            <div className="value">End Date</div>
          </div>
        </div>
        <div className='table-row-contents'>
          {data.key_lists.map((d,i)=>(
            <div className="row">
              <div className="cell cell-50">
                <div className="value">{d.title}</div>
              </div>
              <div className="cell cell-20">
                <div className="value">{d.start_time}</div>
              </div>
              <div className="cell cell-20">
                <div className="value">{d.end_time}</div>
              </div>
            </div>  
          ))}
        </div>
      </div>   

      <div className='Card__section card-key-positions'>
        <div className='header'><p>KEY POSITIONS</p></div>
        <div className="table-row-header">
          <div className="cell cell-60">
            <div className="value">Title</div>
          </div>
          <div className="cell cell-15">
            <div className="value">Start Date</div>
          </div>
          <div className="cell cell-15">
            <div className="value">End Date</div>
          </div>
        </div>
        <div className='table-row-contents'>
          {data.key_positions.map((d,i)=>(
            <div className="row">
              <div className="cell cell-60">
                <div className="value">{d.title}</div>
              </div>
              <div className="cell cell-15">
                <div className="value">{d.start_time}</div>
              </div>
              <div className="cell cell-15">
                <div className="value">{d.end_time}</div>
              </div>
            </div> 
          ))}
        </div>
      </div>  

      <div className='Card__section card-events'>
        <div className='header'><p>Events</p></div>
      <div className="table-row-header">
        <div className="cell cell-50">
          <div className="value">Type</div>
        </div>
        <div className="cell cell-50">
          <div className="value">Description</div>
        </div>
        <div className="cell cell-20">
          <div className="value">Date</div>
        </div>
      </div>
      <div className='table-row-contents'>
        {data.events.map((d,i)=>(
          <div className="row">
            <div className="cell cell-50">
              <div className="value">{d.type}</div>
            </div>
            <div className="cell cell-50">
              <div className="value">{d.description}</div>
            </div>
            <div className="cell cell-20">
              <div className="value">{d.date}</div>
            </div>
          </div>  
        ))}
      </div>
      </div>   
    </div>
  )
}

export default Card
