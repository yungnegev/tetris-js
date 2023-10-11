let canvas
let ctx
let boardHeight = 20 // в клетках
let boardWidth = 12 
let startX = 4 // спавн фигур
let startY = 0
let score = 0 // счет
let level = 1 // уровень
let gameState = 'Playing' // состояние игры
let coordinates = [...Array(boardHeight)].map(e => Array(boardWidth).fill(0)) // массив массивов с координатами клеток
let currentShape = [[1, 0], [0, 1], [1, 1], [2, 1]] // текущая фигура
let shapes = [] // массив всех фигур
let shapeColors = ['#dcccf0', '#c9e4de', '#c5def1', '#faedcb', '#f7d9c3', '#e9a5a4', '#f2c5de'] // цвета фигур
let currentShapeColor // текущий цвет фигуры
let gameBoard = [...Array(boardHeight)].map(e => Array(boardWidth).fill(0)) 
let stoppedShapes = [...Array(boardHeight)].map(e => Array(boardWidth).fill(0)) 

let DIRECTION = {
    IDLE: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3
}
let direction

class Coordinates {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}

document.addEventListener('DOMContentLoaded', setupCanvas)

function createCoordinates () {
    let i = 0
    let j = 0
    for (let y = 9; y <= 446; y += 23) {
        for (let x = 11; x <= 264; x += 23) {
            coordinates[i][j] = new Coordinates(x, y) // координаты клеток
            i++
        }
        j++
        i = 0
    }
}

function setupCanvas () {
    // тут мы создаем канвас и рисуем на нем игровое поле
    // вся игра будет происходить внутри этого канваса 
    const app = document.getElementById('app')
    canvas = document.createElement('canvas')
    canvas.id = 'board'
    app.appendChild(canvas)
    ctx = canvas.getContext('2d')
    canvas.width = 936
    canvas.height = 956
    // ctx.scale(2, 2)
    ctx.fillStyle = '#121212'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = '#ffffff'
    ctx.strokeRect(8, 8, 280, 462)

    let logo = new Image(161, 54)
    logo.src = './assets/images/tetris.png'
    logo.onload = () => {
        ctx.drawImage(logo, 300, 8, 161, 54)
    }

    ctx.fillStyle = '#ffffff'
    ctx.font = '21px Arial'
    ctx.fillText('СЧЕТ', 300, 98)
    ctx.strokeRect(300, 107, 161, 24)
    ctx.fillText(score.toString(), 310, 127)
    ctx.fillText('УРОВЕНЬ', 300, 157)
    ctx.strokeRect(300, 171, 161, 24)
    ctx.fillText(level.toString(), 310, 191)
    ctx.fillText('ИГРА', 300, 221)
    ctx.fillText(gameState, 310, 261)
    ctx.strokeRect(300, 232, 161, 95)
    ctx.fillText('ИНФО', 300, 354)
    ctx.strokeRect(300, 366, 161, 104)
    ctx.font = '19px Arial'
    ctx.fillText('A: В лево', 310, 388)
    ctx.fillText('D: В право', 310, 413)
    ctx.fillText('S: В низ', 310, 438)
    ctx.fillText('W: Вращение', 310, 463)

    document.addEventListener('keydown', handleKeyPress)
    createShapes()
    createShape()

    createCoordinates()
    drawShape()
}

function drawShape () {
    // на каждой итерации цикла мы получаем координаты нужной клетки 
    // и рисуем в ней квадрат
    for (let i = 0; i < currentShape.length; i++) {
        let x = currentShape[i][0] + startX
        let y = currentShape[i][1] + startY
        gameBoard[x][y] = 1
        let coordinateX = coordinates[x][y].x
        let coordinateY = coordinates[x][y].y
        ctx.fillStyle = currentShapeColor
        ctx.fillRect(coordinateX, coordinateY, 21, 21)
    }
}

