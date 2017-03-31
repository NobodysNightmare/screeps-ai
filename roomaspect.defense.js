const ff = require("helper.friendFoeRecognition");
var spawnHelper = require("helper.spawning");
var defender = require("role.defender");

const keyStructures = [
    STRUCTURE_SPAWN,
    STRUCTURE_STORAGE,
    STRUCTURE_TOWER,
    STRUCTURE_EXTENSION
];

module.exports = class DefenseAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
    }

    run() {
        this.engageSafeMode();
        var primaryHostile = Game.getObjectById(this.room.memory.primaryHostile);

        if(!primaryHostile || primaryHostile.pos.roomName != this.room.name) {
            primaryHostile = null;
            var hostiles = ff.findHostiles(this.room);
            if(hostiles.length > 0) {
                primaryHostile = hostiles[0];
            }

            this.room.memory.primaryHostile = primaryHostile && primaryHostile.id;
        }

        if(!this.roomai.canSpawn() || !primaryHostile) {
            return;
        }

        // TODO: determine number of defenders in a useful way
        if(_.filter(spawnHelper.globalCreepsWithRole(defender.name), (c) => c.memory.room == this.room.name).length <= 3) {
            var parts = spawnHelper.bestAffordableParts(this.room, defender.meeleeConfigs, true);
            this.roomai.spawn(parts, { role: defender.name, room: this.room.name, originRoom: this.room.name });
        }
    }

    engageSafeMode() {
        let controller = this.room.controller;
        if(controller.safeMode || controller.upgradeBlocked || controller.level < 5) return;
        if(this.room.find(FIND_MY_STRUCTURES, { filter: (s) => keyStructures.includes(s.structureType) && (s.hits / s.hitsMax) < 0.95 }).length == 0) return;
        if(ff.findHostiles(this.room, { filter: (c) => c.owner.username !== "Invader" }).length == 0) return;

        controller.activateSafeMode();
        Game.notify("Safe mode engaged in room " + this.room.name + " (RCL " + controller.level +")");
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'DefenseAspect');
