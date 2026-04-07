const fs = require('fs');

const voxels = [];
const add = (x, y, z, color, materialType = "STANDARD") => {
    voxels.push({ x, y, z, color, materialType, isLocked: false });
};

const skin = { shadow: '#0A0A0A', base: '#1A1A1A', mid: '#2A2A2A', high: '#3A3A3A' };

const getSkinColor = (y, topY, bottomY, isRecessed = false, isExposed = false) => {
    if (isRecessed) return skin.shadow;
    if (isExposed) return skin.high;
    const ratio = (y - bottomY) / (topY - bottomY || 1);
    if (ratio < 0.25) return skin.shadow;
    if (ratio > 0.8) return skin.high;
    if (ratio > 0.5) return skin.mid;
    return skin.base;
};

// Body
for(let x = -4; x <= 4; x++) {
    for(let y = 4; y <= 10; y++) {
        for(let z = -6; z <= 6; z++) {
            if (Math.abs(x) === 4 && (y === 4 || y === 10 || Math.abs(z) === 6)) continue;
            add(x, y, z, getSkinColor(y, 10, 4, y===4, y===10));
        }
    }
}

// Neck
for(let x = -2; x <= 2; x++) {
    for(let y = 10; y <= 15; y++) {
        for(let z = 5; z <= 9; z++) {
            if (y > 10) {
               let z_offset = Math.floor((y - 10) / 2);
               if (z < 5 + z_offset || z > 9 + z_offset) continue;
            }
            add(x, y, z, getSkinColor(y, 15, 10, false, false));
        }
    }
}

// Head
for(let x = -4; x <= 4; x++) {
    for(let y = 14; y <= 19; y++) {
        for(let z = 8; z <= 13; z++) {
            if (Math.abs(x) === 4 && (z === 8 || z === 13 || y === 19)) continue;
            add(x, y, z, getSkinColor(y, 19, 14, y===14, y===19));
        }
    }
}

// Snout
for(let x = -3; x <= 3; x++) {
    for(let y = 14; y <= 16; y++) {
        for(let z = 13; z <= 15; z++) {
            add(x, y, z, getSkinColor(y, 16, 14, y===14, y===16));
        }
    }
}

// Ears/Appendages (Head)
for(let y = 18; y <= 21; y++) {
    let offset = y - 18;
    add(-3 - Math.floor(offset/2), y, 8 - offset, skin.high);
    add(-4 - Math.floor(offset/2), y, 8 - offset, skin.high);
    add(3 + Math.floor(offset/2), y, 8 - offset, skin.high);
    add(4 + Math.floor(offset/2), y, 8 - offset, skin.high);
}

// Eyes: big green
add(-3, 17, 13, '#22CC66', 'GLASS');
add(-2, 17, 13, '#22CC66', 'GLASS');
add(-3, 18, 13, '#22CC66', 'GLASS');
add(-2, 18, 13, '#000000', 'GLASS'); // Pupil

add(3, 17, 13, '#22CC66', 'GLASS');
add(2, 17, 13, '#22CC66', 'GLASS');
add(3, 18, 13, '#22CC66', 'GLASS');
add(2, 18, 13, '#000000', 'GLASS'); // Pupil

// Front Legs
for(let x of [-5, -4, 4, 5]) {
    for(let y = 0; y <= 6; y++) {
        for(let z = 3; z <= 6; z++) {
            if (y < 2 && z === 6) add(x, y, z, skin.shadow); // Toes
            else add(x, y, z, getSkinColor(y, 6, 0, false, false));
        }
    }
}

// Back Legs
for(let x of [-5, -4, 4, 5]) {
    for(let y = 0; y <= 7; y++) {
        for(let z = -5; z <= -2; z++) {
            if (y < 2 && z === -2) add(x, y, z, skin.shadow); // Toes
            else add(x, y, z, getSkinColor(y, 7, 0, false, false));
        }
    }
}
// Hind thighs
for(let x of [-6, -5, 5, 6]) {
    for(let y = 3; y <= 8; y++) {
        for(let z = -6; z <= -3; z++) {
            add(x, y, z, getSkinColor(y, 8, 3, false, true));
        }
    }
}

// Tail
for(let z = -6; z >= -20; z--) {
    let thickness = Math.max(1, Math.floor((z + 20) / 4));
    let y_pos = 6 - Math.floor((-6 - z) / 4);
    if (y_pos < 1) y_pos = 1;
    for(let x = -thickness; x <= thickness; x++) {
        for(let y = y_pos; y <= y_pos + thickness; y++) {
            add(x, y, z, getSkinColor(y, y_pos+thickness, y_pos, false, false));
        }
    }
}

// Tail fins
for(let z = -18; z >= -20; z--) {
    for(let x = 2; x <= 5; x++) { // Right fin
        add(x, 1, z, skin.mid);
        add(x, 2, z, skin.high);
    }
    for(let x = -5; x <= -2; x++) { // Left fin (red)
        add(x, 1, z, '#992222');
        add(x, 2, z, '#CC3333');
    }
}

// Wings
for(let z = -2; z <= 4; z++) {
    let span = 14;
    if (z === -2 || z === 4) span = 8;
    if (z === -1 || z === 3) span = 12;
    for(let x = -span; x <= -4; x++) {
        add(x, 9, z, skin.shadow);
        add(x, 10, z, skin.mid);
    }
    for(let x = 4; x <= span; x++) {
        add(x, 9, z, skin.shadow);
        add(x, 10, z, skin.mid);
    }
}

fs.writeFileSync('_bridge/response.json', JSON.stringify(voxels));
console.log("Generated " + voxels.length + " voxels for Toothless.");