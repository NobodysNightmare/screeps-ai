

module.exports = class MapKnowledge {
    static updateKnowledge() {
        if(!this.memory) Memory.mapKnowledge = {};

        for(let room of Object.values(Game.rooms)) {
            let knowledge = this.roomKnowledge(room.name);
            if(_.size(knowledge) === 0) {
                this.initializeRoomKnowledge(knowledge, room);
            }

            this.updateRoomKnowledge(knowledge, room);
        }
    }

    static roomKnowledge(name) {
        if(!this.memory[name]) this.memory[name] = {};

        return this.memory[name];
    }

    static get memory() {
        return Memory.mapKnowledge;
    }

    static initializeRoomKnowledge(knowledge, room) {
        let mineral = room.find(FIND_MINERALS)[0];
        let sources = room.find(FIND_SOURCES).length;
        knowledge.mineral = mineral && mineral.mineralType;
        knowledge.sources = sources;

        knowledge.plainTiles = 0;
        knowledge.swampTiles = 0;
        knowledge.wallTiles = 0;
        let terrain = new Room.Terrain(room.name);
        for(let x = 0; x < 50; x++) {
            for(let y = 0; y < 50; y++) {
                if(terrain.get(x, y) === TERRAIN_MASK_SWAMP) {
                    knowledge.swampTiles++;
                } else if(terrain.get(x, y) === TERRAIN_MASK_WALL) {
                    knowledge.wallTiles++;
                } else {
                    knowledge.plainTiles++;
                }
            }
        }
    }

    static updateRoomKnowledge(knowledge, room) {
        if(room.controller) {
            if(room.controller.owner) {
                knowledge.owner = room.controller.owner.username;
            } else if(room.controller.reservation) {
                knowledge.owner = room.controller.reservation.username;
            } else {
                knowledge.owner = null;
            }
        }
    }
}
