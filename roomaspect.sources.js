var spawnHelper = require("helper.spawning");

var container = require("construction.containers");
var logistic = require('helper.logistic');
var miner = require("role.miner");

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
        this.buildContainers();
        this.buildMiners();
    }

    buildContainers() {
        if(Game.time % 20 != 0) {
            return;
        }

        for(let source of this.sources) {
            container.buildNear(source);
        }
    }

    buildMiners() {
        if(!this.roomai.canSpawn()) {
            return;
        }

        let parts = spawnHelper.bestAffordableParts(this.room, miner.energyConfigs, true);
        let spawnDuration = spawnHelper.spawnDuration(parts);
        let existingMiners = _.filter(spawnHelper.localCreepsWithRole(this.roomai, miner.name), (c) => !c.ticksToLive || c.ticksToLive > spawnDuration);
        for(let source of this.sources) {
            if(!_.any(existingMiners, (m) => m.memory.target == source.id) &&
                logistic.storeFor(source)) {

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
