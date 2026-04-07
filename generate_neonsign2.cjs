const fs = require('fs');

const voxels = [];
const add = (x, y, z, color, materialType = "STANDARD") => {
    voxels.push({ x, y, z, color, materialType, isLocked: false });
};

// Background Brick Wall (Y: 6 to 26, X: -16 to +16, Z: -2 to -1)
for (let y = 6; y <= 26; y++) {
    for (let x = -16; x <= 16; x++) {
        let color = '#2D2D3A'; // base dark stone
        if ((x + y) % 5 === 0) color = '#1A1A1F'; // mortar/shadow
        else if (Math.random() > 0.8) color = '#404050'; // highlight
        
        add(x, y, -2, color);
        // Uneven surface
        if (Math.random() > 0.5) add(x, y, -1, color); 
    }
}

// Sign Metal Frame
for (let y = 8; y <= 24; y++) {
    add(-15, y, 0, '#555555', 'METALLIC');
    add(15, y, 0, '#555555', 'METALLIC');
}
for (let x = -15; x <= 15; x++) {
    add(x, 8, 0, '#555555', 'METALLIC');
    add(x, 24, 0, '#555555', 'METALLIC');
}

// Text
const font = {
    'H': ["10001", "10001", "11111", "10001", "10001"],
    'e': ["0110", "1001", "1111", "1000", "0111"],
    'x': ["10001", "01010", "00100", "01010", "10001"],
    'i': ["1", "0", "1", "1", "1"],
    's': ["0111", "1000", "0110", "0001", "1110"],
    '-': ["000", "000", "111", "000", "000"],
    'c': ["0111", "1000", "1000", "1000", "0111"],
    'm': ["10001", "11011", "10101", "10001", "10001"],
    'd': ["0001", "0001", "0111", "1001", "0111"]
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
                        // glass tube backing for neon
                        add(currX + col, startY + (4 - row), 0, '#FFFFFF', 'GLASS');
                    }
                }
            }
            currX += width + 1; // 1 space between letters
        }
    }
}

// "Hexxis" (Cyan glow)
drawText("Hexxis", -14, 17, '#00FFFF', 'EMISSIVE');

// "-cmd" (Magenta glow)
drawText("-cmd", -9, 10, '#FF00FF', 'EMISSIVE');

// Glow casting on wall behind the sign
for (let y = 9; y <= 23; y++) {
    for (let x = -14; x <= 14; x++) {
        if (Math.random() > 0.6) {
            if (y > 15) {
                add(x, y, -1, '#004444', 'EMISSIVE'); // Cyan ambient
            } else {
                add(x, y, -1, '#440044', 'EMISSIVE'); // Magenta ambient
            }
        }
    }
}

fs.writeFileSync('_bridge/response.json', JSON.stringify(voxels));
console.log("Generated " + voxels.length + " voxels for the Stacked Neon Sign.");
