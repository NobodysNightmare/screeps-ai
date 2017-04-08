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
        if(this.room.memory.defense) {
            this.memory = this.room.memory.defense;
        } else {
            this.memory = {};
            this.room.memory.defense = this.memory;
        }
    }

    run() {
        this.engageSafeMode();
        this.updateAttackTimes();
        this.displayAttackTime();
        var primaryHostile = Game.getObjectById(this.room.memory.primaryHostile);

        if(!primaryHostile || primaryHostile.pos.roomName != this.room.name) {
            primaryHostile = null;
            if(this.hostiles.length > 0) {
                primaryHostile = this.hostiles[0];
            }

            this.room.memory.primaryHostile = primaryHostile && primaryHostile.id;
        }

        if(!this.roomai.canSpawn() || !primaryHostile || this.attackTime <= 50) {
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
        if(_.filter(this.hostiles, (c) => c.owner.username !== "Invader").length == 0) return;

        controller.activateSafeMode();
        Game.notify("Safe mode engaged in room " + this.room.name + " (RCL " + controller.level +")");
    }
    
    updateAttackTimes() {
        if(this.hostiles.length > 0) {
            if(!this.memory.attackTime) this.memory.attackTime = 0;
            this.memory.attackTime += 1;
            this.memory.attackCooldown = 100;
        } else {
            if(this.memory.attackCooldown > 0) this.memory.attackCooldown -= 1;
            
            if(this.memory.attackCooldown == 0) {
                this.memory.attackTime = 0;
            }
        }
    }
    
    displayAttackTime() {
        if(this.attackTime == 0) return;
        this.room.visual.text("Attack time: " + this.attackTime, 0, 0, { align: "left", color: "#faa", stroke: "#000" });
    }
    
    get hostiles() {
        if(!this._hostiles) this._hostiles = ff.findHostiles(this.room);
        
        return this._hostiles;
    }
    
    get attackTime() {
        return this.memory.attackTime || 0;
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'DefenseAspect');
