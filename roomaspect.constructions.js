const constructions = {
    booster: require("construction.booster"),
    extensionCluster: require("construction.extensionCluster"),
    reactor: require("construction.reactor"),
    storage: require("construction.storage"),
    tower: require("construction.tower"),
    walls: require("construction.walls")
}

const buildFlagRegex = /^build([A-Za-z]+)$/;
const removeFlagRegex = /^remove([A-Za-z]+)$/;

module.exports = class ConstructionsAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;

        if(!this.room.memory.constructions) {
            this.room.memory.constructions = {};
        }

        this.memory = this.room.memory.constructions;
    }

    run() {
        this.addBuildings();
        this.removeBuildings();

        for(let type in constructions) {
            if(!this.memory[type]) {
                this.memory[type] = [];
                continue;
            }

            let builder = constructions[type];
            for(let building of this.memory[type]) {
                builder.outline(this.room, building);
                if(Game.time % 90 == 0) {
                    builder.build(this.room, building);
                }
            }
        }
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
profiler.registerClass(module.exports, 'ConstructionsAspect');
