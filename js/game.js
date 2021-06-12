'use strict';

//CONSTS:
const canvas = document.getElementById('gameScreen');
const ctx = canvas.getContext('2d');
const db = window.openDatabase('UsersScores', '1.0', 'UsersScores', 42880);
const gameWidth = 800;
const gameHeight = 600;
const startPos = 0;
const defaultParam = 0;
const defaultObjSize = 40;
const imghero = document.getElementById('hero');
const enemiesImages = [
  document.getElementById('snake'),
  document.getElementById('vulture'),
];
const objectsImages = [
  document.getElementById('rock'),
  document.getElementById('palm'),
  document.getElementById('cactus'),
];
const fruitsImages = [
  document.getElementById('baobab'),
  document.getElementById('pumpkin'),
  document.getElementById('amaranth'),
];
const timeTextBar = document.getElementById('timescore');
const topTimeBar = document.getElementById('toptimescore');
const nameInput = document.getElementById('userName');
const scorePlaces = [
  document.getElementById('firstPlace'),
  document.getElementById('secondPlace'),
  document.getElementById('thirdPlace'),
  document.getElementById('fourthPlace'),
  document.getElementById('fifthPlace'),
  document.getElementById('sixthPlace'),
  document.getElementById('seventhPlace'),
  document.getElementById('eighthPlace'),
  document.getElementById('ninthPlace'),
  document.getElementById('tenthPlace'),
];

//CLASES:
class Player {
  constructor(gameWidth, gameHeight, image) {
    const bottomPadle = 10;
    this.width = defaultObjSize;
    this.height = defaultObjSize;
    this.image = image;
    this.maxSpeed = 3;
    this.speed = { x: defaultParam, y: defaultParam };
    this.position = {
      x: gameWidth / 2 - this.width / 2,
      y: gameHeight - this.height - bottomPadle,
    };
    this.colision = this.position;
    this.lookForward = true;
    this.lookRight = true;
    this.healthPoints = 100;
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
    this.speed.x = defaultParam;
  }
  stopY() {
    this.speed.y = defaultParam;
  }

  draw(ctx) {
    const mc = modelCutter(this.lookForward, this.lookRight); // x pos for cut image (y = 0 - default)
    const xMiddlePos = this.position.x - this.width / 2;
    const imageCutWidth = defaultObjSize * 2;
    const imageCutHeight = defaultObjSize;
    ctx.drawImage(
      this.image,
      mc,
      0,
      this.width,
      this.height,
      xMiddlePos,
      this.position.y,
      imageCutWidth,
      imageCutHeight
    );
    hpBarPainter(ctx, this.healthPoints, this.position.x, this.position.y);
  }
  update(deltaTime) {
    if (!deltaTime) return;
    this.position.x += this.speed.x;
    this.position.y += this.speed.y;
    if (this.position.x < startPos) this.position.x = startPos;
    else if (this.position.x > gameWidth - this.width)
      this.position.x = gameWidth - this.width;

    if (this.position.y < startPos) this.position.y = startPos;
    else if (this.position.y > gameHeight - this.height)
      this.position.y = gameHeight - this.height;

    if (this.healthPoints <= 0) loose();

    this.colision = this.position;
  }
}

//MUTABLE GLOBAL SCOPE
let player = new Player(gameWidth, gameHeight, imghero);
let snakeEnemies = [];
let lastTime = 0;
let surviveTime = 0;
let topTimeScore = 0;
let startGameTime;
let isGameStarted = false;
let isNightMode = false;
let nightCounter;
let staticObjects = [];
let fruit;
let vulture;
let secDelta;
let scoreRating = [];

class InputHandler {
  constructor() {
    document.addEventListener('keydown', (event) => {
      //pressed buttons
      moveController(player, event.keyCode, true);
      if (event.keyCode === 32 && !isGameStarted) startGame();
    });
    document.addEventListener('keyup', (event) => {
      //unpressed buttons
      moveController(player, event.keyCode, false);
    });
  }
}

class Enemy {
  constructor(image) {
    this.name = this.__proto__.constructor.name;
    this.image = image;
    this.width = defaultObjSize;
    this.height = defaultObjSize;
    this.maxSpeed = 3;
    this.speed = { x: defaultParam, y: defaultParam };
    this.colision = {};
  }

