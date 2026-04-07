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
const wings = { shadow: '#C0C0C0', base: '#D8D8D8', mid: '#EBEBEB', high: '#FFFFFF' };

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
// oriented along Z axis, gliding pose (y is higher, maybe 10-16, legs tucked or dangling)
for(let x = -3; x <= 3; x++) {
    for(let y = 10; y <= 15; y++) {
        for(let z = -5; z <= 6; z++) {
            if (Math.abs(x) === 3 && (y === 10 || y === 15 || Math.abs(z) >= 5)) continue;
            let isBelly = (y === 10);
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
    for(let y = 14; y <= 18; y++) {
        for(let z = 5; z <= 8; z++) {
            let z_offset = Math.floor((y - 14) / 2);
            if (z < 5 + z_offset || z > 7 + z_offset) continue;
            
            if (y === 14 && z === 5) add(x, y, z, belly.base); // throat
            else add(x, y, z, getFurColor(y, 18, 14, false, false));
        }
    }
}

// Head
for(let x = -2; x <= 2; x++) {
    for(let y = 18; y <= 21; y++) {
        for(let z = 8; z <= 12; z++) {
            if (Math.abs(x) === 2 && (z === 8 || z === 12 || y === 21)) continue;
            add(x, y, z, getFurColor(y, 21, 18, y===18, y===21));
        }
    }
}

// Snout (long)
for(let x = -1; x <= 1; x++) {
    for(let y = 18; y <= 19; y++) {
        for(let z = 12; z <= 15; z++) {
            add(x, y, z, getFurColor(y, 19, 18, y===18, y===19));
        }
    }
}
// Nose
add(0, 19, 16, hooves.base);
add(-1, 19, 15, hooves.base);
add(1, 19, 15, hooves.base);

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
for(let y = 22; y <= 26; y++) {
    add(-2, y, 9, antlers.base);
    add(2, y, 9, antlers.base);
}
// Antler branches
add(-3, 24, 10, antlers.high);
add(-3, 26, 8, antlers.high);
add(3, 24, 10, antlers.high);
add(3, 26, 8, antlers.high);

// Front Legs (tucked slightly or trailing down and back)
for(let x of [-3, 3]) {
    for(let y = 4; y <= 11; y++) {
        for(let z = 2; z <= 4; z++) {
            // Legs angle backwards slightly in a glide
            let legZ = z - Math.floor((11 - y) / 3);
            if (y < 6) {
                add(x, y, legZ, hooves.base); // Hooves
            } else {
                add(x, y, legZ, getFurColor(y, 11, 4, false, false));
            }
        }
    }
}

// Back Legs (trailing straight back)
for(let x of [-3, 3]) {
    for(let y = 5; y <= 12; y++) {
        for(let z = -4; z <= -2; z++) {
            // Trailing behind
            let legZ = z - Math.floor((12 - y) * 1.5);
            if (y < 7) {
                add(x, y, legZ, hooves.base); // Hooves
            } else {
                add(x, y, legZ, getFurColor(y, 12, 5, false, false));
            }
        }
    }
}
// Tail (short white tail)
for(let x = -1; x <= 1; x++) {
    for(let y = 13; y <= 15; y++) {
        for(let z = -6; z >= -7; z--) {
            add(x, y, z, belly.high);
        }
    }
}

// Wings (Bird/Dragon/Bat standard) fully extended horizontally
// Spanning from x=4 to x=15 and x=-4 to x=-15
for(let z = 0; z <= 4; z++) {
    let span = 15;
    if (z === 0 || z === 4) span = 10;
    if (z === 1 || z === 3) span = 13;
    
    for(let x = 4; x <= span; x++) {
        let yBase = 14 + Math.floor((x - 4) / 4); // slight upward angle
        add(x, yBase, z, wings.mid);
        add(x, yBase + 1, z, wings.high);
        // trailing feathers
        if (z < 3) add(x, yBase - 1, z, wings.shadow);
    }
    for(let x = -span; x <= -4; x++) {
        let yBase = 14 + Math.floor((-4 - x) / 4); // slight upward angle
        add(x, yBase, z, wings.mid);
        add(x, yBase + 1, z, wings.high);
        // trailing feathers
        if (z < 3) add(x, yBase - 1, z, wings.shadow);
    }
}

fs.writeFileSync('_bridge/response.json', JSON.stringify(voxels));
console.log("Generated " + voxels.length + " voxels for the winged deer.");
