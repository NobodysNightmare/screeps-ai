const constructions = {
    booster: require("construction.booster"),
    reactor: require("construction.reactor"),
    spawn: require("construction.spawn"),
    storage: require("construction.storage"),
    terminal: require("construction.terminal"),
    tower: require("construction.tower"),

    // building extensions last, so that they are processed
    // after spawns, allowing them to be built inside the cluster
    extensionCluster: require("construction.extensionCluster")
}

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
}

module.exports = class Constructions {
    constructor(room) {
        this.room = room;

        if(!this.room.memory.constructions) {
            this.room.memory.constructions = {};
        }

        this.initializeMemory();
    }

    initializeMemory() {
        this.memory = this.room.memory.constructions;
        for(let type in constructions) {
            if(!this.memory[type]) this.memory[type] = [];
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
        for(let type in constructions) {
            let builder = constructions[type];
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
            let builder = constructions[type];
            if(!this.memory[type]) this.memory[type] = [];
            builder.addBuilding(this.memory[type], result.flag);
            result.flag.remove();
        }
    }

    removeBuildings() {
        let results = _.filter(_.map(this.flags, (f) => ({ match: removeFlagRegex.exec(f.name), flag: f })), (m) => m.match);
        for(let result of results) {
            let type = result.match[1].charAt(0).toLowerCase() + result.match[1].slice(1);
            let builder = constructions[type];
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
