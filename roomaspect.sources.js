var spawnHelper = require("helper.spawning");

var container = require("construction.containers");
var logistic = require('helper.logistic');
var miner = require("role.miner");

module.exports = function(roomai) {
    var room = roomai.room;
    var sources = room.find(FIND_SOURCES);

    // order sources by distance to primary spawn, to ensure that aspects
    // work on that source first
    sources = _.sortBy(sources, (s) => s.pos.getRangeTo(roomai.spawns[0]));
    return {
        run: function() {
            this.buildContainers();
            this.buildMiners();
        },
        buildContainers: function() {
            if(Game.time % 20 != 0) {
                return;
            }

            for(var source of sources) {
                container.buildNear(source);
            }
        },
        buildMiners: function() {
            if(!roomai.canSpawn()) {
                return;
            }

            let parts = spawnHelper.bestAffordableParts(room, miner.energyConfigs, true);
            let spawnDuration = spawnHelper.spawnDuration(parts);
            let existingMiners = _.filter(spawnHelper.localCreepsWithRole(roomai, miner.name), (c) => !c.ticksToLive || c.ticksToLive > spawnDuration);
            for(var source of sources) {
                if(!_.any(existingMiners, (m) => m.memory.target == source.id) &&
                    logistic.storeFor(source)) {

                    var memory = {
                        role: miner.name,
                        target: source.id,
                        resource: RESOURCE_ENERGY
                    };

                    roomai.spawn(parts, memory);
                }
            }

        }
    }
};
