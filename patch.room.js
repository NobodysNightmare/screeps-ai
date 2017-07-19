const RoomAI = require('roomai.base');

Room.prototype.ai = function() {
    if(this._ai === undefined) {
        if(this.controller && this.controller.my) {
            this._ai = new RoomAI(this);
        } else {
            this._ai = null;
        }
    }

    return this._ai;
}

Room.prototype.powerSpawn = function() {
    if(this._powerSpawn === undefined) {
        if(this.controller && this.controller.my && this.controller.level >= 8) {
            this._powerSpawn = this.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_POWER_SPAWN })[0];
        } else {
            this._powerSpawn = null;
        }
    }

    return this._powerSpawn;
}

Room.prototype.nuker = function() {
    if(this._nuker === undefined) {
        if(this.controller && this.controller.my && this.controller.level >= 8) {
            this._nuker = this.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_NUKER })[0];
        } else {
            this._nuker = null;
        }
    }

    return this._nuker;
}

Room.prototype.storagePos = function() {
    if(this.storage) return this.storage.pos;

    let constructions = this.memory.constructions;
    if(!constructions) return null;
    let storageBuilding = constructions.storage[0];
    if(!storageBuilding) return null;

    return new RoomPosition(storageBuilding.x, storageBuilding.y, this.name);
}