function handleKeyPress (key) {
    if (gameState !== 'Game Over') { // пока игра идет
        if (key.keyCode === 65) {
            direction = DIRECTION.LEFT
            if (!wallHit() && !horizontalHit()) {
                deleteShape() // удаляем фигуру
                startX--      // смещаем координаты фигуры влево
                drawShape()   // рисуем фигуру в новом месте
            }
        } else if (key.keyCode === 68) {
            direction = DIRECTION.RIGHT
            if (!wallHit() && !horizontalHit()) {
                deleteShape()
                startX++
                drawShape()
            }
        } else if (key.keyCode === 83) {
            moveDown()
        } else if (key.keyCode === 87) {
            rotateShape()
        }
    }
}

function moveDown() {
    direction = DIRECTION.DOWN
    if (!verticalHit()) {
        deleteShape()
        startY++
        drawShape() 
    }
    
}

function deleteShape() {
    for (let i = 0; i < currentShape.length; i++) {
        let x = currentShape[i][0] + startX
        let y = currentShape[i][1] + startY
        gameBoard[x][y] = 0
        let coordinateX = coordinates[x][y].x
        let coordinateY = coordinates[x][y].y
        ctx.fillStyle = '#121212'
        ctx.fillRect(coordinateX, coordinateY, 21, 21)
    }
}

function createShapes() {
    // T
    shapes.push([[1, 0], [0, 1], [1, 1], [2, 1]])
    // I
    shapes.push([[0, 0], [1, 0], [2, 0], [3, 0]])
    // J
    shapes.push([[0, 0], [0, 1], [1, 1], [2, 1]])
    // O
    shapes.push([[0, 0], [1, 0], [0, 1], [1, 1]])
    // L
    shapes.push([[2, 0], [0, 1], [1, 1], [2, 1]])
    // S
    shapes.push([[1, 0], [2, 0], [0, 1], [1, 1]])
    // Z
    shapes.push([[0, 0], [1, 0], [1, 1], [2, 1]])
}

function createShape() {
    let randomShape = Math.floor(Math.random() * shapes.length)
    currentShape = shapes[randomShape]
    currentShapeColor = shapeColors[randomShape]
}

function wallHit() {
    for (let i = 0; i < currentShape.length; i++) {
        let newX = currentShape[i][0] + startX
        if (newX <= 0 && direction === DIRECTION.LEFT) { // если фигура касается левой стены (х = 0) и движется влево
            return true
        } else if (newX >= 11 && direction === DIRECTION.RIGHT) { // если фигура касается правой стены (х = 11) и движется вправо
                return true
        }
    }
    return false
}

function verticalHit(){
    // нужна коипя фигуры, чтобы попробовать двигать ее вниз
    let shapeCopy = currentShape;
    // флаг, который показывает, что есть столкновение
    let collision = false;
 
    // проходимся по всем клеткам фигуры
    for(let i = 0; i < shapeCopy.length; i++){
        // получаем координаты клетки фигуры
        // каждая клетка - это массив из двух элементов (положение по х и по у)
        let square = shapeCopy[i];
        // меняя Y мы двигаем клетку вниз
        let x = square[0] + startX;
        let y = square[1] + startY;
 
        if(direction === DIRECTION.DOWN){
            y++;
        }
 
        // проверяем, есть ли в массиве остановившихся фигур клетка с такими же координатами
        if(typeof stoppedShapes[x][y+1] === 'string'){
            deleteShape();// удаляем фигуру
            // ставим флаг в true и выходим из цикла
            startY++;
            drawShape();
            collision = true;
            break;
        }
        if(y >= 20){
            collision = true;
            break;
        }
    }
    // если есть столкновение то добавляем фигуру в массив остановившихся фигур
    if(collision){
        
        if(startY <= 2){
            gameState = "Game Over";
            ctx.fillStyle = 'white';
            ctx.fillRect(310, 242, 140, 30);
            ctx.fillStyle = 'black';
            ctx.fillText(gameState, 310, 261);
        } else {
            for(let i = 0; i < shapeCopy.length; i++){
                let square = shapeCopy[i];
                let x = square[0] + startX;
                let y = square[1] + startY;

                stoppedShapes[x][y] = currentShapeColor;
            }
 
            checkForRows();
 
            createShape();
 
            direction = DIRECTION.IDLE;
            startX = 4;
            startY = 0;
            drawShape();
        }
 
    }
}

