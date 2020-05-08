const roomWidth = 50;
const roomHeight = 50;

const minWidthDefault = 3;
const minHeightDefault = 3;

class Rectangle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.area = width * height;
    }

    intersects(other) {
        if(this.x + this.width <= other.x) return false;
        if(other.x + other.width <= this.x) return false;
        if(this.y + this.height <= other.y) return false;
        if(other.y + other.height <= this.y) return false;

        return true;
    }
}

module.exports = class ConstructionSpaceFinder {
    constructor(roomName, buildProxy) {
        this.terrain = Game.map.getRoomTerrain(roomName);
        this.buildProxy = buildProxy;

        this.minWidth = minWidthDefault;
        this.minHeight = minHeightDefault;
    }

    // Finds rectangular spaces inside the room that are neither blocked by walls
    // or existing buildings (as of planning state in a build proxy)
    // finding rectangles is derived from algorithm presented at
    // https://www.drdobbs.com/database/the-maximal-rectangle-problem/184410529
    findSpaces() {
        let widthCache = Array(roomHeight + 1).fill(0);
        let candidates = [];

        for(let x = roomWidth - 1; x >= 0; x--) {
            this.updateWidthCache(widthCache, x);
            let currentWidth = 0;
            let openings = [];

            // iterating one too far, to close off all rectangles
            for(let y = 0; y <= roomHeight; y++) {
                if(widthCache[y] > currentWidth) {
                    openings.push({ y: y, width: currentWidth});
                    currentWidth = widthCache[y];
                } else if(widthCache[y] < currentWidth) {
                    let priorOpening;
                    do {
                        priorOpening = openings.pop();
                        let currentHeight = y - priorOpening.y;
                        if(currentWidth >= this.minWidth && currentHeight >= this.minHeight) {
                            let rect = new Rectangle(x, priorOpening.y, currentWidth, currentHeight);
                            candidates.push(rect);
                        }

                        currentWidth = priorOpening.width;
                    } while(widthCache[y] < currentWidth);

                    currentWidth = widthCache[y];
                    if(currentWidth > 0) {
                        openings.push({ y: priorOpening.y, width: priorOpening.width});
                    }
                }
            }
        }

        return this.selectBest(candidates);
    }

    updateWidthCache(cache, x) {
        for(let y = 0; y < roomHeight; y++) {
            if(x === 0 || x === 49 || y === 0 || y === 49 || this.terrain.get(x, y) === TERRAIN_MASK_WALL || this.buildProxy.get(x, y)) {
                cache[y] = 0;
            } else {
                cache[y] += 1;
            }
        }
    }

    selectBest(candidates) {
        let selected = [];
        for(let rect of _.sortBy(_.sortBy(candidates, (r) => -r.area), (r) => -Math.min(r.width, r.height))) {
            if(_.any(selected, (r) => r.intersects(rect))) continue;

            selected.push(rect);
        }

        return selected;
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'ConstructionSpaceFinder');
