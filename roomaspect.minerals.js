var container = require("construction.containers");
var spawnHelper = require("helper.spawning");

var carrier = require("role.carrier");
var miner = require("role.miner");

module.exports = class MineralsAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
        this.mineral = this.room.find(FIND_MINERALS)[0];
    }

    run() {
        if(this.room.controller.level < 6) {
            return;
        }

        if(this.hasExtractor()) {
            if(this.needWorkers()) {
                this.buildMiner();
                this.buildCarrier();
            }
        }

        this.buildStructures();
    }

    buildMiner() {
        var existingMiners = spawnHelper.localCreepsWithRole(this.roomai, miner.name);
        if(_.any(existingMiners, (c) => c.memory.target == this.mineral.id)) {
            return;
        }

        var parts = spawnHelper.bestAvailableParts(this.room, miner.mineralConfigs);
        var memory = {
            role: miner.name,
            target: this.mineral.id,
            resource: this.mineral.mineralType
        };

        roomai.spawn(parts, memory);
    }

    buildCarrier() {
        if(!this.masterRoom() ||
            !this.masterRoom().terminal ||
            _.filter(spawnHelper.globalCreepsWithRole(carrier.name), (creep) => creep.memory.source == this.mineral.id).length > 0) {
            return;
        }

        var parts = spawnHelper.bestAvailableParts(this.room, carrier.partConfigs);
        var memory = {
            role: carrier.name,
            source: this.mineral.id,
            destination: this.masterRoom().terminal.id,
            resource: this.mineral.mineralType
        };

        this.roomai.spawn(parts, memory);
    }

    buildStructures() {
        if(Game.time % 20 != 0) {
            return;
        }

        this.room.createConstructionSite(this.mineral.pos, STRUCTURE_EXTRACTOR);
        container.buildNear(this.mineral);
    }

    masterRoom() {
        return Game.rooms[this.room.memory.slaveOf];
    }

    hasExtractor() {
        return this.room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_EXTRACTOR }).length > 0;
    }

    needWorkers() {
        return this.roomai.canSpawn() && this.mineral.mineralAmount > 0;
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'MineralsAspect');