function horizontalHit() {
    let shapeCopy = currentShape
    let hit = false
    for (let i = 0; i < shapeCopy.length; i++) {
        let square = shapeCopy[i] 
        let x = square[0] + startX
        let y = square[1] + startY 
        if (direction === DIRECTION.LEFT) {
            x--
        } else if (direction === DIRECTION.RIGHT) {
            x++
        }
        if (typeof stoppedShapes[x][y] === 'string') {
            hit = true
            break
        }
    }
    return hit
}

function checkForRows(){
 
    let rowsToDelete = 0;
    let startOfDeletion = 0;
 
    for (let y = 0; y < boardHeight; y++)
    {
        let completed = true;
        for(let x = 0; x < boardWidth; x++)
        {
            let square = stoppedShapes[x][y];
 
            if (square === 0 || (typeof square === 'undefined'))
            {
                completed=false;
                break;
            }
        }
 
        if (completed)
        {
            if(startOfDeletion === 0) startOfDeletion = y;
            rowsToDelete++;

            for(let i = 0; i < boardWidth; i++)
            {
                stoppedShapes[i][y] = 0;
                gameBoard[i][y] = 0;

                let coorX = coordinates[i][y].x;
                let coorY = coordinates[i][y].y;

                ctx.fillStyle = '#121212';
                ctx.fillRect(coorX, coorY, 21, 21);
            }
        }
    }
    if(rowsToDelete > 0){
        score += 10;
        ctx.fillStyle = '#121212';
        ctx.fillRect(310, 109, 140, 19);
        ctx.fillStyle = 'white';
        ctx.fillText(score.toString(), 310, 127);
        moveAllRowsDown(rowsToDelete, startOfDeletion);
    }
}

function moveAllRowsDown(rowsToDelete, startOfDeletion){
    for (var i = startOfDeletion-1; i >= 0; i--)
    {
        for(var x = 0; x < boardWidth; x++)
        {
            var y2 = i + rowsToDelete;
            var square = stoppedShapes[x][i];
            var nextSquare = stoppedShapes[x][y2];
 
            if (typeof square === 'string')
            {
                nextSquare = square;
                gameBoard[x][y2] = 1; 
                stoppedShapes[x][y2] = square; 
 

                let coorX = coordinates[x][y2].x;
                let coorY = coordinates[x][y2].y;
                ctx.fillStyle = nextSquare;
                ctx.fillRect(coorX, coorY, 21, 21);
 
                square = 0;
                gameBoard[x][i] = 0; 
                stoppedShapes[x][i] = 0; 
                coorX = coordinates[x][i].x;
                coorY = coordinates[x][i].y;
                ctx.fillStyle = '#121212';
                ctx.fillRect(coorX, coorY, 21, 21);
            }
        }
    }
}

function rotateShape()
{
    let newRotation = [];
    let shapeCopy = currentShape;
    let shappeBU;
 
    for(let i = 0; i < shapeCopy.length; i++)
    {
        shappeBU = [...currentShape];
 

        let x = shapeCopy[i][0];
        let y = shapeCopy[i][1];
        let newX = (getLastSquareX() - y);
        let newY = x;
        newRotation.push([newX, newY]);
    }
    deleteShape();
 

    try{
        currentShape = newRotation;
        drawShape();
    }  

    catch (e){ 
        if(e instanceof TypeError) {
            currentShape = shappeBU;
            deleteShape();
            drawShape();
        }
    }
}
 
function getLastSquareX() {
    let lastX = 0;
     for(let i = 0; i < currentShape.length; i++)
    {
        let square = currentShape[i];
        if (square[0] > lastX)
            lastX = square[0];
    }
    return lastX;
}

window.setInterval(() => {
    if (gameState === 'Playing') {
        moveDown()
    }
}, 1000)
