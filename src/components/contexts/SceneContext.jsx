import React, { createContext, useState } from "react"

export const initialSceneState = {scene: 0, entity: undefined}

export const SceneContext = createContext()

export const maxScene = 4

export function SceneProvider(props) {

  const [sceneState, setScene] = useState(initialSceneState)

  const clicker = (scene, id) => {
    setScene({scene: scene + 1, id})
    if(scene+1 === 4){
      setTimeout(function(){
        setScene(initialSceneState) // reset counter after all scenes have been rendered
      }, 1100)
    }
  }

  return(
    <SceneContext.Provider value={{ sceneState, clicker, setScene }}>
      { props.children }
    </SceneContext.Provider>
  )

}