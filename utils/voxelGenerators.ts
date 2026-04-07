import { VoxelData } from '../types';
import { COLORS, CONFIG } from './voxelConstants';
function setBlock(map: Map<string, VoxelData>, x: number, y: number, z: number, color: number) {
    const rx = Math.round(x);
    const ry = Math.round(y);
    const rz = Math.round(z);
    const key = `${rx},${ry},${rz}`;
    map.set(key, { x: rx, y: ry, z: rz, color });
}

function generateSphere(map: Map<string, VoxelData>, cx: number, cy: number, cz: number, r: number, col: number, sy = 1) {
    const r2 = r * r;
    const xMin = Math.floor(cx - r);
    const xMax = Math.ceil(cx + r);
    const yMin = Math.floor(cy - r * sy);
    const yMax = Math.ceil(cy + r * sy);
    const zMin = Math.floor(cz - r);
    const zMax = Math.ceil(cz + r);

    for (let x = xMin; x <= xMax; x++) {
        for (let y = yMin; y <= yMax; y++) {
            for (let z = zMin; z <= zMax; z++) {
                const dx = x - cx;
                const dy = (y - cy) / sy;
                const dz = z - cz;
                if (dx * dx + dy * dy + dz * dz <= r2) {
                    setBlock(map, x, y, z, col);
                }
            }
        }
    }
}

export const Generators = {
    RedFox: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        const FX = 0, FZ = 0, FY = CONFIG.FLOOR_Y + 1;
        const ORANGE = 0xE65100;
        const WHITE = 0xFFFFFF;
        const BLACK = 0x212121;

        const addBox = (xMin: number, yMin: number, zMin: number, w: number, h: number, d: number, color: number | ((x:number, y:number, z:number) => number)) => {
            for (let x = xMin; x < xMin + w; x++) {
                for (let y = yMin; y < yMin + h; y++) {
                    for (let z = zMin; z < zMin + d; z++) {
                        const col = typeof color === 'function' ? color(x, y, z) : color;
                        setBlock(map, FX + x, FY + y, FZ + z, col);
                    }
                }
            }
        };
        addBox(-2, 4, -5, 5, 5, 11, (x, y, z) => {
            if (y === 4 && x >= -1 && x <= 1) return WHITE;
            return ORANGE;
        });
        addBox(-3, 9, 4, 7, 6, 6, (x, y, z) => {
            if (y <= 10 && x >= -2 && x <= 2) return WHITE;
            if (x === -3 || x === 3) return WHITE;
            return ORANGE;
        });
        addBox(-1, 9, 10, 3, 3, 4, (x, y, z) => {
            if (z === 13 && y === 11 && x === 0) return BLACK;
            return WHITE;
        });
        setBlock(map, FX - 2, FY + 12, FZ + 9, BLACK);
        setBlock(map, FX + 2, FY + 12, FZ + 9, BLACK);
        addBox(-3, 15, 5, 2, 3, 2, (x, y, z) => y === 17 ? BLACK : ORANGE);
        addBox(1, 15, 5, 2, 3, 2, (x, y, z) => y === 17 ? BLACK : ORANGE);
        const legColor = (x: number, y: number, z: number) => y < 2 ? BLACK : ORANGE;
        addBox(-2, 0, 3, 2, 4, 2, legColor);
        addBox(1, 0, 3, 2, 4, 2, legColor);
        addBox(-2, 0, -5, 2, 4, 2, legColor);
        addBox(1, 0, -5, 2, 4, 2, legColor);
        addBox(-1, 5, -14, 3, 3, 9, (x, y, z) => {
            if (z < -10) return WHITE;
            return ORANGE;
        });

        return Array.from(map.values());
    },

    Deer: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        const FX = 0, FZ = 0, FY = CONFIG.FLOOR_Y + 1;
        const BROWN = 0x8B4513;
        const TAN = 0xD2B48C;
        const WHITE = 0xFFFFFF;
        const BLACK = 0x000000;
        [[-2, 2], [2, 2], [-2, -2], [2, -2]].forEach(pos => {
            for (let y = 0; y < 10; y++) {
                setBlock(map, FX + pos[0], FY + y, FZ + pos[1], y < 2 ? BLACK : BROWN);
            }
        });
        for (let x = -3; x <= 3; x++) {
            for (let y = 10; y <= 15; y++) {
                for (let z = -6; z <= 6; z++) {
                    const isBelly = y < 12 && x > -2 && x < 2;
                    setBlock(map, FX + x, FY + y, FZ + z, isBelly ? TAN : BROWN);
                }
            }
        }
        for (let y = 15; y <= 22; y++) {
            const offset = (y - 15) * 0.5;
            generateSphere(map, FX, FY + y, FZ + 6 + offset, 2, BROWN);
        }
        const HY = FY + 24, HZ = FZ + 10;
        generateSphere(map, FX, HY, HZ, 2.5, BROWN);
        for (let z = 0; z < 3; z++) generateSphere(map, FX, HY - 1, HZ + 2 + z, 1.5 - z * 0.3, TAN);
        setBlock(map, FX, HY - 1, HZ + 5, BLACK);
        [[-1.5, 0], [1.5, 0]].forEach(pos => {
            for (let y = 0; y < 6; y++) {
                setBlock(map, FX + pos[0], HY + 2 + y, HZ + pos[1], TAN);
                if (y > 2) setBlock(map, FX + pos[0] + (pos[0] > 0 ? 1 : -1), HY + 2 + y, HZ + pos[1], TAN);
            }
        });

        return Array.from(map.values());
    }
};
