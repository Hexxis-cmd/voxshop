const fs = require('fs');

const voxels = [];
const add = (x, y, z, color, materialType = "STANDARD") => {
    voxels.push({ x, y, z, color, materialType, isLocked: false });
};

// Wall (Y: 5 to 30, X: -15 to +15, Z: -2 to -1)
for (let y = 5; y <= 30; y++) {
    for (let x = -15; x <= 15; x++) {
        // Brick pattern
        let color = '#2D2D3A'; // base dark stone
        if ((x + y) % 5 === 0) color = '#1A1A1F'; // mortar/shadow
        else if (Math.random() > 0.8) color = '#404050'; // highlight
        
        add(x, y, -2, color);
        // Uneven surface for realistic brick look
        if (Math.random() > 0.5) add(x, y, -1, color); 
    }
}

// Sign Frame (Metal)
for (let y = 9; y <= 26; y++) {
    add(-14, y, 0, '#555555', 'METALLIC');
    add(14, y, 0, '#555555', 'METALLIC');
}
for (let x = -14; x <= 14; x++) {
    add(x, 9, 0, '#555555', 'METALLIC');
    add(x, 26, 0, '#555555', 'METALLIC');
}
// Cross braces in the frame
add(-7, 17, 0, '#444444', 'METALLIC');
add(7, 17, 0, '#444444', 'METALLIC');

// GitHub Logo (Center top, Y: 18 to 24)
const logoColor = '#FFFFFF';
const logoMat = 'EMISSIVE';
const logoBg = '#111111'; // dark cutout behind it

// Dark backing circle
for (let dy = 0; dy <= 6; dy++) {
    for (let dx = -4; dx <= 4; dx++) {
        if (dx*dx + (dy-3)*(dy-3) <= 16) {
            add(dx, 18 + dy, 0, logoBg);
        }
    }
}
// Ears backing
add(-3, 24, 0, logoBg); add(-4, 24, 0, logoBg);
add(3, 24, 0, logoBg); add(4, 24, 0, logoBg);

// The white lines of the logo
const addLogo = (x, y) => {
    add(x, y, 1, logoColor, logoMat);
    add(x, y, 0, '#888888', 'GLASS'); // glass tube
};
addLogo(-3, 24); addLogo(-4, 24); addLogo(-2, 23); addLogo(-3, 23);
addLogo(3, 24); addLogo(4, 24); addLogo(2, 23); addLogo(3, 23);
// face outline
for (let dx = -3; dx <= 3; dx++) addLogo(dx, 18);
addLogo(-4, 19); addLogo(-4, 20); addLogo(-4, 21); addLogo(-4, 22);
addLogo(4, 19); addLogo(4, 20); addLogo(4, 21); addLogo(4, 22);
// eyes
add(-2, 20, 1, '#FF00FF', 'EMISSIVE'); add(2, 20, 1, '#00FFFF', 'EMISSIVE'); // cyberpunk eyes
// mouth/nose
add(-1, 19, 1, logoColor, logoMat); add(0, 19, 1, logoColor, logoMat); add(1, 19, 1, logoColor, logoMat);
add(0, 18, 1, logoColor, logoMat);

// Text "Hexxis-cmd"
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
drawText("Hexxis", -13, 11, '#00FFFF', 'EMISSIVE');

// "-cmd" (Magenta glow)
drawText("-cmd", 0, 11, '#FF00FF', 'EMISSIVE');

// Glow casting on wall behind the sign
for (let y = 10; y <= 16; y++) {
    for (let x = -14; x <= 14; x++) {
        if (Math.random() > 0.6) {
            // Left side cyan, right side magenta
            if (x < -1) {
                add(x, y, -1, '#004444', 'EMISSIVE'); 
            } else {
                add(x, y, -1, '#440044', 'EMISSIVE');
            }
        }
    }
}

// Cables/wires hanging down from the sign
for (let y = 0; y <= 9; y++) {
    // left cable
    let xOffsetL = Math.sin(y) > 0 ? 1 : 0;
    add(-12 + xOffsetL, y, 0, '#111111');
    
    // right cable
    let xOffsetR = Math.cos(y) > 0 ? 1 : 0;
    add(12 + xOffsetR, y, 0, '#111111');
    
    // center cable
    if (y > 2) add(0, y, 0, '#111111');
}

fs.writeFileSync('_bridge/response.json', JSON.stringify(voxels));
console.log("Generated " + voxels.length + " voxels for the Neon Sign.");