var storeStructures = [
    STRUCTURE_CONTAINER, 
    STRUCTURE_LINK,
    STRUCTURE_STORAGE,
    STRUCTURE_TERMINAL
];

module.exports = {
    storeFor: function(target) {
        var structures = target.pos.findInRange(FIND_STRUCTURES, 2);
        return _.find(structures, (r) => storeStructures.includes(r.structureType));
    }
};