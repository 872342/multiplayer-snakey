import crypto from 'crypto'

import { WebSocketServer } from "ws";
const serverPort = 3270;

//HTTP
import http from 'http'
const server = http.createServer();

//HTTPS
// import { readFileSync } from 'fs';
// import http from 'https';
// const server = http.createServer({
//     cert: readFileSync('./fullchain.pem'),
//     key: readFileSync('./privkey.pem')
// });

const wss = new WebSocketServer({server});

import { applyMovement } from './Movement.mjs';
import { Snakes } from './Snake.mjs';
import { spawnFood, checkFood, food2Array } from "./Food.mjs";
import { rows, cols } from "./Grid.mjs";
import { Types } from './Types.mjs';
import { checkCollision, collisionmap, updateCollisionMap } from './Collision.mjs';


export let s = new Snakes

//stores connections to detect closed
const connections = {}

//available game slots, IDs
const SLOTS = [0,null,null,null,null,null,null,null,null,null,null]

const findSlot = () => {
  const b = SLOTS.findIndex(e => e === null)
  if(b !== -1){
    SLOTS[b] = b
    return b
  }
  else return b
}

function heartbeat() {
    this.isAlive = true;
}

function spawnPos(){
    const fake = [[5,5],[5,6],[5,7],[5,8],[5,9]]
    return fake
    const x = crypto.randomInt(0,cols)
    const y = crypto.randomInt(0,rows)
    //return [[x,y]]
}

// send data to all clients
const broadcast = (data) => {
    wss.clients.forEach(function each(ws){
        ws.send(JSON.stringify(data))
    })
}


//spawn 1 food
spawnFood()


// create new player
function newPlayer(ws, color){
    connections[ws.id] = ws //store connection to remove on disconnect
    //TODO look for free tile
    const body = spawnPos()
    //if availble slot, create player and send them their id
    const snek = s.newSnake({id:ws.id, body, color: color })
    console.log("new player ", ws.id)
    ws.send(JSON.stringify( [Types.ID, ws.id] ))
    broadcast( [Types.NEWPLAYER, [ws.id, snek.color]] )
}



// new client join
wss.on('connection', (ws) =>{
    // add new client to open slot and set ID, -1 is spectator
    ws.id = -1
    ws.isAlive = true;
    ws.on('pong', heartbeat);
    ws.updated = false;//tick filter
    
    // send new connection all food and players + colors
    ws.send(JSON.stringify( [Types.ALLFOOD, food2Array()]         ))
    ws.send(JSON.stringify( [Types.ALLCOLORS, s.allSnakeColors()] ))
  

    //msgs
    ws.on('message', function message(m) {
        const message = JSON.parse(m)
        const code = message[0]
        const data = message[1]

        switch(code){
            case Types.JOIN:{
                // if player already playing, ignore
                if(connections[ws.id]) return

                //check there is open slot for a player
                if(!SLOTS.includes(null)) return

                //check if player is spectator with -1, update their id to open slot
                if(ws.id === -1){
                    const slot = findSlot()
                    console.log(`Spectator joined as ${slot}`)
                    //update id to player and create
                    ws.id = slot
                }
                if(data) newPlayer(ws, data) //data = color hex
            }
            case Types.DIR:{
                if(ws.id === -1) return; //ignore dirs from non players

                if(ws.updated) return; //reject until next tick
                ws.updated = true
                //get specific snek and set new intendedDir
                const snek = s.snakeById(ws.id)
                if(typeof snek !== "undefined") snek.intendedDir = data; 
                
            }
        }

        
    });

});



// game tick
const tick = setInterval(()=>{

    const allSnakes = s.allSnakes()


    //create snakemap
    updateCollisionMap(allSnakes)


    for( let snake of allSnakes ){

        checkCollision(snake)

        //update all snakes positions
        applyMovement( snake )

        //checks & returns [x,y] of food to del if overlaps
        const delFoodPos = checkFood( snake )
        if( delFoodPos ){
            //spawn new food
            const newFoodPos = spawnFood()
            broadcast( [Types.DELFOOD, delFoodPos] )
            broadcast( [Types.FOOD, newFoodPos] )
        }
    }

    //send all clients new array of player positions
    wss.clients.forEach(function each(ws){
        ws.updated = false
        const playersArray = []
        for( let snake of s.allSnakes() ){
            const snakeArray = [snake.id, snake.body]
            playersArray.push(snakeArray)
        }     
        ws.send(JSON.stringify(  [Types.PLAYERS, playersArray]  ))
    })


},50)

// loop all connections{} and remove dead players
const interval = setInterval(function ping() {
    for(let key in connections){
        const client = connections[key]
        if (client.isAlive === false){ 
            // remove snake from class array, clear slot, broadcast removal, delete from connections
            s.deleteSnakeById(parseInt(key))
            console.log("DELETING PLAYER ", key)
            SLOTS[key] = null
            broadcast([Types.DELPLAYER, parseInt(key)])
            delete connections[key]
            return client.terminate(); //?
        }
        //else reset
        client.isAlive = false;
        client.ping();
    };
}, 1000);
  


wss.on('close', function close() {
    clearInterval(interval);
});




server.listen(serverPort, () => {
    console.log(`Websocket server started on port ` + serverPort);
});