var roles = [
    require("role.harvester"),
    require("role.upgrader"),
    require("role.builder")
];

module.exports = {
    perform: function(spawn) {
        for(var role of roles) {
            if(role.shouldBuild(spawn)) {
                var parts = _.find(role.partConfigs, function(config) {
                    return _.sum(_.map(config, (part) => BODYPART_COST[part])) <= spawn.room.energyCapacityAvailable;
                });
                spawn.createCreep(parts, undefined, { role: role.name });
                return true;
            }
        }
        
        return false;
    }
};