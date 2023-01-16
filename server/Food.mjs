import crypto from 'crypto'
import { rows, cols } from './Grid.mjs'




export const food = {}
//create foodmap
for(let i = 0; i<cols; i++){
    food[i] = {}
    for(let k = 0; k<rows; k++){
        food[i][k]=null
    }
}

//check if snake head is overlapping food
export function checkFood(snake) {
    const pos = snake.body[0]
    if( food[ pos[0].toString() ][ pos[1].toString() ] !== null ){

        console.log(`${snake.id} got food at ${pos}`)
        //grow snake
        snake.body.push(pos)

        //remove this food from map
        food[ pos[0].toString() ][ pos[1].toString() ] = null

        //return the position
        return pos
    }
}

//spawn new food
export function spawnFood(){
    const x = crypto.randomInt(0,cols)
    const y = crypto.randomInt(0,rows)
    //checks if tile is unoccupied
    if( food[x.toString()][y.toString()] == null){
        food[x.toString()][y.toString()] = 0
    } else spawnFood()
    return [x, y]
}

// loop through food obj and add to a temp array.
// only sent to new player when they join
export function food2Array(){
    const foodArray = []
    for( let y of Object.keys(food) ){
        for( let x of Object.keys(food[y]) ){
          if( food[y][x] !== null ) foodArray.push([+y, +x])
        }
      }
      return foodArray
}