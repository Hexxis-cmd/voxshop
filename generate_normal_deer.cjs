const fs = require('fs');

const voxels = [];
const add = (x, y, z, color, materialType = "STANDARD") => {
    voxels.push({ x, y, z, color, materialType, isLocked: false });
};

// Colors
const fur = { shadow: '#3B2010', base: '#6B4226', mid: '#8B5A38', high: '#A07048' };
const belly = { shadow: '#D8C070', base: '#EDD890', high: '#FFFFFF' };
const antlers = { shadow: '#8B6914', base: '#C4A44A', high: '#E8D090' };
const hooves = { base: '#1A1A1A' };

const getFurColor = (y, topY, bottomY, isRecessed = false, isExposed = false) => {
    if (isRecessed) return fur.shadow;
    if (isExposed) return fur.high;
    const ratio = (y - bottomY) / (topY - bottomY || 1);
    if (ratio < 0.25) return fur.shadow;
    if (ratio > 0.8) return fur.high;
    if (ratio > 0.5) return fur.mid;
    return fur.base;
};

// Body (Torso)
for(let x = -3; x <= 3; x++) {
    for(let y = 10; y <= 15; y++) {
        for(let z = -6; z <= 5; z++) {
            if (Math.abs(x) === 3 && (y === 10 || y === 15 || Math.abs(z) >= 5)) continue;
            let isBelly = (y === 10 || y === 11);
            if (isBelly && Math.abs(x) <= 2) {
                add(x, y, z, belly.base);
            } else {
                add(x, y, z, getFurColor(y, 15, 10, y===10, y===15));
            }
        }
    }
}

// Neck
for(let x = -1; x <= 1; x++) {
    for(let y = 14; y <= 19; y++) {
        for(let z = 4; z <= 7; z++) {
            let z_offset = Math.floor((y - 14) / 1.5);
            if (z < 4 + z_offset || z > 6 + z_offset) continue;
            
            if (y === 14 && z === 4) add(x, y, z, belly.base); // throat
            else add(x, y, z, getFurColor(y, 19, 14, false, false));
        }
    }
}

// Head
for(let x = -2; x <= 2; x++) {
    for(let y = 18; y <= 22; y++) {
        for(let z = 8; z <= 12; z++) {
            if (Math.abs(x) === 2 && (z === 8 || z === 12 || y === 22)) continue;
            add(x, y, z, getFurColor(y, 22, 18, y===18, y===22));
        }
    }
}

// Snout
for(let x = -1; x <= 1; x++) {
    for(let y = 18; y <= 20; y++) {
        for(let z = 12; z <= 16; z++) {
            add(x, y, z, getFurColor(y, 20, 18, y===18, y===20));
        }
    }
}
// Nose
add(0, 19, 17, hooves.base);
add(-1, 19, 16, hooves.base);
add(1, 19, 16, hooves.base);

// Eyes
add(-2, 20, 11, '#1A1A1A', 'GLASS');
add(-1, 20, 11, '#1A1A1A', 'GLASS');
add(-2, 20, 10, '#EEEEEE', 'GLASS');

add(2, 20, 11, '#1A1A1A', 'GLASS');
add(1, 20, 11, '#1A1A1A', 'GLASS');
add(2, 20, 10, '#EEEEEE', 'GLASS');

// Ears
add(-3, 20, 8, fur.high);
add(-4, 21, 8, fur.high);
add(3, 20, 8, fur.high);
add(4, 21, 8, fur.high);

// Antlers
for(let y = 23; y <= 28; y++) {
    add(-2, y, 9, antlers.base);
    add(2, y, 9, antlers.base);
}
// Antler branches
add(-3, 25, 10, antlers.high);
add(-3, 27, 8, antlers.high);
add(3, 25, 10, antlers.high);
add(3, 27, 8, antlers.high);

// Front Legs
for(let x of [-3, -2, 2, 3]) {
    for(let y = 0; y <= 9; y++) {
        for(let z = 2; z <= 4; z++) {
            if (y < 2) {
                add(x, y, z, hooves.base); // Hooves
            } else {
                add(x, y, z, getFurColor(y, 9, 0, false, false));
            }
        }
    }
}

// Back Legs
for(let x of [-3, -2, 2, 3]) {
    for(let y = 0; y <= 9; y++) {
        for(let z = -5; z <= -3; z++) {
            if (y < 2) {
                add(x, y, z, hooves.base); // Hooves
            } else {
                add(x, y, z, getFurColor(y, 9, 0, false, false));
            }
        }
    }
}

// Hind Thighs
for(let x of [-3, 3]) {
    for(let y = 5; y <= 11; y++) {
        for(let z = -7; z <= -3; z++) {
            add(x, y, z, getFurColor(y, 11, 5, false, true));
        }
    }
}

// Tail
for(let x = -1; x <= 1; x++) {
    for(let y = 13; y <= 15; y++) {
        for(let z = -7; z >= -8; z--) {
            add(x, y, z, belly.high);
        }
    }
}

fs.writeFileSync('_bridge/response.json', JSON.stringify(voxels));
console.log("Generated " + voxels.length + " voxels for the normal deer.");
