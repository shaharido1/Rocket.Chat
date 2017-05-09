class Locations extends RocketChat.models._Base {
    constructor() {
        super('locations')
        this.tryEnsureIndex({ rid: 1 }, { unique: 1 })
    }

    getByRid(rid) {
        const query = { rid: rid };
        return this.findOne(query);
    }


    setNewRoom(rid) {
        return this.insert({ rid: rid, msgLocations: [], userLocations: [] })
    }

    setMsgLocations(rid, msgLocations) {
        let query = { rid :rid };
        return this.update(query, { $set: { msgLocations: msgLocations } })
    }

    setUserLocations(rid, userLocations) {
        let query = { rid:rid };
        return this.update(query, { $set: { userLocations: userLocations } })
    }

    addMsgLocation(rid, msgLocation) { 
        let query = { rid:rid };
        let update = {
            $addToSet: {
                msgLocations: msgLocation
            }
        }
        return this.upsert(query, update)
    }

    addUserLocation(rid, usrLocation) {
        let query = { rid:rid };
        let update = {
            $addToSet: {
                userLocations: usrLocation
            }
        }
        return this.upsert(query, update)
    }



}

RocketChat.models.Locations = new Locations();
