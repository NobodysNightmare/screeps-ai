const Y_MULTIPLIER = 100;

function serializePos(pos) {
    return pos.x + (Y_MULTIPLIER * pos.y);
}

function deserializePos(value) {
    let x = value % Y_MULTIPLIER;
    return { x: x, y: (value - x) / Y_MULTIPLIER };
}

module.exports = class BuildProxy {
    constructor(room) {
        this.room = room;
        this.plan = new Map();
    }

    planConstruction(x, y, structureType) {
        let posValue = serializePos({ x: x, y: y });

        if(this.plan.has(posValue)) return false;

        this.plan.set(posValue, structureType);
        return true;
    }

    get(x, y) {
        return this.plan.get(serializePos({ x: x, y: y }));
    }

    commit() {
        for(let posValueAndType of this.plan) {
            let pos = deserializePos(posValueAndType[0]);
            let structureType = posValueAndType[1];

            this.room.createConstructionSite(pos.x, pos.y, structureType);
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'BuildProxy');
