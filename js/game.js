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
        this.hp = 100;
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
        if (this.hp > 50) ctx.fillStyle = "green";
        else if (this.hp < 25) ctx.fillStyle = "red";
        else ctx.fillStyle = "yellow";
        ctx.fillRect(this.position.x, this.position.y - 15, this.hp / 2.5, 10);
    }
    update(deltaTime) {
        if (!deltaTime) return;
        this.position.x += this.speed.x;
        this.position.y += this.speed.y;
        if (this.position.x < 0) this.position.x = 0;
        else if (this.position.x > GAME_WIDTH - this.width) this.position.x = GAME_WIDTH - this.width;

        if (this.position.y < 0) this.position.y = 0;
        else if (this.position.y > GAME_HEIGHT - this.height) this.position.y = GAME_HEIGHT - this.height;
        if (this.hp <= 0) Loose();
    }
}

class InputHandler {
    constructor() {
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
        this.colision = {};
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
    constructor(image) {
        super(image);//+ config from `Enemy` class
        this.spawn = randomSnakeSpawn(this.width, this.height);
        this.degree = this.spawn.degree;
        this.side = this.spawn.side;
        this.position = {
            x: this.spawn.x,
            y: this.spawn.y
        };
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
}

class Vulture extends Enemy {
    constructor(image) {
        super(image);
        this.maxSpeed = 1;
        this.position = {
            x: random(this.width, GAME_WIDTH - this.width),
            y: random(this.height, GAME_HEIGHT - this.height)
        };
        this.speed = { x: 1, y: 1 };
        this.degree = 90;
    }

    update(deltaTime) {
        if (this.speed.x > 0 && this.speed.y > 0) {
            this.degree = 90;
            this.colision = {
                x: this.position.x - this.width,
                y: this.position.y
            }
        }
        else if (this.speed.x > 0 && this.speed.y < 0) {
            this.degree = 0;
            this.colision = {
                x: this.position.x,
                y: this.position.y
            }
        }
        else if (this.speed.x < 0 && this.speed.y > 0) {
            this.degree = 180;
            this.colision = {
                x: this.position.x - this.width,
                y: this.position.y - this.height,
            }
        }
        else if (this.speed.x < 0 && this.speed.y < 0) {
            this.degree = 270;
            this.colision = {
                x: this.position.x,
                y: this.position.y - this.height
            }
        }
        //borders check
        if (this.colision.x > GAME_WIDTH || this.colision.x < -this.height) {
            this.speed.x = -this.speed.x;
        }
        if (this.colision.y > GAME_HEIGHT || this.colision.y < -this.width) {
            this.speed.y = -this.speed.y;
        }

        super.update(deltaTime);
    }

}

class Objects {
    constructor(image) {
        this.image = image;
        this.width = 40;
        this.height = 40;
        this.position = {
            x: random(0, GAME_WIDTH - this.width),
            y: random(0, GAME_HEIGHT - this.height)
        };
    }
    draw(ctx) {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }
}


//CONSTS:
const canvas = document.getElementById("gameScreen");
const ctx = canvas.getContext("2d");
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const imghero = document.getElementById("hero");
const enemiesImages = [document.getElementById("snake"), document.getElementById("vulture")];
const objectsImages = [document.getElementById("rock"), document.getElementById("palm"), document.getElementById("cactus")];
const fruitsImages = [document.getElementById("baobab"), document.getElementById("pumpkin"), document.getElementById("amaranth")];

let player = new Player(GAME_WIDTH, GAME_HEIGHT, imghero);;
let TimeTextBar = document.getElementById('timescore');
let topTimeBar = document.getElementById('toptimescore');
let snakeEnemies;
let lastTime = 0;
let surviveTime = 0;
let topTimeScore = 0;
let startGameTime;
let IsGameStarted = false;
let IsNightMode = false;
let nightCounter;
let staticObjects = [];
let fruit;
let vulture;
let secDelta;


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

        surviveTime = Math.floor((new Date() - startGameTime) / 1000);
        TimeTextBar.innerHTML = `${surviveTime} seconds`;
        fruit.draw(ctx);
        //collision(player & fruit)
        if ((player.position.x + player.width >= fruit.position.x && player.position.x + player.width <= fruit.position.x + fruit.width) || (player.position.x <= fruit.position.x + fruit.width && player.position.x >= fruit.position.x)) {
            if ((player.position.y + player.height >= fruit.position.y && player.position.y + player.height <= fruit.position.y + fruit.height) || (player.position.y <= fruit.position.y + fruit.height && player.position.y >= fruit.position.y)) {
                fruit = new Objects(fruitsImages[random(0, fruitsImages.length)]);
                player.hp += 10;
                if (player.hp > 100) player.hp = 100;
            }
        }
        //collision(player & vulture)
        if ((player.position.x + player.width >= vulture.colision.x && player.position.x + player.width <= vulture.colision.x + vulture.width) || (player.position.x <= vulture.colision.x + vulture.width && player.position.x >= vulture.colision.x)) {
            if ((player.position.y + player.height >= vulture.colision.y && player.position.y + player.height <= vulture.colision.y + vulture.height) || (player.position.y <= vulture.colision.y + vulture.height && player.position.y >= vulture.colision.y)) {
                Loose();
            }
        }

        staticObjects.forEach(obj => {
            obj.draw(ctx);
            //collision(player & object)
            if ((player.position.x + player.width >= obj.position.x + 15 && player.position.x + player.width <= obj.position.x + obj.width - 15) || (player.position.x <= obj.position.x + obj.width - 15 && player.position.x + 15 >= obj.position.x)) {
                if ((player.position.y + player.height >= obj.position.y && player.position.y + player.height <= obj.position.y + obj.height) || (player.position.y <= obj.position.y + obj.height && player.position.y >= obj.position.y)) {
                    player.position.x -= player.speed.x;
                    player.position.y -= player.speed.y;
                }
            }

            //collision(snake & object)
            snakeEnemies.forEach(snakeEnemy => {
                if ((snakeEnemy.colision.x + snakeEnemy.width >= obj.position.x && snakeEnemy.colision.x + snakeEnemy.width <= obj.position.x + obj.width) || (snakeEnemy.colision.x <= obj.position.x + obj.width && snakeEnemy.colision.x >= obj.position.x)) {
                    if ((snakeEnemy.colision.y + snakeEnemy.height >= obj.position.y && snakeEnemy.colision.y + snakeEnemy.height <= obj.position.y + obj.height) || (snakeEnemy.colision.y <= obj.position.y + obj.height && snakeEnemy.colision.y >= obj.position.y)) {
                        if (snakeEnemies.indexOf(snakeEnemy) == 1) snakeEnemies.pop();
                        else snakeEnemies.shift();//' snakeEnemy = new Snake(enemiesImages[0]) ' doesn`t work
                        snakeEnemies.push(new Snake(enemiesImages[0]));
                    }
                }
            });
        });
        player.draw(ctx);
        snakeEnemies.forEach(snakeEnemy => {
            //check on existing in borders
            if ((snakeEnemy.position.x > -100 && snakeEnemy.position.x < GAME_WIDTH + 100) && (snakeEnemy.position.y > -100 && snakeEnemy.position.y < GAME_HEIGHT + 100)) {
                snakeEnemy.update(deltaTime);
                snakeEnemy.draw(ctx);
                //collision(player & snake)
                if ((player.position.x + player.width >= snakeEnemy.colision.x && player.position.x + player.width <= snakeEnemy.colision.x + snakeEnemy.width) || (player.position.x <= snakeEnemy.colision.x + snakeEnemy.width && player.position.x >= snakeEnemy.colision.x)) {
                    if ((player.position.y + player.height >= snakeEnemy.colision.y && player.position.y + player.height <= snakeEnemy.colision.y + snakeEnemy.height) || (player.position.y <= snakeEnemy.colision.y + snakeEnemy.height && player.position.y >= snakeEnemy.colision.y)) {
                        Loose();
                    }
                }
            }
            else {
                if (snakeEnemies.indexOf(snakeEnemy) == 1) snakeEnemies.pop();
                else snakeEnemies.shift();//' snakeEnemy = new Snake(enemiesImages[0]) ' doesn`t work
                snakeEnemies.push(new Snake(enemiesImages[0]));
            }
        });
        vulture.draw(ctx);
        vulture.update(ctx);
        //NIGHTMODE
        if (surviveTime >= 60 * nightCounter) {
            IsNightMode = true;
            nightCounter++;
        }
        if (IsNightMode) {
            canvas.style.backgroundImage = "url('images/map_night.png')";
            ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            player.draw(ctx);
            if (player.position.x + player.width + 150 >= fruit.position.x && player.position.x - 150 <= fruit.position.x) {
                if (player.position.y + player.height + 150 >= fruit.position.y && player.position.y - 150 <= fruit.position.y) {
                    fruit.draw(ctx);
                }
            }
            if (player.position.x + player.width + 150 >= vulture.colision.x && player.position.x - 150 <= vulture.colision.x) {
                if (player.position.y + player.height + 150 >= vulture.colision.y && player.position.y - 150 <= vulture.colision.y) {
                    vulture.draw(ctx);
                }
            }
            snakeEnemies.forEach(snakeEnemy => {
                if (player.position.x + player.width + 150 >= snakeEnemy.colision.x && player.position.x - 150 <= snakeEnemy.colision.x) {
                    if (player.position.y + player.height + 150 >= snakeEnemy.colision.y && player.position.y - 150 <= snakeEnemy.colision.y) {
                        snakeEnemy.draw(ctx);
                    }
                }
            });
            staticObjects.forEach(obj => {
                if (player.position.x + player.width + 150 >= obj.position.x && player.position.x - 150 <= obj.position.x) {
                    if (player.position.y + player.height + 150 >= obj.position.y && player.position.y - 150 <= obj.position.y) {
                        obj.draw(ctx);
                    }
                }
            });

            if (surviveTime >= 60 * (nightCounter - 1) + 15) {
                IsNightMode = false;
            }
        }
        else {
            canvas.style.backgroundImage = "url('images/map.png')";
        }
        //SecondsCounter   mb it can be changed on: setInterval(() => { player.hp -= 5 }, 1000);
        if ((new Date() - secDelta) / 1000 >= 1) {
            player.hp -= 5;
            secDelta = new Date();
        }
    }
    else {
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        player.draw(ctx);
        ctx.font = `48px serif`;
        ctx.fillStyle = "black";
        ctx.fillText("Press 'Space' to start game", GAME_WIDTH / 6, GAME_HEIGHT / 6);
    }

