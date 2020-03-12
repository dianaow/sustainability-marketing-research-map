const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_DATE':
      return {
        id: state.id,
        name: state.name,
        date: action.date,
        nodes: state.nodes,
        links: state.links
      }
    case 'SET_STATS':
      return {
        id: state.id,
        name: state.name,
        date: state.date,
        nodes: action.nodes,
        links: action.links
      }
    default:
      return state
  }
}

export default reducer