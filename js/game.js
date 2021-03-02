'use strict';


//CLASES:
class Player {
    constructor(gameWidth, gameHeight, image) {
        this.width = 40;
        this.height = 40;
        this.image = image;
        this.maxSpeed = 3;
        this.speed = { x: 0, y: 0 };
        this.position = {
            x: gameWidth / 2 - this.width / 2,
            y: gameHeight - this.height - 10
        };
        this.lookForward = true;
        this.lookRight = true;
    }
    moveLeft() {
        this.speed.x = -this.maxSpeed;
        this.lookRight = false;
    }
    moveRight() {
        this.speed.x = this.maxSpeed;
        this.lookRight = true;
    }
    moveUp() {
        this.speed.y = -this.maxSpeed;
        this.lookForward = true;
    }
    moveDown() {
        this.speed.y = this.maxSpeed;
        this.lookForward = false;
    }
    stopX() {
        this.speed.x = 0;
    }
    stopY() {
        this.speed.y = 0;
    }

    draw(ctx) {
        let modelCut;// x pos for cut image (y = 0 - default)
        if (this.lookRight && this.lookForward) {
            modelCut = 0;
        }
        else if (!this.lookRight && this.lookForward) {
            modelCut = 40;
        }
        else if (this.lookRight && !this.lookForward) {
            modelCut = 80;
        }
        else if (!this.lookRight && !this.lookForward) {
            modelCut = 120;
        }
        ctx.drawImage(this.image, modelCut, 0, this.width, this.height, this.position.x - this.width / 2, this.position.y, 80, 40);
    }
    update(deltaTime) {
        if (!deltaTime) return;
        this.position.x += this.speed.x;
        this.position.y += this.speed.y;
        if (this.position.x < 0) this.position.x = 0;
        else if (this.position.x > GAME_WIDTH - this.width) this.position.x = GAME_WIDTH - this.width;

        if (this.position.y < 0) this.position.y = 0;
        else if (this.position.y > GAME_HEIGHT - this.height) this.position.y = GAME_HEIGHT - this.height;
    }
}

class InputHandler {
    constructor(player) {
        document.addEventListener("keydown", event => {//pressed buttons
            switch (event.keyCode) {
                case 37://arrow-left
                    player.moveLeft();
                    break;
                case 38://arrow-up
                    player.moveUp();
                    break;
                case 39://arrow-right
                    player.moveRight();
                    break;
                case 40://arrow-down
                    player.moveDown();
                    break;
                case 65://A
                    player.moveLeft();
                    break;
                case 87://W
                    player.moveUp();
                    break;
                case 68://D
                    player.moveRight();
                    break;
                case 83://S
                    player.moveDown();
                    break;
                case 32://space
                    if (!IsGameStarted) StartGame();
                    break;
            }
        });
        document.addEventListener("keyup", event => {//unpressed buttons
            switch (event.keyCode) {
                case 37:
                    if (player.speed.x < 0) player.stopX();
                    break;
                case 38:
                    if (player.speed.y < 0) player.stopY();
                    break;
                case 39:
                    if (player.speed.x > 0) player.stopX();
                    break;
                case 40:
                    if (player.speed.y > 0) player.stopY();
                    break;
                case 65:
                    if (player.speed.x < 0) player.stopX();
                    break;
                case 87:
                    if (player.speed.y < 0) player.stopY();
                    break;
                case 68:
                    if (player.speed.x > 0) player.stopX();
                    break;
                case 83:
                    if (player.speed.y > 0) player.stopY();
                    break;
            }
        });
    }
}

class Enemy {
    constructor(image) {
        this.name = this.__proto__.constructor.name;
        this.image = image;
        this.width = 40;
        this.height = 40;
        this.maxSpeed = 3;
        this.speed = { x: 0, y: 0 };
        const spawn = randomSnakeSpawn(this.width, this.height);
        this.degree = spawn.degree;
        this.side = spawn.side;
        this.position = {
            x: spawn.x,
            y: spawn.y
        };
        this.colision = {};
        switch (this.side) {
            case "top":
                this.speed.y = this.maxSpeed;
                this.colision = {
                    x: this.position.x - this.width,
                    y: this.position.y - this.height
                }
                break;
            case "right":
                this.speed.x = -this.maxSpeed;
                this.colision = {
                    x: this.position.x,
                    y: this.position.y - this.height
                }
                break;
            case "bottom":
                this.speed.y = -this.maxSpeed;
                this.colision = {
                    x: this.position.x,
                    y: this.position.y,
                }
                break;
            case "left":
                this.speed.x = this.maxSpeed;
                this.colision = {
                    x: this.position.x - this.width,
                    y: this.position.y,
                }
                break;
        }
    }