  draw(ctx) {
    ctx.translate(this.position.x, this.position.y); //move system to spawn position
    ctx.rotate((this.degree * Math.PI) / 180); //rotate system
    ctx.drawImage(this.image, startPos, startPos, this.width, this.height); //draw enemy
    ctx.setTransform(1, 0, 0, 1, 0, 0); //make a system transofrm by default
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
    super(image); //+ config from `Enemy` class
    this.spawn = randomSnakeSpawn(this.width, this.height);
    this.degree = this.spawn.degree;
    this.side = this.spawn.side;
    this.position = {
      x: this.spawn.x,
      y: this.spawn.y,
    };
    this.speed.x = this.maxSpeed * this.spawn.speed.x;
    this.speed.y = this.maxSpeed * this.spawn.speed.y;
    this.colision = {
      x: this.position.x + this.spawn.collision.width * this.width,
      y: this.position.y + this.spawn.collision.height * this.height,
    };
  }
}

class Vulture extends Enemy {
  constructor(image) {
    super(image);
    this.maxSpeed = 1;
    this.position = {
      x: random(this.width, gameWidth - this.width),
      y: random(this.height, gameHeight - this.height),
    };
    this.speed = { x: 1, y: 1 };
    this.degree = 90;
  }

  update(deltaTime) {
    if (this.speed.x > 0 && this.speed.y > 0) {
      this.degree = 90;
      this.colision = {
        x: this.position.x - this.width,
        y: this.position.y,
      };
    } else if (this.speed.x > 0 && this.speed.y < 0) {
      this.degree = 0;
      this.colision = {
        x: this.position.x,
        y: this.position.y,
      };
    } else if (this.speed.x < 0 && this.speed.y > 0) {
      this.degree = 180;
      this.colision = {
        x: this.position.x - this.width,
        y: this.position.y - this.height,
      };
    } else if (this.speed.x < 0 && this.speed.y < 0) {
      this.degree = 270;
      this.colision = {
        x: this.position.x,
        y: this.position.y - this.height,
      };
    }
    //borders check
    if (this.colision.x > gameWidth || this.colision.x < -this.height) {
      this.speed.x = -this.speed.x;
    }
    if (this.colision.y > gameHeight || this.colision.y < -this.width) {
      this.speed.y = -this.speed.y;
    }

    super.update(deltaTime);
  }
}

class Objects {
  constructor(image) {
    this.image = image;
    this.width = defaultObjSize;
    this.height = defaultObjSize;
    this.position = {
      x: random(startPos, gameWidth - this.width),
      y: random(startPos, gameHeight - this.height),
    };
    this.colision = this.position;
  }
  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }
}

class User {
  constructor(name, score) {
    this.name = name;
    this.score = score;
  }
  newScore() {
    if (db) {
      db.transaction((transaction) => {
        const sqlRequest = `INSERT INTO scores (name, score) VALUES ('${this.name}', '${this.score}')`;
        transaction.executeSql(sqlRequest);
      });
    }
  }
  updateScore() {
    if (db) {
      db.transaction((transaction) => {
        const sqlRequest = `UPDATE scores SET score=${this.score} WHERE name='${this.name}'`;
        transaction.executeSql(sqlRequest);
      });
    }
  }
  loadTopScore() {
    if (db) {
      db.transaction((transaction) => {
        const sqlRequest = `SELECT * FROM scores WHERE name='${this.name}'`;
        transaction.executeSql(sqlRequest, undefined, (transaction, result) => {
          if (result) this.score = result.rows.item(0).score;
        });
      });
    }
  }
}

const userProfile = new User('unknown', defaultParam);

