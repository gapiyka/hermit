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
                case 27://esc
                    alert("PAUSE");
                    break;
                case 32://space
                    alert("START");
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
        const spawn = randomSpawn(this.width, this.height);
        this.degree = spawn.degree;
        this.side = spawn.side;
        this.position = {
            x: spawn.x,
            y: spawn.y
        };
        switch (this.side) {
            case "top":
                this.speed.y = this.maxSpeed;
                break;
            case "right":
                this.speed.x = -this.maxSpeed;
                break;
            case "bottom":
                this.speed.y = -this.maxSpeed;
                break;
            case "left":
                this.speed.x = this.maxSpeed;
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

let player = new Player(GAME_WIDTH, GAME_HEIGHT, imghero);
let snakeEnemy = new Snake(imgsnake);
let lastTime = 0;


//FUNCTIONS:
function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

function randomSpawn(objWidth, objHeight) {//generate spawn position+side of enemy(snake)
    const sides = [//0-top 1-right 2-bottom 3-left
        {
            side: "top",
            x: random(0, GAME_WIDTH - objWidth),
            y: 0,
            degree: 180
        },
        {
            side: "right",
            x: GAME_WIDTH,
            y: random(0, GAME_HEIGHT - objHeight),
            degree: 270
        },
        {
            side: "bottom",
            x: random(0, GAME_WIDTH - objWidth),
            y: GAME_HEIGHT,
            degree: 0
        },
        {
            side: "left",
            x: 0,
            y: random(0, GAME_HEIGHT - objHeight),
            degree: 90
        }
    ];
    return sides[random(0, 4)];
}

function gameLoop(timestamp) {
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    player.update(deltaTime);
    player.draw(ctx);
    if ((snakeEnemy.position.x > -100 && snakeEnemy.position.x < GAME_WIDTH + 100) && (snakeEnemy.position.y > -100 && snakeEnemy.position.y < GAME_HEIGHT + 100)) {
        snakeEnemy.update(deltaTime);
        snakeEnemy.draw(ctx);
    }
    else snakeEnemy = new Snake(imgsnake);

    requestAnimationFrame(gameLoop);//https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
}


//LAUNCH
new InputHandler(player);
player.draw(ctx);
gameLoop();