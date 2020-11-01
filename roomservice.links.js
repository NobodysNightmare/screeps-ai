const buildings = require("helper.buildings");
const logistic = require("helper.logistic");

module.exports = class Links {
    constructor(room) {
        if(!room.memory.links) {
            room.memory.links = {
                cache: {}
            };
        }
        this.room = room;
        this.memory = room.memory;
        this.requests = [];
    }

    storage() {
        if(!this.room.storage) return null;
        return this.linkAt(this.room.storage);
    }

    controller() {
        return this.linkAt(this.room.controller);
    }

    sources() {
        let sources = this.room.find(FIND_SOURCES);
        return _.compact(_.map(sources, (s) => this.linkAt(s)));
    }

    availableSenderLinks() {
        let result = this.sources();
        if(this.storage()) result.push(this.storage());

        return _.sortBy(_.filter(result, (l) => l.cooldown === 0), (l) => -l.store.energy);
    }

    linkAt(target) {
        let linkId = this.memory.links.cache[target.id];
        if(_.isNumber(linkId) && Game.time < linkId) return;

        let link = Game.getObjectById(linkId);
        if(link) return link;

        link = logistic.storeFor(target, false, STRUCTURE_LINK);
        if(link) {
            this.memory.links.cache[target.id] = link.id;
        } else {
            this.memory.links.cache[target.id] = Game.time + 40;
        }

        return link;
    }

    requestEnergy(link, priority) {
        this.requests.push({ link: link, priority: priority });
    }

    checkOpenRequests() {
        return this.memory.pendingRequests;
    }

    // FIXME: when controller and source share a link, there is a lot of ping pong
    // happening between controller and storage
    fullfillRequests() {
        let receiver = _.sortBy(this.requests, (req) => -req.priority)[0];
        if(receiver) {
            receiver = receiver.link;
            this.memory.pendingRequests = true;
        } else {
            // if there are no other requests, we transfer to the storage
            // avoiding minuscle transfers, to keep cooldown pressure low
            if(this.storage() && this.storage().store.getFreeCapacity(RESOURCE_ENERGY) >= 400) {
                receiver = this.storage();
            }
            this.memory.pendingRequests = false;
        }

        if(!receiver) return;

        let sender = _.filter(this.availableSenderLinks(), (l) => l !== receiver)[0];
        if(!sender) return;

        if(sender.store.energy >= receiver.store.getFreeCapacity(RESOURCE_ENERGY)) {
            sender.transferEnergy(receiver);
        }
    }

    replaceNextContainerByLink() {
        if(this.room.ai().intervals.buildStructure.isActiveIn(1)) return;
        if(!this.storage()) return;
        if(buildings.available(this.room, STRUCTURE_LINK) == 0) return;
        if(buildings.underConstruction(this.room, STRUCTURE_LINK) > 0) return;

        let targets = [this.room.controller].concat(this.room.find(FIND_SOURCES));
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
