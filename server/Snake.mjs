//validate given color
function isHexColor (hex) {
    const noHash = hex.replace('#','')
    if(noHash === "#000000") return false
    return typeof noHash === 'string'
        && noHash.length === 6
        && !isNaN(Number('0x' + noHash))
  }

export class Snake{
    constructor(id, body, color='green'){
        this.id = id;
        this.body = body;
        this.dir = null;
        this.intendedDir = null,
        this.color = isHexColor(color) ? color : 'green'
    }
}

export class Snakes{
    constructor(){
        this.snakes = []
    }
    //create new snake
    newSnake({id, body, color}){
        let snake = new Snake(id, body, color)
        this.snakes.push(snake)
        return snake
    }
    allSnakes(){
        return this.snakes
    }
    snakeById(id){
        return this.snakes.find(s => s.id === id) 
    }
    deleteSnakeById(id){
        this.snakes = this.snakes.filter(s=> s.id!==id)
    }
    allSnakeColors(){
        return this.snakes.map(({id, color}) => ([id, color]))
        //return this.snakes.map(({id, color}) => (id, color}))
    }

 

}