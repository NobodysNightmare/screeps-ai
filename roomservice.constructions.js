const BuildProxy = require("construction.buildproxy");
const ConstructionSpaceFinder = require("constructionSpaceFinder");

const constructions = new Map([
    ["booster", require("construction.booster")],
    ["reactor", require("construction.reactor")],
    ["spawn", require("construction.spawn")],
    ["storage", require("construction.storage")],
    ["store", require("construction.stores")],
    ["terminal", require("construction.terminal")],
    ["tower", require("construction.tower")],
    ["towerStack", require("construction.towerStack")],
    ["wall", require("construction.wall")],
    ["exitWalls", require("construction.exitWalls")],

    // building extensions last, so that they are processed
    // after spawns, allowing them to be built inside the cluster
    ["scalableExtensions", require("construction.scalableExtensions")],
    ["extensionCluster", require("construction.extensionCluster")],
]);

// Defines the order in which constructions are planned
// Essentials will even be planned if the room would not automatically layout
const planningOrder = [
    { type: "store", essential: true },
    { type: "exitWalls" },
    { type: "scalableExtensions" },
    { type: "spawn" },
    { type: "storage" },
    { type: "terminal" },
    { type: "towerStack" },
    { type: "reactor" }
];

const buildFlagRegex = /^build([A-Za-z]+)$/;
const removeFlagRegex = /^remove([A-Za-z]+)$/;

class Building {
    constructor(builder, memory, room) {
        this.builder = builder;
        this.memory = memory;
        this.room = room;
    }

    build(proxy) {
        this.builder.build(proxy, this.memory, this.room.ai());
    }

    outline() {
        this.builder.outline(this.room, this.memory);
    }

    updateCostMatrix(matrix) {
        this.builder.updateCostMatrix(matrix, this.memory);
    }

    get type() {
        return this.builder.type;
    }

    get pos() {
        if(this.memory.x && this.memory.y) return { x: this.memory.x, y: this.memory.y };

        return null;
    }
}

module.exports = class Constructions {
    constructor(room) {
        this.room = room;

        if(!this.room.memory.constructions) {
            this.room.memory.constructions = {};
        }

        this.initializeMemory();
        if(this.buildings.length == 0) {
            if(Memory.disableAutoExpansion) {
                this.planRoomLayout({ essentialsOnly: true });
            } else {
                this.planRoomLayout();
            }
        }
    }

    initializeMemory() {
        this.memory = this.room.memory.constructions;
        for(let type of constructions.keys()) {
            if(!this.memory[type]) this.memory[type] = [];
        }
    }

    planRoomLayout(options) {
        let startTime = Game.cpu.getUsed();
        let proxy = new BuildProxy(this.room);
        let spaceFinder = new ConstructionSpaceFinder(this.room.name, proxy);
        for(let building of this.buildings) {
            building.build(proxy);
        }

        for(let planItem of planningOrder) {
            if(options && options.essentialsOnly && !planItem.essential) continue;

            let type = planItem.type;
            let builder = constructions.get(type);
            let plannedBuildings = builder.plan(spaceFinder, this.buildings, this.room);

            if(!this.memory[type]) this.memory[type] = [];
            for(let memory of plannedBuildings) {
                this.memory[type].push(memory);

                let plannedInstance = new Building(builder, memory, this.room);
                this.buildings.push(plannedInstance);
                plannedInstance.build(proxy);
            }
        }

        let endTime = Game.cpu.getUsed();
        console.log(`Planning took ${Math.round((endTime - startTime) * 10) / 10} ms.`);
    }

    // This method is mostly intended for debugging room layouting code
    replanRoomLayout() {
        for(let key in this.memory) delete this.memory[key];
        this._buildings = null;
        this.initializeMemory();
        _.forEach(this.room.find(FIND_MY_CONSTRUCTION_SITES, { filter: (cs) => cs.progress === 0 }), (cs) => cs.remove());
        this.planRoomLayout();
    }

    drawDebugMarkers() {
        if(!this.memory.debugRectangles) return;

        let index = 1;
        for(let rect of this.memory.debugRectangles) {
            this.room.visual.rect(rect.x - 0.5, rect.y - 0.5, rect.width, rect.height, { stroke: "#0f0", fill: null });
            this.room.visual.text(index++, rect.x, rect.y, { align: "center", color: "#0f0", stroke: "#000" });
        }
    }

    get buildings() {
        if(!this._buildings) {
            this._buildings = this.createBuildings();
        }

        return this._buildings;
    }

    createBuildings() {
        let result = [];
        for(let typeAndBuilder of constructions) {
            let type = typeAndBuilder[0];
            let builder = typeAndBuilder[1];
            for(let memory of this.memory[type]) {
                result.push(new Building(builder, memory, this.room));
            }
        }

        return result;
    }

    addBuildings() {
        let results = _.filter(_.map(this.flags, (f) => ({ match: buildFlagRegex.exec(f.name), flag: f })), (m) => m.match);
        for(let result of results) {
            let type = result.match[1].charAt(0).toLowerCase() + result.match[1].slice(1);
            let builder = constructions.get(type);
            if(!this.memory[type]) this.memory[type] = [];
            builder.addBuilding(this.memory[type], result.flag);
            result.flag.remove();
        }
    }

    removeBuildings() {
        let results = _.filter(_.map(this.flags, (f) => ({ match: removeFlagRegex.exec(f.name), flag: f })), (m) => m.match);
        for(let result of results) {
            let type = result.match[1].charAt(0).toLowerCase() + result.match[1].slice(1);
            let builder = constructions.get(type);
            builder.removeBuilding(this.memory[type], result.flag);
            result.flag.remove();
        }
    }

    get flags() {
        if(this._flags) return this._flags;

        return this._flags = this.room.find(FIND_FLAGS);
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'Constructions');
