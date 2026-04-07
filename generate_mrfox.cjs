const fs = require('fs');

const voxels = [];
const add = (x, y, z, color, materialType = "STANDARD") => {
    voxels.push({ x, y, z, color, materialType, isLocked: false });
};

// Colors
const fur = { shadow: '#A0522D', base: '#CD853F', mid: '#D2691E', high: '#F4A460' };
const white = { shadow: '#C0C0C0', base: '#E0E0E0', high: '#FFFFFF' };
const dark = { base: '#2A2A2A' };

const getFurColor = (y, topY, bottomY, isRecessed = false, isExposed = false) => {
    if (isRecessed) return fur.shadow;
    if (isExposed) return fur.high;
    const ratio = (y - bottomY) / (topY - bottomY || 1);
    if (ratio < 0.25) return fur.shadow;
    if (ratio > 0.8) return fur.high;
    if (ratio > 0.5) return fur.mid;
    return fur.base;
};

const getWhiteColor = (y, topY, bottomY) => {
    const ratio = (y - bottomY) / (topY - bottomY || 1);
    if (ratio < 0.3) return white.shadow;
    if (ratio > 0.7) return white.high;
    return white.base;
};

// Legs (skinny)
for(let x of [-2, 2]) {
    for(let y = 0; y <= 8; y++) {
        for(let z = -1; z <= 0; z++) {
            if (y === 0 || y === 1) add(x, y, z, dark.base); // Feet/shoes
            else add(x, y, z, getFurColor(y, 8, 2, false, false));
        }
    }
}

// Torso (slouching)
for(let x = -3; x <= 3; x++) {
    for(let y = 9; y <= 16; y++) {
        for(let z = -2; z <= 2; z++) {
            let isBelly = (z === 2 && Math.abs(x) <= 2);
            if (isBelly) add(x, y, z, getWhiteColor(y, 16, 9));
            else add(x, y, z, getFurColor(y, 16, 9, y===9, y===16));
        }
    }
}

// Arms (skinny, hanging down)
for(let x of [-4, 4]) {
    for(let y = 6; y <= 15; y++) {
        for(let z = -1; z <= 0; z++) {
            add(x, y, z, getFurColor(y, 15, 6, false, false));
        }
    }
}

// Head (large)
for(let x = -4; x <= 4; x++) {
    for(let y = 17; y <= 24; y++) {
        for(let z = -3; z <= 4; z++) {
            // Muzzle / bottom half of face is white
            let isFace = (z >= 3 && y <= 20);
            if (isFace) add(x, y, z, getWhiteColor(y, 20, 17));
            else add(x, y, z, getFurColor(y, 24, 17, y===17, y===24));
        }
    }
}

// Snout (long, sticking out)
for(let x = -1; x <= 1; x++) {
    for(let y = 18; y <= 20; y++) {
        for(let z = 5; z <= 9; z++) {
            add(x, y, z, getWhiteColor(y, 20, 18));
        }
    }
}
// Nose
add(0, 20, 10, dark.base);

// Ears (pointed)
add(-3, 25, 0, fur.mid);
add(-4, 26, 0, fur.high);
add(-4, 27, 0, fur.high);
add(-3, 25, 1, white.base);
add(-4, 26, 1, white.base);

add(3, 25, 0, fur.mid);
add(4, 26, 0, fur.high);
add(4, 27, 0, fur.high);
add(3, 25, 1, white.base);
add(4, 26, 1, white.base);

// Eyes (depressed look, half open)
// Eye whites
add(-3, 21, 5, white.high, 'GLASS');
add(-2, 21, 5, white.high, 'GLASS');
add(-3, 22, 5, fur.mid); // Eyelid covering top half
add(-2, 22, 5, fur.mid);
add(-2, 21, 5, dark.base, 'GLASS'); // Pupil

add(3, 21, 5, white.high, 'GLASS');
add(2, 21, 5, white.high, 'GLASS');
add(3, 22, 5, fur.mid); // Eyelid
add(2, 22, 5, fur.mid);
add(2, 21, 5, dark.base, 'GLASS'); // Pupil

// Tail (fluffy)
for(let z = -3; z >= -10; z--) {
    let width = Math.min(2, Math.abs(z+2) / 2);
    width = Math.floor(width);
    let y = 10 - Math.abs(z+3) / 2; // angles down
    y = Math.floor(y);
    let isTip = (z <= -8);
    for(let x = -width; x <= width; x++) {
        for(let y_offset = 0; y_offset <= width; y_offset++) {
            if (isTip) {
                add(x, y + y_offset, z, getWhiteColor(y + y_offset, y+width, y));
            } else {
                add(x, y + y_offset, z, getFurColor(y + y_offset, y+width, y, false, false));
            }
        }
    }
}

fs.writeFileSync('_bridge/response.json', JSON.stringify(voxels));
console.log("Generated " + voxels.length + " voxels for Mr. Fox.");
