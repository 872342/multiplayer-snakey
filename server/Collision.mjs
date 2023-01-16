import { rows, cols } from './Grid.mjs'
import { s } from './main.mjs'


export const collisionmap = {}



const wipeMap = () => {
    for(let i = 0; i<cols; i++){
        collisionmap[i] = {}
        for(let k = 0; k<rows; k++){
            collisionmap[i][k]=null
        }
    }
}
wipeMap()


//reset the map and add snakes
export const updateCollisionMap = (snakes) => {
    wipeMap()
    for(let snake of snakes){
        for(let i=1;i<snake.body.length;i++){
            const [x,y] = snake.body[i]
            if( collisionmap[x][y]===null ) collisionmap[x][y] = snake.id 
        }
    }
 }


 export const checkCollision = (snake) => {
    //XY of head
    const [x,y] = snake.body[0]
    if(collisionmap[x][y] !== null){
        if(collisionmap[x][y] !== snake.id){
            //chop off body at collision test
            //(too easy to cut neck and lose everything)
            const hitSnek = s.snakeById( collisionmap[x][y] )
            if(hitSnek){
                hitSnek.body.length = hitSnek.body.length-1
            }


        }
    }
 }
