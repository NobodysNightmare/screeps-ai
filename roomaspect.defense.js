const spawnHelper = require("helper.spawning");
const guard = require("role.guard");
const reloader = require("role.reloader");

const keyStructures = [
    STRUCTURE_SPAWN,
    STRUCTURE_STORAGE,
    STRUCTURE_TOWER,
    STRUCTURE_EXTENSION
];

const protectedStructures = [
    STRUCTURE_SPAWN,
    STRUCTURE_EXTENSION,
    STRUCTURE_LINK,
    STRUCTURE_STORAGE,
    STRUCTURE_TOWER,
    STRUCTURE_POWER_SPAWN,
    STRUCTURE_LAB,
    STRUCTURE_TERMINAL,
    STRUCTURE_CONTAINER,
    STRUCTURE_NUKER,
    STRUCTURE_OBSERVER
];

module.exports = class DefenseAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
        this.defense = roomai.defense;
    }

    run() {
        this.engageSafeMode();
        this.checkNukes();
        this.buildRamparts();
        this.defense.updateDefcon();
        this.defense.displayDefcon();

        // low-level rooms can't spawn anything meaningful in defense anyways
        if(this.room.controller.level < 4) return;

        if(this.defense.defcon < 3) {
            // keep a reserve on stock unless boosters are otherwise needed
            this.roomai.labs.requestBoost("XUH2O", 10);
        } else {
            this.roomai.labs.requestBoost("XUH2O", 80);
        }

        if(this.defense.defcon < 1) return;

        if(!this.roomai.canSpawn()) return;

        if(spawnHelper.localCreepsWithRole(this.roomai, reloader.name).length < 1 && this.room.controller.level >= 5) {
            this.roomai.spawn(reloader.parts, { role: reloader.name });
        }

        if(this.defense.defcon < 2) return;

        // TODO: determine number of defenders in a useful way
        if(spawnHelper.localCreepsWithRole(this.roomai, guard.name).length < 2) {
            let parts = spawnHelper.bestAvailableParts(this.room, guard.configs(), true);
            this.roomai.spawn(parts, { role: guard.name });
        }
    }

    engageSafeMode() {
        let controller = this.room.controller;
        if(controller.safeMode || controller.upgradeBlocked || controller.level < 6) return;
        if(this.room.find(FIND_MY_STRUCTURES, { filter: (s) => keyStructures.includes(s.structureType) && (s.hits / s.hitsMax) < 0.95 }).length == 0) return;
        if(_.filter(this.defense.hostiles, (c) => c.owner.username !== "Invader").length == 0) return;

        controller.activateSafeMode();
        Game.notify("Safe mode engaged in room " + this.room.name + " (RCL " + controller.level +")");
    }

    checkNukes() {
        let nukes = this.room.find(FIND_NUKES, { filter: (n) => n.timeToLand > NUKE_LAND_TIME - 5})
        for(let nuke of nukes) {
            Game.notify("Nuke incoming at " + this.room.name + " (Origin: " + nuke.launchRoomName + ")");
        }
    }

    buildRamparts() {
        if(!this.roomai.intervals.buildStructure.isActive()) {
            return;
        }

        for(let structure of this.room.find(FIND_STRUCTURES, { filter: (s) => protectedStructures.includes(s.structureType) })) {
            this.room.createConstructionSite(structure.pos, STRUCTURE_RAMPART);
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'DefenseAspect');
