const logistic = require("helper.logistic");

module.exports = function(room) {
    if(!room.memory.links) {
        room.memory.links = {
            cache: {},
            requests: []
        };
    }
    
    return {
        storage: function() {
            return this.linkAt(room.storage);
        },
        controller: function() {
            return this.linkAt(room.controller);
        },
        sources: function() {
            let sources = room.find(FIND_SOURCES);
            return _.compact(_.map(sources, (s) => this.linkAt(s)));
        },
        linkAt: function(target) {
            let link = Game.getObjectById(room.memory.links.cache[target.id]);
            if(link) return link;
            
            link = logistic.storeFor(target, false, STRUCTURE_LINK);
            if(link) {
                room.memory.links.cache[target.id] = link.id;
            }
            
            return link;
        },
        requestEnergy: function(link) {
            if(room.memory.links.requests.indexOf(link.id) === -1) {
               room.memory.links.requests.push(link.id);
            }
        },
        cancelRequest: function(link) {
            let index = room.memory.links.requests.indexOf(link.id);
            if(index > -1) {
               room.memory.links.requests.splice(index, 1);
            }
        },
        checkOpenRequests: function() {
            return room.memory.links.requests.length > 0;
        },
        fullfillRequests: function() {
            if(this.storage().energy >= 500) {
                let target = Game.getObjectById(room.memory.links.requests.shift());
                if(target) {
                    let result = this.storage().transferEnergy(target);
                    if(result !== OK) {
                        room.memory.links.requests.unshift(target.id);
                    }
                }
            }
        }
    };
};