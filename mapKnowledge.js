const roomKnowledgeOutdatedAfter = 15000;

const mineralColors = {
    K: "#aa55ff",
    L: "#55ff55",
    U: "#55aaff",
    X: "#ff5555",
    Z: "#ffff55"
}

module.exports = class MapKnowledge {
    static updateKnowledge() {
        if(!this.memory) Memory.mapKnowledge = {};

        for(let room of Object.values(Game.rooms)) {
            let knowledge = this.roomKnowledge(room.name);
            if(!knowledge.lastUpdate) {
                this.initializeRoomKnowledge(knowledge, room);
            }

            this.updateRoomKnowledge(knowledge, room);
        }
    }

    static roomKnowledge(room) {
        let name = room.name || room;
        if(!this.memory[name]) this.memory[name] = {};

        return this.memory[name];
    }

    static knowledgeList() {
        let rooms = Object.keys(this.memory);
        return _.map(rooms, (r) => ({ name: r, knowledge: this.roomKnowledge(r) }));
    }

    static get memory() {
        return Memory.mapKnowledge;
    }

    static initializeRoomKnowledge(knowledge, room) {
        let mineral = room.find(FIND_MINERALS)[0];
        let sources = room.find(FIND_SOURCES).length;
        knowledge.mineral = mineral && mineral.mineralType;
        knowledge.sources = sources;
        knowledge.claimable = !!room.controller;

        knowledge.plainTiles = 0;
        knowledge.swampTiles = 0;
        knowledge.wallTiles = 0;
        let terrain = Game.map.getRoomTerrain(room.name);
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
        knowledge.lastUpdate = Game.time;
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

    static drawMapVisuals() {
        for(let roomName in this.memory) {
            let knowledge = this.memory[roomName];
            let updatedColor = '#ff0000';
            if(knowledge.lastUpdate) {
                if(knowledge.lastUpdate < Game.time - roomKnowledgeOutdatedAfter) updatedColor = '#ffff00';
                else updatedColor = '#00ff00';
            }

            Game.map.visual.circle(new RoomPosition(3, 3, roomName), { radius: 2, fill: updatedColor })
            if(knowledge.mineral) {
                let color = mineralColors[knowledge.mineral] || '#ffffff';
                Game.map.visual.text(knowledge.mineral, new RoomPosition(46, 46, roomName), { fontSize: 8, color: color, align: 'center', opacity: 1.0 })
            }
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'MapKnowledge');
