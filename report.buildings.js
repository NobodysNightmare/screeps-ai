const ignoredStructures = ["rampart", "constructedWall", "road", "container", "powerSpawn", "factory"];

const expectationOverrides = {
    link: (r) => r.find(FIND_SOURCES).length + 2
}

class BuildingsReport {
    report() {
        for(let room of _.filter(Game.rooms, (r) => r.ai())) {
            console.log(`---- Report for ${room.name} ----`)
            let structures = _.groupBy(room.find(FIND_MY_STRUCTURES), (s) => s.structureType);
            for(let structureType in CONTROLLER_STRUCTURES) {
                if(ignoredStructures.includes(structureType)) continue;

                let expected = CONTROLLER_STRUCTURES[structureType][room.controller.level];
                if(expectationOverrides[structureType]) {
                    expected = expectationOverrides[structureType](room);
                }

                let actual = (structures[structureType] || []).length;

                if(actual < expected) {
                    console.log(`${actual} / ${expected} ${structureType}`)
                }
            }
        }
    }
}

module.exports = new  BuildingsReport();
