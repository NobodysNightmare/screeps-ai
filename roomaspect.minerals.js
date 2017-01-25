var container = require("construction.containers");
var spawnHelper = require("helper.spawning");

var carrier = require("role.carrier");
var miner = require("role.miner");

module.exports = function(roomai) {
    var room = roomai.room;
    var mineral = room.find(FIND_MINERALS)[0];
    return {
        run: function() {
            if(!room.controller || room.controller.level < 6) {
                return;
            }
            
            this.buildMiner();
            this.buildCarrier();
            this.buildStructures();
        },
        buildMiner: function() {
            if(!roomai.canSpawn() ||
                mineral.mineralAmount == 0 ||
                spawnHelper.numberOfCreeps(room, miner.name) > 0 ||
                room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_EXTRACTOR }).length == 0) {
                return;
            }
            
            var parts = spawnHelper.bestAvailableParts(room, miner.partConfigs);
            var memory = {
                role: miner.name,
                target: mineral.id,
                resource: mineral.mineralType
            };
            
            roomai.spawn(parts, memory);
        },
        buildCarrier: function() {
            if(!roomai.canSpawn() ||
                mineral.mineralAmount == 0 ||
                !this.masterRoom() ||
                !this.masterRoom().terminal ||
                _.filter(Game.creeps, (creep) => creep.memory.role == carrier.name && creep.memory.source == mineral.id).length > 0) {
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
        }
    }
};