//FUNCTIONS:
function random(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function randomSnakeSpawn(objWidth, objHeight) {
  //generate spawn position+side of enemy(snake)
  const numIncrease = 1;
  const numReduce = -1;
  const numStatic = 0;
  const sides = [
    //0-top 1-right 2-bottom 3-left
    {
      side: 'top',
      x: random(objWidth, gameWidth - objWidth),
      y: startPos,
      degree: 180,
      speed: {
        x: numStatic,
        y: numIncrease
      },
      collision: {
        width: numReduce,
        height: numReduce
      }
    },
    {
      side: 'right',
      x: gameWidth,
      y: random(objHeight, gameHeight - objHeight),
      degree: 270,
      speed: {
        x: numReduce,
        y: numStatic
      },
      collision: {
        width: numStatic,
        height: numReduce
      }
    },
    {
      side: 'bottom',
      x: random(objWidth, gameWidth - objWidth),
      y: gameHeight,
      degree: 0,
      speed: {
        x: numStatic,
        y: numReduce
      },
      collision: {
        width: numStatic,
        height: numStatic
      }
    },
    {
      side: 'left',
      x: startPos,
      y: random(objHeight, gameHeight - objHeight),
      degree: 90,
      speed: {
        x: numIncrease,
        y: numStatic
      },
      collision: {
        width: numReduce,
        height: numStatic
      }
    },
  ];
  return sides[random(0, 4)];
}

function randomObjImage() {
  return new Objects(objectsImages[random(0, objectsImages.length)]);
}

function paddleStop(player, key) {
  if (key.axis === 'x') {
    if (player.speed.x < 0 && key.dir === '-') player.stopX();
    if (player.speed.x > 0 && key.dir === '+') player.stopX();
  } else {
    if (player.speed.y < 0 && key.dir === '-') player.stopY();
    if (player.speed.y > 0 && key.dir === '+') player.stopY();
  }
}

function paddleMove(player, key) {
  if (key.axis === 'x') {
    if (key.dir === '-') player.moveLeft();
    else player.moveRight();
  } else if (key.dir === '-') player.moveUp();
  else player.moveDown();
}

function moveController(player, keyCode, state) {
  const keys = [//rename array + rename 'key'
    { key: 37, axis: 'x', dir: '-' },
    { key: 39, axis: 'x', dir: '+' }, // 37-arrow left || 39-arrow right
    { key: 65, axis: 'x', dir: '-' },
    { key: 68, axis: 'x', dir: '+' }, // 65-A || 68-D
    { key: 38, axis: 'y', dir: '-' },
    { key: 40, axis: 'y', dir: '+' }, // 38-arrow up || 40-arrow down
    { key: 87, axis: 'y', dir: '-' },
    { key: 83, axis: 'y', dir: '+' }, // 87-W || 83-S
  ];
  for (const val of keys) {
    if (val.key === keyCode) {
      if (state) paddleMove(player, val);
      else paddleStop(player, val);
    }
  }
}

function colorHpCheker(healthPoints) {
  const maxhealthPoints = 100;
  const halfhealthPoints = maxhealthPoints / 2;
  const quarterhealthPoints = maxhealthPoints / 4;
  let color;
  if (healthPoints > halfhealthPoints) color = 'green';
  else if (healthPoints < quarterhealthPoints) color = 'red';
  else color = 'yellow';
  return color;
}

function hpBarPainter(ctx, healthPoints, posX, posY) {
  const barHeight = 10;
  const distToBar = 15;
  const barWidth = healthPoints / 2.5;
  ctx.fillStyle = colorHpCheker(healthPoints);
  ctx.fillRect(posX, posY - distToBar, barWidth, barHeight);
}

function modelCutter(lookForward, lookRight) {
  const modelViews = [
    { F: true, R: true, cutSize: 0 },
    { F: true, R: false, cutSize: 40 },
    { F: false, R: true, cutSize: 80 },
    { F: false, R: false, cutSize: 120 },
  ];
  for (const side of modelViews) {
    if (side.F === lookForward && side.R === lookRight) return side.cutSize;
  }
}

function between(begin, end, axis) { return axis >= begin && axis <= end; }

function nightDistDraw(player, obj) {
  const distance = 150;
  const { x, y } = player.position;
  const { x: objX, y: objY } = obj.position;

  if (!between(x - distance, x + player.width + distance, objX)) return;
  if (!between(y - distance, y + player.height + distance, objY)) return;

  obj.draw(ctx);
}

function collisionCheck(obj1, obj2, func, cut) {
  const { x: obj1X, y: obj1Y } = obj1.colision;
  const { x: obj2X, y: obj2Y } = obj2.colision;

  const xLeftCheck = between(obj2X + cut, obj2X + obj2.width, obj1X + obj1.width);
  const xRightCheck = between(obj2X, obj2X + obj2.width - cut, obj1X);
  const yUpCheck = between(obj2Y, obj2Y + obj2.height, obj1Y + obj1.height);
  const yBottomCheck = between(obj2Y, obj2Y + obj2.height, obj1Y);

  if (xLeftCheck || xRightCheck) {
    if (yUpCheck || yBottomCheck) {
      func();
    }
  }
}

function createTable() {
  db.transaction((transaction) => {
    const sqlRequest = 'CREATE TABLE scores(name VARCHAR(50), score INT(10))';
    transaction.executeSql(sqlRequest, undefined);
  });
}

/*function removeTable() {
  db.transaction((transaction) => {
    const sqlRequest = 'DROP TABLE scores';
    transaction.executeSql(
      sqlRequest,
      undefined,
      () => {
        console.log('TABLE removed succesfully');
      },
      () => {
        console.log('TABLE can`t be removed');
      }
    );
  });
}

function removeRowByName(name) {
  db.transaction((transaction) => {
    const sqlRequest = `DELETE FROM scores WHERE name='${name}'`;
    transaction.executeSql(
      sqlRequest,
      undefined,
      () => {
        console.log('ROW removed succesfully');
      },
      () => {
        console.log('ROW can`t be removed');
      }
    );
  });
}*/

function getDataBase() {
  const baseArray = [];
  let counter = 1;
  const numOfLeaders = 10;
  const maxNameLength = 12;
  db.transaction((transaction) => {
    const sqlRequest = 'SELECT * FROM scores ORDER BY score DESC';
    transaction.executeSql(
      sqlRequest,
      undefined,
      (transaction, result) => {
        if (result.rows.length) {
          for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            baseArray.push({ name: row.name, score: row.score });
            //FILL LEADERBOARD
            if (counter <= numOfLeaders && row.name !== 'unknown') {
              scorePlaces[
                counter - 1
              ].innerHTML = `#${counter} ${row.name.slice(
                0,
                maxNameLength
              )} - ${row.score} sec`;
              counter++;
            }
          }
        }
      },
      (transaction, err) => {
        console.log(err);
      }
    );
  });
  return baseArray;
}