    requestAnimationFrame(gameLoop);//https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
}

function StartGame() {
    player = new Player(GAME_WIDTH, GAME_HEIGHT, imghero);
    snakeEnemies = [];
    snakeEnemies.push(new Snake(enemiesImages[0]), new Snake(enemiesImages[0]));

    staticObjects = [];
    staticObjects.push(new Objects(objectsImages[random(0, objectsImages.length)]),
        new Objects(objectsImages[random(0, objectsImages.length)]),
        new Objects(objectsImages[random(0, objectsImages.length)]),
        new Objects(objectsImages[random(0, objectsImages.length)]),
        new Objects(objectsImages[random(0, objectsImages.length)]),
        new Objects(objectsImages[random(0, objectsImages.length)]));
    vulture = new Vulture(enemiesImages[1]);
    fruit = new Objects(fruitsImages[random(0, fruitsImages.length)]);
    topTimeBar.innerHTML = `${topTimeScore} seconds`;
    startGameTime = new Date();
    secDelta = new Date();
    nightCounter = 1;
    IsNightMode = false;
    IsGameStarted = true;
}

function Loose() {
    IsGameStarted = false;
    //top score check
    if (topTimeScore < surviveTime) {
        topTimeScore = surviveTime;
    }
}


//LAUNCH
new InputHandler();
gameLoop();