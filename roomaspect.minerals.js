var container = require("construction.containers");
var spawnHelper = require("helper.spawning");

var carrier = require("role.carrier");
var miner = require("role.miner");

module.exports = function(roomai) {
    var room = roomai.room;
    var mineral = room.find(FIND_MINERALS)[0];
    return {
        run: function() {
            if(room.controller.level < 6) {
                return;
            }

            if(this.hasExtractor()) {
                if(this.needWorkers()) {
                    this.buildMiner();
                    this.buildCarrier();
                }
            }

            this.buildStructures();
        },
        buildMiner: function() {
            var existingMiners = spawnHelper.localCreepsWithRole(roomai, miner.name);
            if(_.any(existingMiners, (c) => c.memory.target == mineral.id)) {
                return;
            }

            var parts = spawnHelper.bestAvailableParts(room, miner.mineralConfigs);
            var memory = {
                role: miner.name,
                target: mineral.id,
                resource: mineral.mineralType
            };

            roomai.spawn(parts, memory);
        },
        buildCarrier: function() {
            if(!this.masterRoom() ||
                !this.masterRoom().terminal ||
                _.filter(spawnHelper.globalCreepsWithRole(carrier.name), (creep) => creep.memory.source == mineral.id).length > 0) {
                return;
            }

            var parts = spawnHelper.bestAvailableParts(room, carrier.partConfigs);
            var memory = {
                role: carrier.name,
                source: mineral.id,
                destination: this.masterRoom().terminal.id,
                resource: mineral.mineralType
            };

            roomai.spawn(parts, memory);
        },
        buildStructures: function() {
            if(Game.time % 20 != 0) {
                return;
            }

            room.createConstructionSite(mineral.pos, STRUCTURE_EXTRACTOR);
            container.buildNear(mineral);
        },
        masterRoom: function() {
            return Game.rooms[room.memory.slaveOf];
        },
        hasExtractor: function() {
            return room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_EXTRACTOR }).length > 0;
        },
        needWorkers: function() {
            return roomai.canSpawn() && mineral.mineralAmount > 0;
        }
    }
};
