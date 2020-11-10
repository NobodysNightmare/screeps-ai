var spawnHelper = require("helper.spawning");
const logistic = require("helper.logistic");
const roads = require("construction.roads");

var carrier = require("role.carrier");
var miner = require("role.miner");

const mineralExcessThreshold = 50000;

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
            if(this.storePoisoned()) {
                this.buildStoreCleaner();
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
            _.any(spawnHelper.localCreepsWithRole(this.roomai, carrier.name), (creep) => creep.memory.source == this.mineral.id)) {
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
        if(this.roomai.intervals.buildStructure.isActive()) {
            this.room.createConstructionSite(this.mineral.pos, STRUCTURE_EXTRACTOR);
        }
        if(this.roomai.intervals.buildStructure.isActive() && this.room.storage) {
            let container = logistic.storeFor(this.mineral, true);
            if(container) roads.buildRoadFromTo(this.room, this.room.storage.pos, container.pos);
        }
    }

    masterRoom() {
        return Game.rooms[this.room.memory.slaveOf];
    }

    hasExtractor() {
        return this.room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_EXTRACTOR }).length > 0;
    }

    needWorkers() {
        if(this.roomai.canSpawn() && this.mineral.mineralAmount > 0) {
            if(this.roomai.trading.requiredExportFromRoom(this.mineral.mineralType, { showExcess: true }) < mineralExcessThreshold) {
                return true;
            }
        }

        return false;
    }

    storePoisoned() {
        let store = logistic.storeFor(this.mineral);
        return store && store.structureType === STRUCTURE_CONTAINER && store.store.energy > (store.store.getCapacity() / 2);
    }

    buildStoreCleaner() {
        if(!this.room.storage) return;
        let store = logistic.storeFor(this.mineral);
        if(_.any(spawnHelper.localCreepsWithRole(this.roomai, carrier.name), (c) => c.memory.source === store.id)) {
            return;
        }

        let parts = spawnHelper.bestAvailableParts(this.room, carrier.configsForCapacity(100));
        let memory = {
            role: carrier.name,
            source: store.id,
            destination: this.room.storage.id,
            resource: "energy"
        };

        this.roomai.spawn(parts, memory);
        console.log("Mineral store in " + this.room.name + " contains energy. Cleaning up!");
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'MineralsAspect');
