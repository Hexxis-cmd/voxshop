const fs = require('fs');

const voxels = [];
const add = (x, y, z, color, materialType = "STANDARD") => {
    voxels.push({ x, y, z, color, materialType, isLocked: false });
};

// Background Wall (Y: 6 to 28, X: -16 to +16, Z: -2 to -1)
for (let y = 6; y <= 28; y++) {
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
for (let y = 10; y <= 24; y++) {
    add(-15, y, 0, '#555555', 'METALLIC');
    add(15, y, 0, '#555555', 'METALLIC');
}
for (let x = -15; x <= 15; x++) {
    add(x, 10, 0, '#555555', 'METALLIC');
    add(x, 24, 0, '#555555', 'METALLIC');
}

// Support struts
add(-8, 17, 0, '#444444', 'METALLIC');
add(8, 17, 0, '#444444', 'METALLIC');

// Text "VOXSHOP"
const font = {
    'V': ["10001", "10001", "10001", "01010", "00100"],
    'O': ["01110", "10001", "10001", "10001", "01110"],
    'X': ["10001", "01010", "00100", "01010", "10001"],
    'S': ["01111", "10000", "01110", "00001", "11110"],
    'H': ["10001", "10001", "11111", "10001", "10001"],
    'P': ["11110", "10001", "11110", "10000", "10000"]
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

// "VOXSHOP" (Orange/Yellow gradient neon)
// V O X S H O P
// 5+1+5+1+5+1+5+1+5+1+5+1+5 = 41 width? Wait, it's too long.
// VOX: 17 width. SHOP: 23 width.
// I will stack them to make them readable and large!

// "VOX" (Cyan glow) Width is 17, centered from -8
drawText("VOX", -8, 19, '#00FFFF', 'EMISSIVE');

// "SHOP" (Pink/Magenta glow) Width is 23, centered from -11
drawText("SHOP", -11, 12, '#FF00FF', 'EMISSIVE');

// Glow casting on wall behind the sign
for (let y = 11; y <= 23; y++) {
    for (let x = -14; x <= 14; x++) {
        if (Math.random() > 0.6) {
            if (y > 16) {
                add(x, y, -1, '#004444', 'EMISSIVE'); // Cyan ambient
            } else {
                add(x, y, -1, '#440044', 'EMISSIVE'); // Magenta ambient
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
}

fs.writeFileSync('_bridge/response.json', JSON.stringify(voxels));
console.log("Generated " + voxels.length + " voxels for the VOXSHOP Neon Sign.");