function playerDamage(msDivine) {
  const damagePoints = 5;

  if ((new Date() - secDelta) / msDivine >= 1) {
    player.healthPoints -= damagePoints;
    secDelta = new Date();
  }
}

function timeScaner(timestamp, msDivine) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  surviveTime = Math.floor((new Date() - startGameTime) / msDivine);
  timeTextBar.innerHTML = `${surviveTime} seconds`;
  return deltaTime;
}

function nightMode() {
  const minBorder = 60;
  const changeDelay = 15;
  const urlBG = {
    day: 'url("images/map.png")',
    night: 'url("images/map_night.png")',
  };

  if (surviveTime >= minBorder * nightCounter) {
    isNightMode = true;
    nightCounter++;
  }
  if (isNightMode) {
    canvas.style.backgroundImage = urlBG.night;
    ctx.clearRect(startPos, startPos, gameWidth, gameHeight);
    player.draw(ctx);
    nightDistDraw(player, fruit);
    nightDistDraw(player, vulture);
    snakeEnemies.forEach((snakeEnemy) => {
      nightDistDraw(player, snakeEnemy);
    });
    staticObjects.forEach((obj) => {
      nightDistDraw(player, obj);
    });

    if (surviveTime >= minBorder * (nightCounter - 1) + changeDelay) {
      isNightMode = false;
    }
  } else {
    canvas.style.backgroundImage = urlBG.day;
  }
}

function pauseUI() {
  const textFont = '48px serif';
  const blackStyle = 'black';
  const textDivine = 6;

  ctx.clearRect(startPos, startPos, gameWidth, gameHeight);
  player.draw(ctx);
  ctx.font = textFont;
  ctx.fillStyle = blackStyle;
  ctx.fillText(
    'Press "Space" to start game',
    gameWidth / textDivine,
    gameHeight / textDivine
  );
}

