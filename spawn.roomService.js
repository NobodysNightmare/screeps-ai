var roles = [
    require("role.harvester"),
    require("role.upgrader"),
    require("role.builder")
];

module.exports = {
    perform: function(spawn) {
        for(var role of roles) {
            if(role.shouldBuild(spawn)) {
                var parts = role.chooseParts(spawn.room);
                
                spawn.createCreep(parts, undefined, { role: role.name });
                return true;
            }
        }
        
        return false;
    }
};