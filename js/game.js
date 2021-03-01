'use strict';


//CLASES:
class Player {
    constructor(gameWidth, gameHeight) {
        this.width = 40;
        this.height = 40;

        this.maxSpeed = 3;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.position = {
            x: gameWidth / 2 - this.width / 2,
            y: gameHeight - this.height - 10
        };
    }
    moveLeft() {
        this.xSpeed = -this.maxSpeed;
    }
    moveRight() {
        this.xSpeed = this.maxSpeed;
    }
    moveUp() {
        this.ySpeed = -this.maxSpeed;
    }
    moveDown() {
        this.ySpeed = this.maxSpeed;
    }
    stopX() {
        this.xSpeed = 0;
    }
    stopY() {
        this.ySpeed = 0;
    }

    draw(ctx) {
        ctx.fillStyle = "#300010";
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
    update(deltaTime) {
        if (!deltaTime) return;
        this.position.x += this.xSpeed;
        this.position.y += this.ySpeed;
        if (this.position.x < 0) this.position.x = 0;
        else if (this.position.x > GAME_WIDTH - this.width) this.position.x = GAME_WIDTH - this.width;

        if (this.position.y < 0) this.position.y = 0;
        else if (this.position.y > GAME_HEIGHT - this.height) this.position.y = GAME_HEIGHT - this.height;
    }
}

class InputHandler {
    constructor(player) {
        document.addEventListener("keydown", event => {//pressed buttons
            //alert(event.keyCode);
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
                    if (player.xSpeed < 0) player.stopX();
                    break;
                case 38:
                    if (player.ySpeed < 0) player.stopY();
                    break;
                case 39:
                    if (player.xSpeed > 0) player.stopX();
                    break;
                case 40:
                    if (player.ySpeed > 0) player.stopY();
                    break;
                case 65:
                    if (player.xSpeed < 0) player.stopX();
                    break;
                case 87:
                    if (player.ySpeed < 0) player.stopY();
                    break;
                case 68:
                    if (player.xSpeed > 0) player.stopX();
                    break;
                case 83:
                    if (player.ySpeed > 0) player.stopY();
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
        this.xSpeed = 0;
        this.ySpeed = 0;
        const spawn = randomSpawn(this.width, this.height);
        this.degree = spawn.degree;
        this.side = spawn.side;
        this.position = {
            x: spawn.x,
            y: spawn.y
        };
        switch (this.side) {
            case "top":
                this.ySpeed = this.maxSpeed;
                break;
            case "right":
                this.xSpeed = -this.maxSpeed;
                break;
            case "bottom":
                this.ySpeed = -this.maxSpeed;
                break;
            case "left":
                this.xSpeed = this.maxSpeed;
                break;
        }
    }

    draw(ctx) {
        ctx.translate(this.position.x, this.position.y);//move to spawn position
        ctx.rotate(this.degree * Math.PI / 180);//rotate system
        ctx.drawImage(this.image, 0, 0, this.width, this.height);//draw enemy
        ctx.setTransform(1, 0, 0, 1, 0, 0);

    }
    update(deltaTime) {
        if (!deltaTime) return;
        this.position.x += this.xSpeed;
        this.position.y += this.ySpeed;
    }
}

class Snake extends Enemy {

}


//CONSTS:
const canvas = document.getElementById("gameScreen");
const ctx = canvas.getContext("2d");
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

let player = new Player(GAME_WIDTH, GAME_HEIGHT);
let imgsnake = document.getElementById("snake");
let snakeEnemy = new Snake(imgsnake);
new InputHandler(player);
let lastTime = 0;


//FUNCTIONS:
function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

function randomSpawn(objWidth, objHeight) {
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
    snakeEnemy.update(deltaTime);
    snakeEnemy.draw(ctx);
    requestAnimationFrame(gameLoop);
}

//LAUNCH
player.draw(ctx);
gameLoop();