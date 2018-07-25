var store = require("construction.stores");
var spawnHelper = require("helper.spawning");
const logistic = require("helper.logistic");

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

        var parts = spawnHelper.bestAvailableParts(this.room, miner.mineralConfigs(this.mineral));
        var memory = {
            role: miner.name,
            target: this.mineral.id,
            resource: this.mineral.mineralType
        };

        this.roomai.spawn(parts, memory);
    }

    buildCarrier() {
        let mineralStore = logistic.storeFor(this.mineral);
        if(mineralStore === this.room.terminal || mineralStore === this.room.storage ||
            _.filter(spawnHelper.globalCreepsWithRole(carrier.name), (creep) => creep.memory.source == this.mineral.id).length > 0) {
            return;
        }

        if(!this.room.storage) return;

        let parts = spawnHelper.bestAvailableParts(this.room, carrier.partConfigs);
        let memory = {
            role: carrier.name,
            source: this.mineral.id,
            destination: this.room.storage.id,
            resource: this.mineral.mineralType
        };

        this.roomai.spawn(parts, memory);
    }

    buildStructures() {
        if(this.roomai.intervals.buildSimpleStructure.isActive()) {
            this.room.createConstructionSite(this.mineral.pos, STRUCTURE_EXTRACTOR);
        }
        if(this.roomai.intervals.buildStores.isActive()) {
            store.buildNextTo(this.mineral);
        }
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
