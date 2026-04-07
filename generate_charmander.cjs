const fs = require('fs');

const voxels = [];
const add = (x, y, z, color, materialType = "STANDARD") => {
    voxels.push({ x, y, z, color, materialType, isLocked: false });
};

const skin = { shadow: '#CC5500', base: '#FF6600', mid: '#FF7722', high: '#FF8833' };
const belly = { shadow: '#CCAA00', base: '#FFDD00', high: '#FFEE55' };

const getSkinColor = (y, topY, bottomY, isRecessed = false, isExposed = false) => {
    if (isRecessed) return skin.shadow;
    if (isExposed) return skin.high;
    const ratio = (y - bottomY) / (topY - bottomY || 1);
    if (ratio < 0.25) return skin.shadow;
    if (ratio > 0.8) return skin.high;
    if (ratio > 0.5) return skin.mid;
    return skin.base;
};
const getBellyColor = (y, topY, bottomY, isRecessed = false, isExposed = false) => {
    if (isRecessed) return belly.shadow;
    if (isExposed) return belly.high;
    return belly.base;
};

// Feet (3 toes implied by 3 width)
for(let x of [-4, -3, -2, 2, 3, 4]) {
    for(let y = 0; y <= 2; y++) {
        for(let z = -1; z <= 3; z++) {
            add(x, y, z, getSkinColor(y, 2, 0, false, y===2));
        }
    }
}

// Legs
for(let x of [-4, -3, -2, 2, 3, 4]) {
    for(let y = 3; y <= 7; y++) {
        for(let z = -2; z <= 2; z++) {
            add(x, y, z, getSkinColor(y, 7, 3, false, false));
        }
    }
}

// Torso (Chubby)
for(let x = -5; x <= 5; x++) {
    for(let y = 8; y <= 16; y++) {
        for(let z = -4; z <= 4; z++) {
            // Check if it's the belly (front)
            if (z >= 3 && x >= -3 && x <= 3 && y >= 9 && y <= 15) {
                add(x, y, z, getBellyColor(y, 15, 9, y===9, y===15));
            } else {
                add(x, y, z, getSkinColor(y, 16, 8, y===8, y===16));
            }
        }
    }
}

// Arms
for(let x of [-6, -5]) {
    for(let y = 11; y <= 14; y++) {
        for(let z = -1; z <= 4; z++) { // extending forward
            add(x, y, z, getSkinColor(y, 14, 11, false, y===14));
        }
    }
}
for(let x of [5, 6]) {
    for(let y = 11; y <= 14; y++) {
        for(let z = -1; z <= 4; z++) {
            add(x, y, z, getSkinColor(y, 14, 11, false, y===14));
        }
    }
}

// Head (Round)
for(let x = -4; x <= 4; x++) {
    for(let y = 17; y <= 24; y++) {
        for(let z = -3; z <= 5; z++) {
            if ((Math.abs(x) === 4 || y === 24 || z === -3 || z === 5) && 
                (Math.abs(x)===4 && y===24 || Math.abs(x)===4 && z===5 || y===24 && z===5 || Math.abs(x)===4 && z===-3 || y===24 && z===-3)) {
                // Round corners loosely
                continue;
            }
            
            // Snout (slightly protruding lower face)
            if (z === 5 && y > 20) continue; 
            
            add(x, y, z, getSkinColor(y, 24, 17, y===17, y===24));
        }
    }
}

// Eyes (big, blue/black)
add(-3, 20, 5, '#EEEEEE', 'GLASS');
add(-2, 20, 5, '#112244', 'GLASS'); // Pupil
add(-3, 21, 5, '#EEEEEE', 'GLASS');
add(-2, 21, 5, '#EEEEEE', 'GLASS');

add(3, 20, 5, '#EEEEEE', 'GLASS');
add(2, 20, 5, '#112244', 'GLASS'); // Pupil
add(3, 21, 5, '#EEEEEE', 'GLASS');
add(2, 21, 5, '#EEEEEE', 'GLASS');

// Tail
for(let z = -5; z >= -12; z--) {
    let thickness = Math.max(1, Math.floor((z + 12) / 3));
    let y_pos = 9 - Math.floor((-5 - z) / 2); // Tail curves up? Or straight back then up.
    if (z < -8) y_pos += Math.floor((-8 - z)); // Curve up at the end
    
    for(let x = -thickness; x <= thickness; x++) {
        for(let y = y_pos; y <= y_pos + thickness * 2; y++) {
            add(x, y, z, getSkinColor(y, y_pos + thickness * 2, y_pos, false, false));
        }
    }
}

// Flame on tail tip (z = -13)
let flameY = 9 + 4 + 1; // Approx y_pos at end
for(let x = -2; x <= 2; x++) {
    for(let y = flameY - 1; y <= flameY + 4; y++) {
        for(let z = -14; z <= -12; z++) {
            let dist = Math.abs(x) + Math.abs(y - (flameY+1)) + Math.abs(z - -13);
            if (dist < 2) add(x, y, z, '#FFFFFF', 'EMISSIVE'); // Core
            else if (dist < 3) add(x, y, z, '#FFFF00', 'EMISSIVE'); // Inner
            else if (dist < 4) add(x, y, z, '#FF8C00', 'EMISSIVE'); // Mid
            else if (dist < 5) add(x, y, z, '#CC4400', 'EMISSIVE'); // Outer
        }
    }
}

fs.writeFileSync('_bridge/response.json', JSON.stringify(voxels));
console.log("Generated " + voxels.length + " voxels for Charmander.");
