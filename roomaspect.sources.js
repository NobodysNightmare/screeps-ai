const logistic = require('helper.logistic');
const miner = require("role.miner");
const roads = require("construction.roads");
const spawnHelper = require("helper.spawning");
const store = require("construction.stores");

const energyExcessThreshold = 50000;

module.exports = class SourcesAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
        this.sources = this.room.find(FIND_SOURCES);

        // order sources by distance to primary spawn, to ensure that aspects
        // work on that source first
        this.sources = _.sortBy(this.sources, (s) => s.pos.getRangeTo(roomai.spawns.primary));
    }

    run() {
        this.buildStores();
        this.buildRoads();
        this.buildMiners();
    }

    buildStores() {
        if(!this.roomai.intervals.buildStores.isActive()) {
            return;
        }

        for(let source of this.sources) {
            store.buildWithAccessTo(source, true);
        }
    }

    buildRoads() {
        let storagePos = this.room.storagePos();
        if(!this.roomai.intervals.buildComplexStructure.isActive() || !storagePos) {
            return;
        }

        for(let source of this.sources) {
            roads.buildRoadFromTo(this.room, storagePos, source.pos);
        }
    }

    buildMiners() {
        if(!this.roomai.canSpawn()) {
            return;
        }

        let hasExcessEnergy = this.roomai.trading.requiredExportFromRoom(RESOURCE_ENERGY) >= energyExcessThreshold;
        if(hasExcessEnergy) return;

        let parts = spawnHelper.bestAffordableParts(this.room, miner.energyConfigs, true);
        let spawnDuration = spawnHelper.spawnDuration(parts);
        let existingMiners = _.filter(spawnHelper.localCreepsWithRole(this.roomai, miner.name), (c) => !c.ticksToLive || c.ticksToLive > spawnDuration);
        for(let source of this.sources) {
            if(!_.any(existingMiners, (m) => m.memory.target == source.id)) {

                var memory = {
                    role: miner.name,
                    target: source.id,
                    resource: RESOURCE_ENERGY
                };

                this.roomai.spawn(parts, memory);
            }
        }

    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'SourcesAspect');
