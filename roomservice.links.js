const buildings = require("helper.buildings");
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

    replaceNextContainerByLink() {
        // syncing up with store building. Executing one tick ahead of store builders
        if(Game.time % buildings.intervals.store !== buildings.intervals.store - 1) return;
        if(!this.storage()) return;
        if(buildings.available(this.room, STRUCTURE_LINK) == 0) return;
        if(buildings.underConstruction(this.room, STRUCTURE_LINK) > 0) return;

        let targets = [this.room.controller] + this.room.find(FIND_SOURCES);
        for(let target of targets) {
            if(!this.linkAt(target)) {
                let store = logistic.storeFor(target);
                if(store && store.structureType === STRUCTURE_CONTAINER) {
                    console.log("Link Replacement: Destroying container at " + store.pos + ".")
                    store.destroy();

                    // only replace one container at a time:
                    // return when we found a destroyable container
                    return;
                } else if(!store) {
                    // only replace one container at a time:
                    // wait for link to be built up completely
                    return;
                }

                // there is a non-link, non-container storage at the target.
                // presumably a terminal or storage, continuing without replacement
            }
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'Links');
