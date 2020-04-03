const friends = [
    "Baj",
    "cazantyl",
    "daboross",
    "DoctorPC",
    "Geir1983",
    "Hernanduer",
    "InvisioBlack",
    "likeafox",
    "Parthon",
    "poppahorse",
    "Regnare",
    "Subodai",
    "Tijnoz",
    "Totalschaden",
    "Vlahn",
    "W4rl0ck",
    "Yilmas",
    "Zeekner",
    "Zpike",
    "Zyzyzyryxy"
];

module.exports = {
    findHostiles: function(room, options) {
        let filter = (c) => true;
        if(options && options.filter) filter = options.filter;
        return room.find(FIND_HOSTILE_CREEPS, { filter: (c) => !friends.includes(c.owner.username) && filter(c) });
    },
    findClosestHostileByRange: function(position, options) {
        let filter = (c) => true;
        if(options && options.filter) filter = options.filter;
        return position.findClosestByRange(FIND_HOSTILE_CREEPS, { filter: (c) => !friends.includes(c.owner.username) && filter(c) });
    },
    findAllies: function(room) {
        let filter = (c) => true;
        if(options && options.filter) filter = options.filter;
        return room.find(FIND_HOSTILE_CREEPS, { filter: (c) => friends.includes(c.owner.username) && filter(c) });
    },
    isHostile: function(ownedThing) {
        if(!ownedThing.owner) return false;
        return !ownedThing.my && !friends.includes(ownedThing.owner.username);
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'ff');
