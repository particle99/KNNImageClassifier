const IMG_WIDTH = 16;
const IMG_HEIGHT = 16;
const DIM = IMG_WIDTH * IMG_HEIGHT;
const K = 5;

const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

const classifyImageButton = document.getElementById('classifyImage');
const labelInput = document.getElementById('label');
const guessClassButton = document.getElementById('guessLabel');
const clearGridButton = document.getElementById('clearGrid');

const button16x16 = document.getElementById('16x16');
const button32x32 = document.getElementById('32x32');
const button48x48 = document.getElementById('48x48');

let GRID_SIZE = 16;
let CELL_SIZE = canvas.width / GRID_SIZE;

let isDragging = false;
let gridData = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));

function drawCell(row, col, color) {
    ctx.fillStyle = color;
    ctx.fillRect(
        col * CELL_SIZE,     // x position
        row * CELL_SIZE,     // y position
        CELL_SIZE,           // width
        CELL_SIZE            // height
    );
}

function drawGridLines() {
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 0.5;

    for (let i = 0; i <= GRID_SIZE; i++) {
        const pos = i * CELL_SIZE;

        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(canvas.width, pos);
        ctx.stroke();
    }
}

function redrawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (gridData[r][c] === 1) {
                drawCell(r, c, 'black');
            } else {
                 drawCell(r, c, 'white');
            }
        }
    }

    drawGridLines();
}

function getMousePos(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function handleInteraction(event) {
    const pos = getMousePos(event);
    const col = Math.floor(pos.x / CELL_SIZE);
    const row = Math.floor(pos.y / CELL_SIZE);

    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        if (gridData[row][col] === 0) {
            gridData[row][col] = 1;
            drawCell(row, col, 'black');
            drawGridLines();
        }
    }
}

function clearGridData() {
    gridData = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
}

function flattenArray(arr) {
    let flattenedArray = [];

    for(let x = 0; x < arr.length; x++) {
        for(let y = 0; y < arr[x].length; y++) flattenedArray.push(arr[x][y]);
    }

    return flattenedArray;
}

class KNN {
    constructor(k = 5) {
        this.k = k;
        this.points = [];
        this.classes = [];
    }

    addPoint(arr, label) {
        this.points.push([ arr, label ]);

        if(this.classes.indexOf(label) < 0) this.classes.push(label);
    }

    calculateDistance(p1, p2) {
        let squaredSum = 0;

        //assume both points are in the same dimension
        for(let i in p1) {
            squaredSum += (p1[i] - p2[i])**2;
        }

        return Math.sqrt(squaredSum);
    }

    getClosestPoints(p) {
        const pointsDistance = [];
        const closestPoints = [];

        for(let i in this.points) {
            const point = this.points[i][0];
            const label = this.points[i][1];
    
            const distance = this.calculateDistance(p, point);
    
            pointsDistance.push({ distance, label });
        }
    
        const pointsSorted = pointsDistance.sort((a, b) => { return a.distance - b.distance });
        
        for(let i = 0; i < this.k; i++) closestPoints.push(pointsSorted[i]);

        return closestPoints;
    }

    getPointsLabel(p) {
        let labelArr = {};
        let chosenLabel = "";

        for(let i in p) {
            if(label[p[i].label] == undefined) label[p[i].label] = 0;
            
            labelArr[p[i].label] += 1;

            chosenLabel = p[i].label;
        }

        for(let i in labelArr) {
            if(labelArr[chosenLabel] < labelArr[i]) chosenLabel = i;
        }

        return chosenLabel;
    }

    classifyPoint(p) {
        const closestPoints = this.getClosestPoints(p);
        const chosenLabel = this.getPointsLabel(closestPoints);

        return chosenLabel;
    }
}

const model = new KNN(K);

canvas.addEventListener('mousedown', (event) => {
    isDragging = true;
    handleInteraction(event);
});

canvas.addEventListener('mousemove', (event) => {
    if (isDragging) {
        handleInteraction(event);
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
});

document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
    }
});

classifyImageButton.addEventListener('click', () => {
    const label = labelInput.value;

    model.addPoint(flattenArray(gridData), label);

    clearGridData();
    redrawAll();
});

guessClassButton.addEventListener('click', () => {
    //ensure the model has some training
    if(model.points.length > model.k) {
        const label = model.classifyPoint(flattenArray(gridData));
        alert("Model guess: " + label);
        const correctGuess = prompt("Is this correct? (yes/no)").toLowerCase();
        if(correctGuess == "no") {
            const correctLabel = prompt("What is the correct label?");
            if(model.classes.indexOf(correctLabel) > -1) model.addPoint(flattenArray(gridData), correctLabel);
            else alert("That is not a known label");
        }
    }
});

clearGridButton.addEventListener('click', () => {
    clearGridData();
    redrawAll();
});

button16x16.addEventListener('click', () => {
    if(CELL_SIZE !== 16) {
        canvas.width = 160;
        canvas.height = 160;

        GRID_SIZE = 16;
        CELL_SIZE = canvas.width / GRID_SIZE;

        model.points = [];

        clearGridData();
        redrawAll();
    }
});

button32x32.addEventListener('click', () => {
    if(CELL_SIZE !== 32) {
        canvas.width = 320;
        canvas.height = 320;

        GRID_SIZE = 32;
        CELL_SIZE = canvas.width / GRID_SIZE;

        model.points = [];

        clearGridData();
        redrawAll();
    }
});

button48x48.addEventListener('click', () => {
    if(CELL_SIZE !== 48) {
        canvas.width = 480;
        canvas.height = 480;

        GRID_SIZE = 48;
        CELL_SIZE = canvas.width / GRID_SIZE;

        model.points = [];

        clearGridData();
        redrawAll();
    }
});

redrawAll();