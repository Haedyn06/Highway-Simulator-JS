//MainFrame
let mainFrame;
let frameWidth = 1020;
let frameHeight = 1100;
let contents;

//CarSprite
let carWidth = 175;
let carHeight = 300;
let carX = frameWidth/2.43;
let carY = frameHeight/1.5;

let car = {
    x : carX,
    y : carY,
    width : carWidth,
    height : carHeight
}

let rightSignal = false;
let leftSignal = false;

//Lanes
let laneArray = [];

let laneWidth = frameWidth/4.4;
let laneHeight = frameHeight;
let laneX = frameWidth/2.58;
let laneY = (frameHeight/frameHeight) - frameHeight;

let leftLaneImg;
let rightLaneImg;
let middleLaneImg;
let rightBarrierImg;
let leftBarrierImg;

let distanceSinceLastSpawn = 0;
const roadSpacing = 300; // how many px before spawning next road segment

//Physics
let carVelocityX = 12;
let carVelocityY = 10;

let velocityY = 0;
const maxVelocityY = 90; // 90*3.34 = 300km/h
const accelerationCurve = [
    {speed: 0, time: 0},
    {speed: 100, time: 2.4},
    {speed: 200, time: 8.0},
    {speed: 300, time: 20.5}
];


//Controls
let keys = {};
let gameOver = false;

window.onload = function() {
    mainFrame = document.getElementById("MainFrame");
    mainFrame.height = frameHeight;
    mainFrame.width =  frameWidth;
    contents = mainFrame.getContext("2d");
    
    //Load Img
    carImg = new Image();
    carImg.src = "../assets/sprites/CarBase.png";
    carImg.onload = function() {
        contents.drawImage(carImg, car.x, car.y, car.width, car.height);
    }

    middleLaneImg = new Image();
    middleLaneImg.src = "../assets/background/MiddleLane.png";

    leftLaneImg = new Image();
    leftLaneImg.src = "../assets/background/LeftLane.png";

    rightLaneImg = new Image();
    rightLaneImg.src = "../assets/background/RightLane.png";

    rightBarrierImg = new Image();
    rightBarrierImg.src = "../assets/background/RightSideBarrier.png";

    leftBarrierImg = new Image();
    leftBarrierImg.src = "../assets/background/LeftSideBarrier.png";
    
    document.addEventListener("keydown", (e) => keys[e.code] = true);
    document.addEventListener("keyup", (e) => {
        keys[e.code] = false;
        if (e.code === "Space" || e.code === "KeyA" || e.code === "KeyD" || e.code === "KeyS") carImg.src = "../assets/sprites/CarBase.png";
    });
    
    requestAnimationFrame(update);
}



function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    
    contents.clearRect(0, 0, mainFrame.width, mainFrame.height);
    MoveCar();
    for (let i = 0; i < laneArray.length; i++) {
        let lane = laneArray[i];
        lane.y += velocityY;
        contents.drawImage(lane.img, lane.x, lane.y, lane.width, lane.height);
    }

    contents.drawImage(carImg, car.x, car.y, car.width, car.height);
    document.addEventListener("keydown", CarSignal);
    
    //Speed
    let speed = velocityY*3.3;
    contents.fillStyle = "white";
    contents.font = "45px sans-serif";
    contents.fillText((speed.toFixed(1) + " km/h"), 50, 50);

    distanceSinceLastSpawn += velocityY;

    if (distanceSinceLastSpawn >= roadSpacing) {
        LoadRoad();
        distanceSinceLastSpawn = 0;
    }
}

function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function LoadRoad() {
    let rightBarrier = {
        img : rightBarrierImg,
        x : laneX + laneWidth + laneWidth,
        y : laneY,
        width : 170,
        height : frameHeight,
        collided : false 
    }
    laneArray.push(rightBarrier);

    let leftBarrier = {
        img : leftBarrierImg,
        x : 0,
        y : laneY,
        width : 170,
        height : frameHeight,
        collided : false 
    }
    laneArray.push(leftBarrier);

    let middleLane = {
        img : middleLaneImg,
        x : laneX,
        y : laneY,
        width : laneWidth,
        height : laneHeight,
        inLane : false 
    }
    laneArray.push(middleLane);

    let rightLane = {
        img : rightLaneImg,
        x : laneX + laneWidth,
        y : laneY,
        width : laneWidth,
        height : laneHeight,
        inLane : false 
    }
    laneArray.push(rightLane);

    let leftLane = {
        img : leftLaneImg,
        x : laneX - laneWidth,
        y : laneY,
        width : laneWidth,
        height : laneHeight,
        inLane : false 
    }
    laneArray.push(leftLane);
}

function MoveCar() {
    if (keys["KeyW"]) { // 90 Velocity = 90*3.34 = 300km/h
        if (velocityY < 30.3) velocityY += 0.26
        else if (velocityY < 60.6) velocityY += 0.12
        else if (velocityY < 75.75) velocityY += 0.07
        else if (velocityY < 91) velocityY += 0.04
    } 

    if (keys["KeyA"] && car.x >= 170) {
        carImg.src = "../assets/sprites/CarLeft.png";
        car.x -= carVelocityX;
    }

    if (keys["KeyS"] || keys["Space"]) {
        carImg.src = "../assets/sprites/CarBrake.png";
        if (velocityY > 0) velocityY -= 0.3;
        if (velocityY < 0) velocityY = 0;
    } 
    
    if (keys["KeyD"] && car.x <= (laneX + laneWidth + 50)) {
        carImg.src = "../assets/sprites/CarRight.png";
        car.x += carVelocityX;
    }

}



async function CarSignal(e) {
  if (e.code === "KeyE") {
    if (leftSignal) leftSignal = false;

    rightSignal = !rightSignal;
    while (rightSignal) {
      carImg.src = "../assets/sprites/CarRSig.png";
      await wait(500);
      carImg.src = "../assets/sprites/CarBase.png";
      await wait(500);
    }
  }

  if (e.code === "KeyQ") {
    if (rightSignal) rightSignal = false;

    leftSignal = !leftSignal;
    while (leftSignal) {
      carImg.src = "../assets/sprites/CarLSig.png";
      await wait(500);
      carImg.src = "../assets/sprites/CarBase.png";
      await wait(500);
    }
  }
}

function ColliderDetector(a, b) {
    return  a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
}
