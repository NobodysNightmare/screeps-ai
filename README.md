# NobodysNightmare's Screeps AI

This is my personal AI for the computer game [Screeps](https://screeps.com).

## Manual control

### Build Extension Cluster

Place a flag called **extensionCluster** inside a claimed room.
This will mark a permanent area for extensions.

A **clear** flag on the same spot will remove that area again.

### Draining a hostile room

To spawn some creeps that drain a hostile room by attracting the towers
fire, place a **drain** flag in the target room and a **spawnDrain** flag
in the room that shall spawn the creeps for that operation.

## TODOs

* Use links to collect energy from remote mines at room border
* Better defense mechanics
    * Automatic Safe-Mode activation
    * towers should attack target picked by defense aspect
    * defense aspect should actually "think" about which target to pick
    * while defending a reloader should keep towers supplied with energy
    * Better rampart/wall mechanics
        * allow higher repair levels
        * probably different levels for ramparts depending on purpose (e.g. more on Spawner?)
* Rework room claiming
    * more independence on "main" room
    * more accessible way to initiate claiming
    * automatically start claiming as soon as room is ready
* Be more conservative during supply shortage
    * e.g. only spawn one upgrader
* Improve base building
    * build storage in a good location
    * build towers
* Allow to define and recognize allied players (do not harm them)