function collisionDetectioner() {
  const maxhealthPoints = 100;
  const healPoints = 10;
  const defaultColBox = 0;
  const objColBox = 15;

  collisionCheck(
    player,
    fruit,
    () => {
      fruit = new Objects(fruitsImages[random(0, fruitsImages.length)]);
      player.healthPoints += healPoints;
      if (player.healthPoints > maxhealthPoints) player.healthPoints = maxhealthPoints;
    },
    defaultColBox
  );
  collisionCheck(
    player,
    vulture,
    () => {
      loose();
    },
    defaultColBox
  );
  staticObjects.forEach((obj) => {
    obj.draw(ctx);
    collisionCheck(
      player,
      obj,
      () => {
        player.position.x -= player.speed.x;
        player.position.y -= player.speed.y;
      },
      objColBox
    );
    snakeEnemies.forEach((snakeEnemy) => {
      collisionCheck(
        snakeEnemy,
        obj,
        () => {
          if (snakeEnemies.indexOf(snakeEnemy) === 1) snakeEnemies.pop();
          else snakeEnemies.shift();
          snakeEnemies.push(new Snake(enemiesImages[0]));
        },
        defaultColBox
      );
    });
  });
}

function checkSnakeOutOfBounds(snakeEnemy, deltaTime) {
  const bgZone = 100;

  if (
    snakeEnemy.position.x > -bgZone &&
    snakeEnemy.position.x < gameWidth + bgZone &&
    snakeEnemy.position.y > -bgZone &&
    snakeEnemy.position.y < gameHeight + bgZone
  ) {
    snakeEnemy.update(deltaTime);
    snakeEnemy.draw(ctx);
    collisionCheck(
      player,
      snakeEnemy,
      () => {
        loose();
      },
      0
    );
  } else {
    if (snakeEnemies.indexOf(snakeEnemy) === 1) snakeEnemies.pop();
    else snakeEnemies.shift();
    snakeEnemies.push(new Snake(enemiesImages[0]));
  }
}

function userScoreUpdate() {
  nameInput.readOnly = true;
  topTimeBar.innerHTML = `${topTimeScore} seconds`;
  if (nameInput.value !== '') userProfile.name = nameInput.value;
  if (!scoreRating.some((user) => user.name === userProfile.name)) {
    userProfile.score = 0;
    userProfile.newScore();
  }
  if (userProfile.name !== 'unknown') {
    userProfile.loadTopScore();
    topTimeScore = userProfile.score;
  }
}

function gameLoop(timestamp) {
  const msDivine = 1000;
  if (isGameStarted) {
    const deltaTime = timeScaner(timestamp, msDivine);

    ctx.clearRect(startPos, startPos, gameWidth, gameHeight);
    player.update(deltaTime);
    vulture.update(ctx);

    collisionDetectioner();

    snakeEnemies.forEach((snakeEnemy) => {
      checkSnakeOutOfBounds(snakeEnemy, deltaTime);
    });

    player.draw(ctx);
    vulture.draw(ctx);
    fruit.draw(ctx);

    nightMode();
    playerDamage(msDivine);
  } else {
    pauseUI();
  }

  requestAnimationFrame(gameLoop); //https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
}

function startGame() {
  player = new Player(gameWidth, gameHeight, imghero);
  snakeEnemies = [];
  snakeEnemies.push(new Snake(enemiesImages[0]), new Snake(enemiesImages[0]));
  staticObjects = [];
  staticObjects.push(
    randomObjImage(),
    randomObjImage(),
    randomObjImage(),
    randomObjImage(),
    randomObjImage(),
    randomObjImage()
  );
  vulture = new Vulture(enemiesImages[1]);
  fruit = new Objects(fruitsImages[random(0, fruitsImages.length)]);
  startGameTime = new Date();
  secDelta = new Date();
  nightCounter = 1;
  isNightMode = false;
  isGameStarted = true;
  userScoreUpdate();
}

function loose() {
  isGameStarted = false;
  nameInput.readOnly = false;
  //top score check
  if (topTimeScore < surviveTime) {
    topTimeScore = surviveTime;
    userProfile.score = topTimeScore;
    userProfile.updateScore();
    scoreRating = getDataBase();
  }
}

//LAUNCH
new InputHandler();
try {
  createTable();
  scoreRating = getDataBase();
} catch (err) {
  console.log('DATABASE Error:' + err);
}
gameLoop();
