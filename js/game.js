"use strict";

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
			y: gameHeight - this.height - 10,
		};
		this.colision = this.position;
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
		const mc = ModelCutter(this.lookForward, this.lookRight); // x pos for cut image (y = 0 - default)
		const xMiddlePos = this.position.x - this.width / 2;
		ctx.drawImage(this.image, mc, 0, this.width, this.height, xMiddlePos, this.position.y, 80, 40);
		HpBarPainter(ctx, this.hp, this.position.x, this.position.y);
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

		this.colision = this.position;
	}
}

class InputHandler {
	constructor() {
		document.addEventListener("keydown", (event) => {
			//pressed buttons
			MoveController(player, event.keyCode, true);
			if (event.keyCode === 32 && !IsGameStarted) StartGame();
		});
		document.addEventListener("keyup", (event) => {
			//unpressed buttons
			MoveController(player, event.keyCode, false);
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
		ctx.translate(this.position.x, this.position.y); //move system to spawn position
		ctx.rotate((this.degree * Math.PI) / 180); //rotate system
		ctx.drawImage(this.image, 0, 0, this.width, this.height); //draw enemy
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
		switch (this.side) {
			case "top":
				this.speed.y = this.maxSpeed;
				this.colision = {
					x: this.position.x - this.width,
					y: this.position.y - this.height,
				};
				break;
			case "right":
				this.speed.x = -this.maxSpeed;
				this.colision = {
					x: this.position.x,
					y: this.position.y - this.height,
				};
				break;
			case "bottom":
				this.speed.y = -this.maxSpeed;
				this.colision = {
					x: this.position.x,
					y: this.position.y,
				};
				break;
			case "left":
				this.speed.x = this.maxSpeed;
				this.colision = {
					x: this.position.x - this.width,
					y: this.position.y,
				};
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
			y: random(this.height, GAME_HEIGHT - this.height),
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
			y: random(0, GAME_HEIGHT - this.height),
		};
		this.colision = this.position;
	}
	draw(ctx) {
		ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
	}
}

class User {
	constructor(name, score) {
		this.name = name;
		this.score = score;
	}
	NewScore() {
		if (db) {
			db.transaction((transaction) => {
				let sqlRequest = `INSERT INTO scores (name, score) VALUES ('${this.name}', '${this.score}')`;
				transaction.executeSql(sqlRequest);
			});
		}
	}
	UpdateScore() {
		if (db) {
			db.transaction((transaction) => {
				let sqlRequest = `UPDATE scores SET score=${this.score} WHERE name='${this.name}'`;
				transaction.executeSql(sqlRequest);
			});
		}
	}
	LoadTopScore() {
		if (db) {
			db.transaction((transaction) => {
				let sqlRequest = `SELECT * FROM scores WHERE name='${this.name}'`;
				transaction.executeSql(sqlRequest, undefined, (transaction, result) => {
					if (result) topTimeScore = result.rows.item(0).score;
				});
			});
		}
	}
}

//CONSTS:
const canvas = document.getElementById("gameScreen");
const ctx = canvas.getContext("2d");
const db = window.openDatabase("UsersScores", "1.0", "UsersScores", 42880);
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const imghero = document.getElementById("hero");
const enemiesImages = [document.getElementById("snake"), document.getElementById("vulture")];
const objectsImages = [
	document.getElementById("rock"),
	document.getElementById("palm"),
	document.getElementById("cactus"),
];
const fruitsImages = [
	document.getElementById("baobab"),
	document.getElementById("pumpkin"),
	document.getElementById("amaranth"),
];
const TimeTextBar = document.getElementById("timescore");
const topTimeBar = document.getElementById("toptimescore");
const nameInput = document.getElementById("userName");
const ScorePlaces = [
	document.getElementById("firstPlace"),
	document.getElementById("secondPlace"),
	document.getElementById("thirdPlace"),
	document.getElementById("fourthPlace"),
	document.getElementById("fifthPlace"),
	document.getElementById("sixthPlace"),
	document.getElementById("seventhPlace"),
	document.getElementById("eighthPlace"),
	document.getElementById("ninthPlace"),
	document.getElementById("tenthPlace"),
];

let player = new Player(GAME_WIDTH, GAME_HEIGHT, imghero);
let UserProfile = new User("unknown", 0);
let snakeEnemies = [];
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
let ScoreRating = [];

//FUNCTIONS:
function random(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}

function randomSnakeSpawn(objWidth, objHeight) {
	//generate spawn position+side of enemy(snake)
	const sides = [
		//0-top 1-right 2-bottom 3-left
		{
			side: "top",
			x: random(objWidth, GAME_WIDTH - objWidth),
			y: 0,
			degree: 180,
		},
		{
			side: "right",
			x: GAME_WIDTH,
			y: random(objHeight, GAME_HEIGHT - objHeight),
			degree: 270,
		},
		{
			side: "bottom",
			x: random(objWidth, GAME_WIDTH - objWidth),
			y: GAME_HEIGHT,
			degree: 0,
		},
		{
			side: "left",
			x: 0,
			y: random(objHeight, GAME_HEIGHT - objHeight),
			degree: 90,
		},
	];
	return sides[random(0, 4)];
}

function randomObjImage() {
	return new Objects(objectsImages[random(0, objectsImages.length)]);
}

function PaddleStop(player, key) {
	if (key.axe === "x") {
		if (player.speed.x < 0 && key.dir === "-") player.stopX();
		if (player.speed.x > 0 && key.dir === "+") player.stopX();
	} else {
		if (player.speed.y < 0 && key.dir === "-") player.stopY();
		if (player.speed.y > 0 && key.dir === "+") player.stopY();
	}
}

function PaddleMove(player, key) {
	if (key.axe === "x") {
		if (key.dir === "-") player.moveLeft();
		else player.moveRight();
	} else {
		if (key.dir === "-") player.moveUp();
		else player.moveDown();
	}
}

function MoveController(player, keyCode, state) {
	const Keys = [
		{ key: 37, axe: "x", dir: "-" },
		{ key: 39, axe: "x", dir: "+" }, // 37-arrow left || 39-arrow right
		{ key: 65, axe: "x", dir: "-" },
		{ key: 68, axe: "x", dir: "+" }, // 65-A || 68-D
		{ key: 38, axe: "y", dir: "-" },
		{ key: 40, axe: "y", dir: "+" }, // 38-arrow up || 40-arrow down
		{ key: 87, axe: "y", dir: "-" },
		{ key: 83, axe: "y", dir: "+" }, // 87-W || 83-S
	];
	Keys.map((key) => {
		if (key.key === keyCode) {
			if (state) PaddleMove(player, key);
			else PaddleStop(player, key);
		}
	});
}

function ColorHPCheker(hp) {
	const maxHp = 100;
	let color;
	if (hp > maxHp / 2) color = "green";
	else if (hp < maxHp / 4) color = "red";
	else color = "yellow";
	return color;
}

function HpBarPainter(ctx, hp, posX, posY) {
	const barHeight = 10;
	const barWidth = hp / 2.5;
	ctx.fillStyle = ColorHPCheker(hp);
	ctx.fillRect(posX, posY - 15, barWidth, barHeight);
}

function ModelCutter(lookForward, lookRight) {
	const ModelViews = [
		{ F: true, R: true, cutSize: 0 },
		{ F: true, R: false, cutSize: 40 },
		{ F: false, R: true, cutSize: 80 },
		{ F: false, R: false, cutSize: 120 },
	];
	for (let side of ModelViews) {
		if (side.F === lookForward && side.R === lookRight) return side.cutSize;
	}
}

function NightDistDraw(player, obj) {
	const distance = 150;
	if (player.position.x + player.width + distance >= obj.position.x && player.position.x - distance <= obj.position.x) {
		if (
			player.position.y + player.height + distance >= obj.position.y &&
			player.position.y - distance <= obj.position.y
		) {
			obj.draw(ctx);
		}
	}
}

function CollisionCheck(obj1, obj2, func, cut) {
	const xLeftCheck =
		obj1.colision.x + obj1.width >= obj2.colision.x + cut &&
		obj1.colision.x + obj1.width <= obj2.colision.x + obj2.width - cut;
	const xRightCheck = obj1.colision.x <= obj2.colision.x + obj2.width - cut && obj1.colision.x + cut >= obj2.colision.x;
	const yUpCheck =
		obj1.colision.y + obj1.height >= obj2.colision.y && obj1.colision.y + obj1.height <= obj2.colision.y + obj2.height;
	const yBottomCheck = obj1.colision.y <= obj2.colision.y + obj2.height && obj1.colision.y >= obj2.colision.y;
	if (xLeftCheck || xRightCheck) {
		if (yUpCheck || yBottomCheck) {
			func();
		}
	}
}

function CreateTable() {
	db.transaction((transaction) => {
		const sqlRequest = "CREATE TABLE scores(name VARCHAR(50), score INT(10))";
		transaction.executeSql(sqlRequest, undefined);
	});
}

function RemoveTable() {
	db.transaction((transaction) => {
		const sqlRequest = "DROP TABLE scores";
		transaction.executeSql(
			sqlRequest,
			undefined,
			() => {
				console.log("TABLE removed succesfully");
			},
			() => {
				console.log("TABLE can`t be removed");
			}
		);
	});
}

function RemoveRowByName(name) {
	db.transaction((transaction) => {
		const sqlRequest = `DELETE FROM scores WHERE name='${name}'`;
		transaction.executeSql(
			sqlRequest,
			undefined,
			() => {
				console.log("ROW removed succesfully");
			},
			() => {
				console.log("ROW can`t be removed");
			}
		);
	});
}

function GetDataBase() {
	let BaseArray = [];
	let counter = 1;
	const numOfLeaders = 10;
	const maxNameLength = 12;
	db.transaction((transaction) => {
		const sqlRequest = "SELECT * FROM scores ORDER BY score DESC";
		transaction.executeSql(
			sqlRequest,
			undefined,
			(transaction, result) => {
				if (result.rows.length) {
					for (let i = 0; i < result.rows.length; i++) {
						let row = result.rows.item(i);
						BaseArray.push({ name: row.name, score: row.score });
						//FILL LEADERBOARD
						if (counter <= numOfLeaders && row.name !== "unknown") {
							ScorePlaces[counter - 1].innerHTML = `#${counter} ${row.name.slice(0, maxNameLength)} - ${row.score} sec`;
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
	return BaseArray;
}

function gameLoop(timestamp) {
	const textFont = "48px serif";
	const blackStyle = "black";
	const maxHp = 100;
	const healPoints = 10;
	const damagePoints = 5;
	const minBorder = 60;
	const msDivine = 1000;
	const bgZone = 100;
	const urlBG = {
		day: "url('images/map.png')",
		night: "url('images/map_night.png')",
	};
	if (IsGameStarted) {
		let deltaTime = timestamp - lastTime;
		lastTime = timestamp;

		ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
		player.update(deltaTime);

		surviveTime = Math.floor((new Date() - startGameTime) / msDivine);
		TimeTextBar.innerHTML = `${surviveTime} seconds`;
		fruit.draw(ctx);
		CollisionCheck(
			player,
			fruit,
			() => {
				fruit = new Objects(fruitsImages[random(0, fruitsImages.length)]);
				player.hp += healPoints;
				if (player.hp > maxHp) player.hp = maxHp;
			},
			0
		);
		CollisionCheck(
			player,
			vulture,
			() => {
				Loose();
			},
			0
		);

		staticObjects.forEach((obj) => {
			obj.draw(ctx);
			CollisionCheck(
				player,
				obj,
				() => {
					player.position.x -= player.speed.x;
					player.position.y -= player.speed.y;
				},
				15
			);
			snakeEnemies.forEach((snakeEnemy) => {
				CollisionCheck(
					snakeEnemy,
					obj,
					() => {
						if (snakeEnemies.indexOf(snakeEnemy) === 1) snakeEnemies.pop();
						else snakeEnemies.shift(); //' snakeEnemy = new Snake(enemiesImages[0]) ' doesn`t work
						snakeEnemies.push(new Snake(enemiesImages[0]));
					},
					0
				);
			});
		});
		player.draw(ctx);
		snakeEnemies.forEach((snakeEnemy) => {
			//check on existing in borders
			if (
				snakeEnemy.position.x > -bgZone &&
				snakeEnemy.position.x < GAME_WIDTH + bgZone &&
				snakeEnemy.position.y > -bgZone &&
				snakeEnemy.position.y < GAME_HEIGHT + bgZone
			) {
				snakeEnemy.update(deltaTime);
				snakeEnemy.draw(ctx);
				CollisionCheck(
					player,
					snakeEnemy,
					() => {
						Loose();
					},
					0
				);
			} else {
				if (snakeEnemies.indexOf(snakeEnemy) === 1) snakeEnemies.pop();
				else snakeEnemies.shift();
				snakeEnemies.push(new Snake(enemiesImages[0]));
			}
		});
		vulture.draw(ctx);
		vulture.update(ctx);
		//NIGHTMODE
		if (surviveTime >= minBorder * nightCounter) {
			IsNightMode = true;
			nightCounter++;
		}
		if (IsNightMode) {
			canvas.style.backgroundImage = urlBG.night;
			ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
			player.draw(ctx);
			NightDistDraw(player, fruit);
			NightDistDraw(player, vulture);
			snakeEnemies.forEach((snakeEnemy) => {
				NightDistDraw(player, snakeEnemy);
			});
			staticObjects.forEach((obj) => {
				NightDistDraw(player, obj);
			});

			if (surviveTime >= minBorder * (nightCounter - 1) + 15) {
				IsNightMode = false;
			}
		} else {
			canvas.style.backgroundImage = urlBG.day;
		}
		//SecondsCounter   mb it can be changed on: setInterval(() => { player.hp -= 5 }, 1000);
		if ((new Date() - secDelta) / msDivine >= 1) {
			player.hp -= damagePoints;
			secDelta = new Date();
		}
	} else {
		ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
		player.draw(ctx);
		ctx.font = textFont;
		ctx.fillStyle = blackStyle;
		ctx.fillText("Press 'Space' to start game", GAME_WIDTH / 6, GAME_HEIGHT / 6);
	}

	requestAnimationFrame(gameLoop); //https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
}

function StartGame() {
	nameInput.readOnly = true;
	player = new Player(GAME_WIDTH, GAME_HEIGHT, imghero);
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
	topTimeBar.innerHTML = `${topTimeScore} seconds`;
	startGameTime = new Date();
	secDelta = new Date();
	nightCounter = 1;
	IsNightMode = false;
	IsGameStarted = true;
	if (nameInput.value !== "") UserProfile.name = nameInput.value;
	if (!ScoreRating.some((user) => user.name === UserProfile.name)) {
		UserProfile.score = 0;
		UserProfile.NewScore();
	}
	if (UserProfile.name !== "unknown") {
		UserProfile.LoadTopScore();
		topTimeScore = UserProfile.score;
	}
}

function Loose() {
	IsGameStarted = false;
	nameInput.readOnly = false;
	//top score check
	if (topTimeScore < surviveTime) {
		topTimeScore = surviveTime;
		UserProfile.score = topTimeScore;
		UserProfile.UpdateScore();
		ScoreRating = GetDataBase();
	}
}

//LAUNCH
new InputHandler();
try {
	CreateTable();
	ScoreRating = GetDataBase();
} catch (err) {
	console.log("DATABASE Error:" + err);
}
gameLoop();
