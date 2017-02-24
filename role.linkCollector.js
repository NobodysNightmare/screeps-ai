module.exports = {
    name: "linkCollector",
    parts: [CARRY, CARRY, MOVE],
    run: function(creep) {
        // creep is run inside the supplies aspect, so that it has access
        // to the links service... this feels kinda weird
    }
};