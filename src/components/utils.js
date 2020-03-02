import PropTypes from 'prop-types'
import { useEffect, useState, useRef } from "react"
import ResizeObserver from "resize-observer-polyfill"
import * as d3 from 'd3'

export const accessorPropsType = (
  PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.number,
  ])
)

export const callAccessor = (accessor, d, i) => (
  typeof accessor === "function" ? accessor(d, i) : accessor
)

export const dimensionsPropsType = (
  PropTypes.shape({
    height: PropTypes.number,
    width: PropTypes.number,
    marginTop: PropTypes.number,
    marginRight: PropTypes.number,
    marginBottom: PropTypes.number,
    marginLeft: PropTypes.number,
  })
)

export const combineChartDimensions = dimensions => {
  let parsedDimensions = {
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
    ...dimensions,
  }

  return {
    ...parsedDimensions,
    boundedHeight: Math.max(parsedDimensions.height - parsedDimensions.marginTop - parsedDimensions.marginBottom, 0),
    boundedWidth: Math.max(parsedDimensions.width - parsedDimensions.marginLeft - parsedDimensions.marginRight, 0),
  }
}

export const useChartDimensions = passedSettings => {
  const ref = useRef()
  const dimensions = combineChartDimensions(
    passedSettings
  )
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  useEffect(() => {
      if (dimensions.width && dimensions.height)
        return [ref, dimensions]
      const element = ref.current
      const resizeObserver = new ResizeObserver(
        entries => {
          if (!Array.isArray(entries)) return
          if (!entries.length) return
          const entry = entries[0]
          if (width !== entry.contentRect.width)
            setWidth(entry.contentRect.width)
          if (height !== entry.contentRect.height)
            setHeight(entry.contentRect.height)
        }
      )
      resizeObserver.observe(element)
      return () => resizeObserver.unobserve(element)
  }, [])
  const newSettings = combineChartDimensions({
      ...dimensions,
      width: dimensions.width || width,
      height: dimensions.height || height,
  })
  return [ref, newSettings]
}

export const line = (d, sourceName, targetName) => {

  var source = d[sourceName],
      target = d[targetName];

  if (target && source) {

    var sourceX = source[0],
        sourceY = source[1];

    var targetX = target[0],
        targetY = target[1];

    var path = [
      "M", sourceX, sourceY, 
      "L", targetX, targetY
    ].join(" ")

    return path

  } else {
    return "M0,0,l0,0z";
  }

}

export const arc = (d, sourceName, targetName) => {

  var source = d[sourceName],
      target = d[targetName];

  if (target && source) {

    var sourceX = source[0],
        sourceY = source[1];

    var targetX = target[0],
        targetY = target[1];

    var dx = targetX - sourceX,
        dy = targetY - sourceY

    var initialPoint = { x: sourceX, y: sourceY}
    var finalPoint = { x: targetX, y: targetY}
    d.r = Math.sqrt(sq(dx) + sq(dy)) * 2;
    var centers = findCenters(d.r, initialPoint, finalPoint);
    var path = drawCircleArcSVG(centers.c1, d.r, initialPoint, finalPoint);
    return path

  }
  
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x, y, radius, startAngle, endAngle){
    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);
    var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
    var d = [
        "M", start.x, start.y, 
        "A", radius, radius, 0, arcSweep, 0, end.x, end.y
    ].join(" ");
    return d    
}

function sq(x) { return x*x ; }

function drawCircleArcSVG(c, r, p1, p2) {
  if(c.x & c.y){
    var ang1 = Math.atan2(p1.y-c.y, p1.x-c.x)*180/Math.PI+90;
    var ang2 = Math.atan2(p2.y-c.y, p2.x-c.x)*180/Math.PI+90;
    var path = describeArc(c.x, c.y, r, ang1, ang2)
  }
  return path
}

function findCenters(r, p1, p2) {
  var pm = { x : 0.5 * (p1.x + p2.x) , y: 0.5*(p1.y+p2.y) } ;
  var perpABdx= - ( p2.y - p1.y );
  var perpABdy = p2.x - p1.x;
  var norm = Math.sqrt(sq(perpABdx) + sq(perpABdy));
  perpABdx/=norm;
  perpABdy/=norm;
  var dpmp1 = Math.sqrt(sq(pm.x-p1.x) + sq(pm.y-p1.y)); 
  var sin = dpmp1 / r ;
  if (sin<-1 || sin >1) return null;
  var cos = Math.sqrt(1-sq(sin));
  var d = r*cos;
  var res1 = { x : pm.x + perpABdx*d, y: pm.y + perpABdy*d };
  var res2 = { x : pm.x - perpABdx*d, y: pm.y - perpABdy*d };
  return { c1 : res1, c2 : res2} ;  
}

export const findConnections = (data, id) => {

  // Nest data by club
  var dataConn = d3.nest()
    .key(function(d) { return d.club })
    .entries(data)

  var links = []
  var player = data.find(a=>a.entity === id)
  var club = dataConn.find(d=>d.key === player.club).values

  club.map(d=>{
    links.push({
      sourceId: id,
      targetId: d.entity,
      source: [player.x0, player.y0],
      target: [d.x0, d.y0],
      targetName: d.name,
      photo: d.photo,
      overall_score: d.overall,
      country: d.country
    })
  })

  links.sort(function(a, b){ return b.overall_score - a.overall_score })

  return links

}

export const calculateAspectRatioFit = (srcWidth, srcHeight, maxWidth, maxHeight) => {
  var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
  return { width: srcWidth*ratio, height: srcHeight*ratio };
}

export const onlyUnique = (value, index, self) => { 
  return self.indexOf(value) === index;
}

export const randBetween = (min, max) => {
  return min + (max - min) * Math.random();
} 

export const getRandomArbitrary = (min, max) => {
  return Math.round(Math.random() * (max - min) + min)
}