    draw(ctx) {
        ctx.translate(this.position.x, this.position.y);            //move system to spawn position
        ctx.rotate(this.degree * Math.PI / 180);                    //rotate system
        ctx.drawImage(this.image, 0, 0, this.width, this.height);   //draw enemy
        ctx.setTransform(1, 0, 0, 1, 0, 0);                         //make a system transofrm by default

    }
    update(deltaTime) {
        if (!deltaTime) return;
        this.position.x += this.speed.x;
        this.position.y += this.speed.y;
        this.colision.x += this.speed.x;
        this.colision.y += this.speed.y;
    }
}

class Snake extends Enemy {

}


//CONSTS:
const canvas = document.getElementById("gameScreen");
const ctx = canvas.getContext("2d");
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const imghero = document.getElementById("hero");
const imgsnake = document.getElementById("snake");

let player = new Player(GAME_WIDTH, GAME_HEIGHT, imghero);;
let Hendler;
let snakeEnemys;
let lastTime = 0;
let IsGameStarted = false;


//FUNCTIONS:
function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

function randomSnakeSpawn(objWidth, objHeight) {//generate spawn position+side of enemy(snake)
    const sides = [//0-top 1-right 2-bottom 3-left
        {
            side: "top",
            x: random(objWidth, GAME_WIDTH - objWidth),
            y: 0,
            degree: 180
        },
        {
            side: "right",
            x: GAME_WIDTH,
            y: random(objHeight, GAME_HEIGHT - objHeight),
            degree: 270
        },
        {
            side: "bottom",
            x: random(objWidth, GAME_WIDTH - objWidth),
            y: GAME_HEIGHT,
            degree: 0
        },
        {
            side: "left",
            x: 0,
            y: random(objHeight, GAME_HEIGHT - objHeight),
            degree: 90
        }
    ];
    return sides[random(0, 4)];
}

function gameLoop(timestamp) {
    if (IsGameStarted) {
        let deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        player.update(deltaTime);
        player.draw(ctx);
        snakeEnemys.forEach(snakeEnemy => {
            //check on existing in borders
            if ((snakeEnemy.position.x > -100 && snakeEnemy.position.x < GAME_WIDTH + 100) && (snakeEnemy.position.y > -100 && snakeEnemy.position.y < GAME_HEIGHT + 100)) {
                snakeEnemy.update(deltaTime);
                snakeEnemy.draw(ctx);
                //collision
                if ((player.position.x + player.width >= snakeEnemy.colision.x && player.position.x + player.width <= snakeEnemy.colision.x + snakeEnemy.width) || (player.position.x <= snakeEnemy.colision.x + snakeEnemy.width && player.position.x >= snakeEnemy.colision.x)) {
                    if ((player.position.y + player.height >= snakeEnemy.colision.y && player.position.y + player.height <= snakeEnemy.colision.y + snakeEnemy.height) || (player.position.y <= snakeEnemy.colision.y + snakeEnemy.height && player.position.y >= snakeEnemy.colision.y)) {
                        IsGameStarted = false;
                    }
                }
            }
            else {
                if (snakeEnemys.indexOf(snakeEnemy) == 1) snakeEnemys.pop();
                else snakeEnemys.shift();//' snakeEnemy = new Snake(imgsnake) ' doesn`t work
                snakeEnemys.push(new Snake(imgsnake));
            }
        });
    }
    else {
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        player.draw(ctx);
        ctx.font = `48px serif`;
        ctx.fillText("Press 'Space' to start game", GAME_WIDTH / 6, GAME_HEIGHT / 6);
    }

    requestAnimationFrame(gameLoop);//https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
}

function StartGame() {
    player = new Player(GAME_WIDTH, GAME_HEIGHT, imghero);
    snakeEnemys = [];
    snakeEnemys.push(new Snake(imgsnake));
    snakeEnemys.push(new Snake(imgsnake));
    IsGameStarted = true;
    Hendler = new InputHandler(player);
}


//LAUNCH
Hendler = new InputHandler(player);
gameLoop();