var roles = [
    require("role.harvester"),
    require("role.upgrader"),
    require("role.builder"),
    require("role.miner")
];

module.exports = {
    perform: function(spawn) {
        for(var role of roles) {
            if(role.shouldBuild(spawn)) {
                var parts = role.chooseParts(spawn.room);
                var memory = { role: role.name };
                
                // TODO: have mineral controller that is responsible for spawning miner
                if(role.name == 'miner') {
                    var mineral = spawn.room.find(FIND_MINERALS)[0];
                    memory.target = mineral.id;
                    memory.resource = mineral.mineralType;
                }
                
                spawn.createCreep(parts, undefined, memory);
                return true;
            }
        }
        
        return false;
    }
};