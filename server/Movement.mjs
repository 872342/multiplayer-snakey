//receive playerObj, calc and store new dirs and positions in their objects

import { rows, cols } from './Grid.mjs'


const dir = {
    UP:0,
    DOWN:1,
    LEFT:2,
    RIGHT:3
}

const [screenTop, screenBottom, screenLeft, screenRight] = [0, rows-1, 0, cols-1]


export const applyMovement = (snakeObj) => {

    const intendedDirection = snakeObj.intendedDir
    const pos = snakeObj.body[0] //head
    let newPos = [...pos]
    
    switch(intendedDirection){
        case dir.UP: {                                                            // if pressed up
            if(snakeObj.dir !== dir.DOWN) newPos = MoveUp(pos, newPos, snakeObj); // and not going down - go up
            else newPos = MoveDown(pos, newPos, snakeObj)                         // else keep going down
            break;
        }
        case dir.DOWN: {
            if(snakeObj.dir !== dir.UP) newPos = MoveDown(pos, newPos, snakeObj);
            else newPos = MoveUp(pos, newPos, snakeObj)
            break;
        }
        case dir.LEFT: {
            if(snakeObj.dir !== dir.RIGHT) newPos = MoveLeft(pos, newPos, snakeObj);
            else newPos = MoveRight(pos, newPos, snakeObj)
            break;
        }
        case dir.RIGHT: {
            if(snakeObj.dir !== dir.LEFT) newPos = MoveRight(pos, newPos, snakeObj);
            else newPos = MoveLeft(pos, newPos, snakeObj)
            break;
        }
    }
    snakeObj.body.pop();           
    snakeObj.body.unshift(newPos); 
  }


  function MoveUp(pos, newPos, snakeObj){
    if( pos[1] === screenTop ) newPos[1] = screenBottom   //if snake is at top of screen, teleport to bottom etc
    else newPos[1] -=1 
    snakeObj.dir = dir.UP
    return newPos
  }

  function MoveDown(pos, newPos, snakeObj){
    if( pos[1] === screenBottom ) newPos[1] = screenTop 
    else newPos[1] +=1 
    snakeObj.dir = dir.DOWN
    return newPos
  }

  function MoveLeft(pos, newPos, snakeObj){
    if( pos[0] === screenLeft ) newPos[0] = screenRight 
    else newPos[0] -=1 
    snakeObj.dir = dir.LEFT
    return newPos
  }

  function MoveRight(pos, newPos, snakeObj){
    if( pos[0] === screenRight ) newPos[0] =  screenLeft
      else newPos[0] +=1
      snakeObj.dir = dir.RIGHT
      return newPos
  }