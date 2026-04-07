const fs = require('fs');

const voxels = [];
const add = (x, y, z, color, materialType = "STANDARD") => {
    voxels.push({ x, y, z, color, materialType, isLocked: false });
};

// Colors
const feathers = { shadow: '#3B2010', base: '#6B4226', mid: '#8B5A38', high: '#A07048' };
const belly = { shadow: '#8B6914', base: '#C4A44A', high: '#E8D090' };
const dark = { base: '#1A1A1A', mid: '#3A3A3A' };
const beak = { base: '#2A2A2A', high: '#4A4A4A' };
const eyes = { sclera: '#FFCC00', pupil: '#000000' };

const getFeatherColor = (y, topY, bottomY, isRecessed = false, isExposed = false) => {
    if (isRecessed) return feathers.shadow;
    if (isExposed) return feathers.high;
    const ratio = (y - bottomY) / (topY - bottomY || 1);
    if (ratio < 0.25) return feathers.shadow;
    if (ratio > 0.8) return feathers.high;
    if (ratio > 0.5) return feathers.mid;
    return feathers.base;
};

// Body (Torso)
// oriented along Z axis, gliding pose (y is higher, maybe 10-15)
for(let x = -4; x <= 4; x++) {
    for(let y = 10; y <= 16; y++) {
        for(let z = -5; z <= 4; z++) {
            if (Math.abs(x) === 4 && (y === 10 || y === 16 || Math.abs(z) >= 4)) continue;
            let isBelly = (y <= 11);
            if (isBelly && Math.abs(x) <= 3) {
                add(x, y, z, belly.base);
            } else {
                add(x, y, z, getFeatherColor(y, 16, 10, y===10, y===16));
            }
        }
    }
}

// Head (Large, round, little visible neck)
for(let x = -4; x <= 4; x++) {
    for(let y = 14; y <= 21; y++) {
        for(let z = 3; z <= 9; z++) {
            // Round the head
            let dist = Math.sqrt(x*x + Math.pow(y-17.5, 2) + Math.pow(z-6, 2));
            if (dist > 4.5) continue;
            
            // Facial disc (front flat area)
            if (z >= 8) {
                if (Math.abs(x) <= 3 && y >= 15 && y <= 20) {
                    add(x, y, z, belly.high); // Lighter face disc
                } else {
                    add(x, y, z, dark.base); // dark outline of face disc
                }
            } else {
                add(x, y, z, getFeatherColor(y, 21, 14, false, y>=19));
            }
        }
    }
}

// Beak
add(0, 16, 9, beak.base);
add(0, 15, 9, beak.base);
add(0, 16, 10, beak.high);

// Eyes (Large, prominent)
add(-2, 18, 9, eyes.sclera, 'GLASS');
add(-1, 18, 9, eyes.sclera, 'GLASS');
add(-2, 19, 9, eyes.sclera, 'GLASS');
add(-1, 19, 9, eyes.sclera, 'GLASS');
add(-1, 18, 10, eyes.pupil, 'GLASS');

add(2, 18, 9, eyes.sclera, 'GLASS');
add(1, 18, 9, eyes.sclera, 'GLASS');
add(2, 19, 9, eyes.sclera, 'GLASS');
add(1, 19, 9, eyes.sclera, 'GLASS');
add(1, 18, 10, eyes.pupil, 'GLASS');

// Ear tufts (Horns)
for(let y = 20; y <= 23; y++) {
    let offset = y - 20;
    add(-3 - Math.floor(offset/2), y, 6 - offset, dark.mid);
    add(-4 - Math.floor(offset/2), y, 6 - offset, feathers.high);
    add(3 + Math.floor(offset/2), y, 6 - offset, dark.mid);
    add(4 + Math.floor(offset/2), y, 6 - offset, feathers.high);
}

// Talons (tucked backwards/downwards in glide)
for(let x of [-2, 2]) {
    for(let y = 7; y <= 9; y++) {
        for(let z = -2; z <= 0; z++) {
            add(x, y, z, belly.shadow); // feathered legs
        }
    }
    // Claws
    add(x, 6, -1, beak.base);
    add(x-1, 6, -1, beak.base);
    add(x+1, 6, -1, beak.base);
    add(x, 5, -2, beak.high);
    add(x-1, 5, -2, beak.high);
    add(x+1, 5, -2, beak.high);
}

// Tail feathers (spread out back)
for(let z = -6; z >= -10; z--) {
    let width = 2 + Math.floor((-6 - z) / 1.5);
    for(let x = -width; x <= width; x++) {
        add(x, 11, z, feathers.shadow);
        add(x, 12, z, feathers.base);
    }
}

// Wings (Bird/Dragon/Bat standard) fully extended horizontally
// Spanning from x=5 to x=16 and x=-5 to x=-16
for(let z = -3; z <= 5; z++) {
    let span = 16;
    if (z === -3 || z === 5) span = 10;
    if (z === -2 || z === 4) span = 13;
    if (z === -1 || z === 3) span = 15;
    
    for(let x = 5; x <= span; x++) {
        let yBase = 14 + Math.floor((x - 5) / 5); // slight upward angle
        
        // Primary feathers (leading edge)
        if (z >= 3) {
            add(x, yBase, z, dark.base);
            add(x, yBase + 1, z, dark.mid);
        } else {
            // Secondary/Tertiary feathers (lighter brown)
            add(x, yBase, z, feathers.base);
            add(x, yBase + 1, z, feathers.mid);
        }
        
        // trailing feathers trailing down slightly
        if (z < 2) {
            add(x, yBase - 1, z, feathers.shadow);
            if (x % 2 === 0) { // feather texture pattern
                add(x, yBase - 2, z, feathers.shadow);
            }
        }
    }
    
    for(let x = -span; x <= -5; x++) {
        let yBase = 14 + Math.floor((-5 - x) / 5); // slight upward angle
        
        if (z >= 3) {
            add(x, yBase, z, dark.base);
            add(x, yBase + 1, z, dark.mid);
        } else {
            add(x, yBase, z, feathers.base);
            add(x, yBase + 1, z, feathers.mid);
        }
        
        if (z < 2) {
            add(x, yBase - 1, z, feathers.shadow);
            if (x % 2 === 0) {
                add(x, yBase - 2, z, feathers.shadow);
            }
        }
    }
}

fs.writeFileSync('_bridge/response.json', JSON.stringify(voxels));
console.log("Generated " + voxels.length + " voxels for the horned owl.");
