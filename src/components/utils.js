import PropTypes from 'prop-types'
import { useEffect, useRef } from "react"

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

export function getPropertyName(obj, expression) {
  var res = {};
  Object.keys(obj).map(k => { res[k] = () => k; });
  return expression(res)();
}

export const onlyUnique = (value, index, self) => { 
  return self.indexOf(value) === index;
}

export function cleanTopic(topic) {
  if(topic === 'Bus' || topic === 'Busi') return 'Business'
  if(topic === 'Ins' || topic === 'Inst') return 'Institution'
  if(topic === 'Con' || topic === 'Cons') return 'Consumer'
  return topic
} 

export function cleanCategory(topic) {
  if(topic === 'Self') return 'Self-Profit-Growth'
  if(topic === 'Prof') return 'Self-Profit-Growth'
  if(topic === 'Gro' || topic === 'Grow' || topic === 'Gro2' || topic === 'Gro3' || topic === 'Growth') return 'Self-Profit-Growth'
  if(topic === 'Soc') return 'Society'
  if(topic === 'Env') return 'Environment'
  if(topic === 'SP') return 'Sustainability'
  if(topic === 'Oth') return 'Other'
  return topic
} 

export function cleanUnit(topic) {
  if(topic === 'T') return 'Title'
  if(topic === 'A') return 'Abstract'
  if(topic === 'I') return 'Introduction'
  if(topic === 'D') return 'Discussion'
  if(topic === 'C') return 'Conclusion'
  if(topic === 'O') return 'Overall'
  return topic
} 

export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value; //assign the value of ref to the argument
  },[value]); //this code will run when the value of 'value' changes
  return ref.current; //in the end, return the current ref value.
}