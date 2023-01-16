import './style.css'
import { Types } from './Types';
let ws = new WebSocket("ws://localhost:3270")



const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const joinBtn = document.getElementById('join') as HTMLButtonElement
const colorBtn = document.getElementById('color') as HTMLButtonElement

const rows = 30
const cols = 40
let cellSize = 20

let gameX = 0
let gameY = 0

const setCanvasSize=()=>{
  const width = window.innerWidth/cols
  const height = window.innerHeight/rows
  
  cellSize = (width <= height) ? width : height
  gameX = cellSize * cols
  gameY = cellSize * rows

  ctx.canvas.width = gameX;
  ctx.canvas.height = gameY;
}



window.addEventListener('load',()=>{
  setCanvasSize()
})
window.addEventListener('resize',()=>{
  setCanvasSize()
})
const drawGrid = () => {
  ctx.clearRect(0,0,canvas.width, canvas.height);
  ctx.fillStyle = "black";
  for(let x=0;x<cols;x++){
    for(let y=0;y<rows;y++){
      ctx.fillRect(cellSize*x, cellSize*y, cellSize-1,cellSize-1 )
    }
  }
}


let playerid:number;
let allSneks: any[] = []

type Color = { [key:string] :  { color:string }}
let snekColors:Color = {}


const drawSnek = () => {  
//array player data
  for(let s of allSneks){
    const id = s[0].toString()
    const body = s[1]
    if( Object.hasOwn(snekColors, id) ) ctx.fillStyle = snekColors[id].color;
    else ctx.fillStyle = 'green';
    for(let segment of body){
      ctx.fillRect(cellSize*segment[0], cellSize*segment[1], cellSize-1,cellSize-1 )
    }
  }
}

let food:number[][] = []

const drawFood = () => {
 if(food.length===0) return;
  ctx.fillStyle = "red";
  for(let f of food){
    ctx.fillRect(cellSize*f[0], cellSize*f[1], cellSize-1,cellSize-1 )
  }
}


//movement
enum dir {
  UP, DOWN, LEFT, RIGHT
}
window.addEventListener("keydown", (event) => {
    if(playerid){
      if (event.key === "ArrowLeft")  ws.send(JSON.stringify([Types.DIR, dir.LEFT]))   
      else if (event.key === "ArrowRight") ws.send(JSON.stringify([Types.DIR, dir.RIGHT]))  
      else if (event.key === "ArrowUp") ws.send(JSON.stringify([Types.DIR, dir.UP]))
      else if (event.key === "ArrowDown")  ws.send(JSON.stringify([Types.DIR, dir.DOWN])) 
    }
});

//mobile swiping
let touchstartX = 0
let touchendX = 0
let touchstartY = 0
let touchendY = 0   
function checkDirection() {
  const yDist = Math.abs(touchstartY - touchendY)
  const xDist = Math.abs(touchstartX - touchendX)
  if(yDist > xDist){
    //moving U/D
    if (touchendY > touchstartY) ws.send(JSON.stringify([Types.DIR, dir.DOWN]))
    else ws.send(JSON.stringify([Types.DIR, dir.UP]))
  }
  else{
    //moving L/R
    if (touchendX > touchstartX) ws.send(JSON.stringify([Types.DIR, dir.RIGHT])) 
    else ws.send(JSON.stringify([Types.DIR, dir.LEFT]))
  }
}
document.addEventListener('touchstart', e => {
  touchstartX = e.changedTouches[0].screenX
  touchstartY = e.changedTouches[0].screenY
})
document.addEventListener('touchend', e => {
  touchendX = e.changedTouches[0].screenX
  touchendY = e.changedTouches[0].screenY
  if(playerid) checkDirection()
})




const update = () => {
  ctx.clearRect(0,0,canvas.width, canvas.height);
  drawGrid()
  drawFood()
  drawSnek()
  requestAnimationFrame(update)
}
update()


//let playerCount = 0;
joinBtn.addEventListener('click',()=>{
  colorBtn.style.visibility = 'hidden'
  joinBtn.style.visibility = 'hidden'
  colorBtn.disabled = true
  joinBtn.disabled = true
  ws.send(JSON.stringify([Types.JOIN, colorBtn.value]))
})


ws.onmessage = (e) => {
  const message = JSON.parse(e.data)
  const code = message[0]
  const data = message[1] 

  switch(code){
    case Types.ID:{
      playerid = data.toString()
      return;
    } 
    case Types.NEWPLAYER:{
      Object.assign(snekColors, { [data[0].toString()]:{ color: data[1] } })
      return;
    }
    case Types.ALLFOOD:{
      food.push(...data)
      return;
    }
    case Types.PLAYERS:{
      allSneks=[]
      allSneks = data as [][]
      return;
    }
    case Types.ALLCOLORS:{
      for(const [id, color] of data){
        Object.assign(snekColors, { [id.toString()]:{ color:color } })
      }
      return;
    }
    case Types.FOOD:{
      food.push(data)
      return;
    }
    case Types.DELFOOD:{
      food = food.filter(e => !(e[0]==data[0] && e[1]==data[1]))
      return;
    }
    case Types.DELPLAYER:{
      allSneks = allSneks.filter(e=>e.id!==data)
      return;
    }

  }

}