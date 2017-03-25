const logistic = require("helper.logistic");

module.exports = class Links {
    constructor(room) {
        if(!room.memory.links) {
            room.memory.links = {
                cache: {},
                requests: []
            };
        }
        this.room = room;
    }

    storage() {
        return this.linkAt(this.room.storage);
    }

    controller() {
        return this.linkAt(this.room.controller);
    }

    sources() {
        let sources = this.room.find(FIND_SOURCES);
        return _.compact(_.map(sources, (s) => this.linkAt(s)));
    }

    linkAt(target) {
        let linkId = this.room.memory.links.cache[target.id];
        if(_.isNumber(linkId) && Game.time < linkId) return;

        let link = Game.getObjectById(linkId);
        if(link) return link;

        link = logistic.storeFor(target, false, STRUCTURE_LINK);
        if(link) {
            this.room.memory.links.cache[target.id] = link.id;
        } else {
            this.room.memory.links.cache[target.id] = Game.time + 40;
        }

        return link;
    }

    requestEnergy(link) {
        if(this.room.memory.links.requests.indexOf(link.id) === -1) {
           this.room.memory.links.requests.push(link.id);
        }
    }

    cancelRequest(link) {
        let index = this.room.memory.links.requests.indexOf(link.id);
        if(index > -1) {
           this.room.memory.links.requests.splice(index, 1);
        }
    }

    checkOpenRequests() {
        return this.room.memory.links.requests.length > 0;
    }

    fullfillRequests() {
        if(this.storage().energy >= 500) {
            let target = Game.getObjectById(this.room.memory.links.requests.shift());
            if(target) {
                let result = this.storage().transferEnergy(target);
                if(result !== OK) {
                    this.room.memory.links.requests.unshift(target.id);
                }
            }
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'Links');
