var constructions = [
    require("construction.extractor"),
    require("construction.ramparts"),
    require("construction.roads")
];

var aspects = [
    require("roomaspect.supplies"),
    require("roomaspect.sources"),
    require("roomaspect.defense"),
    require("roomaspect.controller"),
    require("roomaspect.builders"),
    require("roomaspect.minerals"),
    require("roomaspect.remoteMines"),
    require("roomaspect.masons"),
    require("roomaspect.constructions"),
    require("roomaspect.trading"),
    require("roomaspect.labs"),
    require("roomaspect.manualOperations"),
    require("roomaspect.power"),
    require("roomaspect.nuker")
];

var structureTower = require("structure.tower");

const Constructions = require("roomservice.constructions");
const Defense = require("roomservice.defense");
const Labs = require("roomservice.labs");
const Links = require("roomservice.links");
const Trading = require("roomservice.trading");

module.exports = class RoomAI {
    constructor(room) {
        this.room = room;
        this.spawns = room.find(FIND_MY_SPAWNS);
        this.availableSpawns = _.filter(this.spawns, (s) => !s.spawning);
        this.constructions = new Constructions(room);
        this.defense = new Defense(room);
        this.links = new Links(room);
        this.labs = new Labs(room);
        this.trading = new Trading(room);
        this.mode = this.room.memory.mode || "normal";
    }

    run() {
        for(let aspect of aspects) {
            new aspect(this).run();
        }

        for(let tower of this.room.find(FIND_MY_STRUCTURES, { filter: (structure) => structure.structureType == STRUCTURE_TOWER })) {
            structureTower.run(tower);
        }

        for(let construction of constructions) {
            construction.perform(this.room);
        }

        for(let spawn of this.spawns) {
            this.renderSpawnOverlay(spawn);
        }

        this.renderModeOverlay();
    }

    spawn(parts, memory) {
        let spawn = this.availableSpawns[0];
        if(!spawn || this.spawnReserved) {
            return false;
        }

        let result = spawn.createCreep(parts, undefined, memory);
        if(_.isString(result)) {
            this.availableSpawns.shift();
        } else if(result == ERR_NOT_ENOUGH_ENERGY) {
            this.spawnReserved = true;
        }

        return result;
    }

    canSpawn() {
        return !this.spawnReserved && this.availableSpawns.length > 0;
    }

    renderSpawnOverlay(spawn) {
        if(spawn.spawning) {
            let role = Game.creeps[spawn.spawning.name].memory.role;
            let remaining = spawn.spawning.remainingTime;
            spawn.room.visual.rect(spawn.pos.x - 1.3, spawn.pos.y + 0.9, 2.6, 0.6,{fill: '#333', opacity: 0.8, stroke: '#fff', strokeWidth: 0.03 });
            spawn.room.visual.text(role, spawn.pos.x - 0.0, spawn.pos.y + 1.3, { align: "center", size: 0.4 });
            spawn.room.visual.circle(spawn.pos, {fill: '#000000', radius: 0.5, opacity: 0.8 });
            spawn.room.visual.text(remaining, spawn.pos.x - 0.0, spawn.pos.y + 0.2, { align: "center", size: 0.6 })
        }
    }

    renderModeOverlay() {
        this.room.visual.text("Mode: " + this.mode, 0, 0, { align: "left", color: "#fff", stroke: "#000" });
    }

    toString() {
        return "[RoomAI " + this.room.name + "]";
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'RoomAI');
