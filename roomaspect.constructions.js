module.exports = class ConstructionsAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
    }

    run() {
        this.roomai.constructions.addBuildings();
        this.roomai.constructions.removeBuildings();

        for(let building of this.roomai.constructions.buildings) {
            building.outline();
            if(Game.time % 90 == 0) {
                building.build();
            }
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'ConstructionsAspect');
