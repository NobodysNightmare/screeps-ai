module.exports = class Spawns {
    constructor(room) {
        this.room = room;
        this.spawns = room.find(FIND_MY_SPAWNS);
        this.availableSpawns = _.filter(this.spawns, (s) => !s.spawning);

        // primary spawn is still used in some places; TODO: find out if necessary
        this.primary = this.spawns[0];
    }

    spawn(parts, memory) {
        let spawn = this.availableSpawns[0];
        if(!spawn || this.spawnReserved) {
            return false;
        }

        let result = spawn.createCreep(parts, undefined, memory);
        if(_.isString(result)) {
            this.availableSpawns.shift();
        } else if(result === ERR_NOT_ENOUGH_ENERGY) {
            this.spawnReserved = true;
        }

        return result;
    }

    canSpawn() {
        return !this.spawnReserved && this.availableSpawns.length > 0;
    }

    renderOverlay() {
        for(let spawn of this.spawns) {
            this.renderSpawnOverlay(spawn);
        }
    }

    renderSpawnOverlay(spawn) {
        if(spawn.spawning) {
            let role = Game.creeps[spawn.spawning.name].memory.role;
            let remaining = spawn.spawning.remainingTime;
            spawn.room.visual.rect(spawn.pos.x - 1.3, spawn.pos.y + 0.9, 2.6, 0.6,{fill: '#333', opacity: 0.8, stroke: '#fff', strokeWidth: 0.03 });
            spawn.room.visual.text(role, spawn.pos.x - 0.0, spawn.pos.y + 1.3, { align: "center", size: 0.4 });
            spawn.room.visual.circle(spawn.pos, {fill: '#000000', radius: 0.5, opacity: 0.8 });
            spawn.room.visual.text(remaining, spawn.pos.x - 0.0, spawn.pos.y + 0.2, { align: "center", size: 0.6 })
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'Spawns');
