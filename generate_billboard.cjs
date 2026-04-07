const fs = require('fs');

const voxels = [];
const add = (x, y, z, color, materialType = "STANDARD") => {
    voxels.push({ x, y, z, color, materialType, isLocked: false });
};

// Colors
const wood = { shadow: '#2A1A0D', base: '#4A2E15', high: '#6B4428' };
const metal = { shadow: '#2A2A2A', base: '#555555', high: '#AAAAAA' };
const board = { shadow: '#111111', base: '#222222', high: '#333333' };
const text = { emissive: '#00FFFF' }; // Cyan glow
const subtext = { emissive: '#FFFFFF' }; // White glow

const getWoodColor = (y, topY, bottomY) => {
    const ratio = (y - bottomY) / (topY - bottomY || 1);
    if (ratio < 0.2) return wood.shadow;
    if (ratio > 0.8) return wood.high;
    return wood.base;
};

// 1. Poles (Y: 0 to 14)
for (let y = 0; y <= 14; y++) {
    for (let x of [-10, -9, 9, 10]) {
        for (let z of [-1, 0]) {
            add(x, y, z, getWoodColor(y, 14, 0));
        }
    }
}

// Crossbeams (back of board)
for (let x = -14; x <= 14; x++) {
    add(x, 16, -1, wood.base);
    add(x, 22, -1, wood.base);
    // diagonal brace
    let braceY = 16 + Math.floor((x + 14) / 28 * 6);
    add(x, braceY, -1, wood.high);
}

// 2. Billboard Base/Board (Y: 12 to 26, X: -15 to +15, Z: 0)
for (let x = -15; x <= 15; x++) {
    for (let y = 12; y <= 26; y++) {
        // Frame
        if (y === 12 || y === 26 || x === -15 || x === 15) {
            add(x, y, 0, metal.base, "METALLIC");
        } else {
            // Dark board
            let color = board.base;
            if (y === 13) color = board.shadow;
            if (y === 25) color = board.high;
            add(x, y, 0, color);
        }
    }
}

// 3. Text Generation
const font = {
    'G': ["111", "100", "101", "101", "111"],
    'E': ["111", "100", "111", "100", "111"],
    'M': ["10001", "11011", "10101", "10001", "10001"],
    'I': ["1", "1", "1", "1", "1"],
    'N': ["1001", "1101", "1011", "1001", "1001"],
    '3': ["111", "001", "011", "001", "111"],
    '.': ["0", "0", "0", "0", "1"],
    '1': ["11", "01", "01", "01", "11"],
    'P': ["111", "101", "111", "100", "100"],
    'R': ["111", "101", "110", "101", "101"],
    'O': ["111", "101", "101", "101", "111"]
};

function drawText(str, startX, startY, color, mat) {
    let currX = startX;
    for (let char of str) {
        if (char === ' ') {
            currX += 2;
            continue;
        }
        let pattern = font[char];
        if (pattern) {
            let width = pattern[0].length;
            for (let row = 0; row < 5; row++) {
                for (let col = 0; col < width; col++) {
                    if (pattern[row][col] === '1') {
                        add(currX + col, startY + (4 - row), 1, color, mat);
                    }
                }
            }
            currX += width + 1; // 1 space between letters
        }
    }
}

// "GEMINI"
drawText("GEMINI", -12, 19, text.emissive, "EMISSIVE");

// "3.1 PRO"
drawText("3.1 PRO", -10, 13, text.emissive, "EMISSIVE");

// Small text abstract lines (to represent "The models in these images were produced by" and "Preview")
function drawAbstractText(y, xStart, xEnd, color, mat) {
    for(let x = xStart; x <= xEnd; x++) {
        // Leave gaps for "words"
        if (x % 4 !== 0) {
            add(x, y, 1, color, mat);
        }
    }
}

drawAbstractText(25, -13, 13, subtext.emissive, "EMISSIVE"); // "The models in these images"
drawAbstractText(24, -10, 10, subtext.emissive, "EMISSIVE"); // "were produced by"

// 4. Spotlights aiming at board
for (let x of [-10, 0, 10]) {
    // Housing
    add(x, 11, 2, metal.shadow, "METALLIC");
    add(x, 11, 3, metal.base, "METALLIC");
    // Light
    add(x, 12, 2, '#FFFFFF', "EMISSIVE");
    add(x, 12, 1, '#FFFFCC', "EMISSIVE");
}

// 5. Some ground around the poles to make it a scene
for (let x = -15; x <= 15; x++) {
    for (let z = -3; z <= 3; z++) {
        let dist = Math.abs(x) + Math.abs(z);
        if (dist % 3 !== 0) {
            add(x, 0, z, '#2E6B2E'); // grass
        } else {
            add(x, 0, z, '#4A9040'); // grass mid
        }
    }
}

fs.writeFileSync('_bridge/response.json', JSON.stringify(voxels));
console.log("Generated " + voxels.length + " voxels for the Billboard.");
