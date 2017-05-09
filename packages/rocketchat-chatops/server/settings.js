Meteor.startup(function () {
    RocketChat.settings.addGroup('Chatops');
    RocketChat.settings.add('Chatops_Enabled', false, {
        type: 'boolean',
        group: 'Chatops',
        'public': true
    });
    RocketChat.settings.add('Chatops_Username', false, {
        type: 'string',
        group: 'Chatops',
        'public': true
    });
    RocketChat.callbacks.add('afterCreateChannel', function (user, room) {
        RocketChat.models.Locations.setNewRoom(room._id)
        //after delete channel....
    }, RocketChat.callbacks.priority.MEDIUM),
        RocketChat.callbacks.add('afterJoinRoom', function (user, room) {
            addUserLocation(room.rid, user.username)

            // let location = getUserLocation(userInfo)
            // if (location) {
            //     RocketChat.models.locations.addusrLocation(room.rid, location)
            // }
        }, RocketChat.callbacks.priority.MEDIUM)
    RocketChat.callbacks.add('afterLeaveRoom', function (user, room) {
        // console.log(room)
        // console.log(user)
        // let location = getUserLocation(userInfo)
        // if (location) {
        //     nulllifay RocketChat.models.locations.addusrLocation(room.rid, location)
        // }
    }, RocketChat.callbacks.priority.MEDIUM)
    RocketChat.callbacks.add('afterSaveMessage',
        function (message) {
            console.log(message)
            if (message.mentions) {
                if (message.mentions.find(user => { return (user.username == "mapmip") })) {
                    if (message.msg.includes("selfloc(")) {
                        let location = createLocatinObject(message.msg, message.u.username, "selfloc(")
                        if (location) {
                            RocketChat.models.Users.setCustomFields(message.u._id, { location: { lng: location.lng, lat: location.lat, color: location.color ? location.color : null } });
                            location.username = message.u.username
                            Meteor.call('setAllUsers', message.rid)
                            //RocketChat.models.Locations.addusrLocation(message.rid, location)
                        }
                    }
                    else {
                        if (!message.msg.includes("you added new location in")) {
                            let location = createLocatinObject(message.msg, message._id, "@mapmip(")
                            if (location) {
                                location.msgKey = message._id
                                RocketChat.models.Locations.addMsgLocation(message.rid, location)
                            }
                        }

                    }
                }
            }
        }
        , RocketChat.callbacks.priority.LOW),
        RocketChat.callbacks.add('afterDeleteMessage', function (deletedMsg) {
            console.log(deletedMsg)
            //delete message &&& add message id to location            
        }, RocketChat.callbacks.priority.MEDIUM)
});

Meteor.methods({
    setAllUsers(rid) {
        let locations = []
        const channel = RocketChat.models.Rooms.findOneById(rid)
        channel.usernames.forEach(username => {
            let location = getUserLocation(RocketChat.models.Users.findOneByUsername(username))
            if (location) {
                location.username = username
                locations.push(location)
            }
        })
        RocketChat.models.Locations.setUserLocations(rid, locations)
        return { err: null, res: true }
    },
    setAllmessages(rid) {
        console.log("setting all messages locatinos")
        let locations = []
        const records = RocketChat.models.Messages.findVisibleByRoomId(rid, { sort: { ts: -1 }, limit: 99999 }).fetch();
        records.forEach(message => {
            if (message.mentions) {
                if (message.mentions.find(user => { return (user.username == "mapmip") })) {
                    let location
                    if (!message.msg.includes("selfloc(")) {
                        location = createLocatinObject(message.msg, message.id, "@mapmip(")
                        if (location) {
                            locations.push(location)
                        }
                    }
                }
            }
        })
        RocketChat.models.Locations.setMsgLocations(rid, locations)
        return { err: null, res: true }
    },
    addMsgLocation(rid, locations) {
        locations.forEach(loc => {
            RocketChat.models.Locations.addMsgLocation(rid, loc)
        })
        return { err: null, res: true }
    },
    whichDroneToShow(rid) {
        const channel = RocketChat.models.Rooms.findOneById(rid)
        if (channel) {
            channel.usernames.forEach(username => {
                if (username = "drone.op1") {
                    return true
                }
            })
        }

        return false
    }
})

function addUserLocation(rid, username) {
    let location = getUserLocation(RocketChat.models.Users.findOneByUsername(username))
    if (location) {
        location.username = username
        RocketChat.models.Locations.addUserLocation(rid, location)
    }
}

function getUserLocation(user) {
    if (user.customFields) {
        if (user.customFields.location) {
            let location = validateLocation(user.customFields.location)
            return location
        }
    }
}

function createLocatinObject(message, msgKey, keyword) {
    let color;
    message = message.substring(message.indexOf(keyword) + 8, message.indexOf(")"))
    let arr = message.split(",")
    let location = {
        lng: arr[0],
        lat: arr[1],
        color: arr[2] ? arr[2] : null
    }
    if (msgKey == "selfloc(") {
        location = Object.assign(location, { username: msgKey })
    }
    else {
        location = Object.assign(location, { msgKey: msgKey })
    }
    return validateLocation(location)
}

function validateLocation(location) {
    if ((isNaN(location.lng)) || (isNaN(location.lat))) {
        return null
    }
    if (typeof location.lng == "string") {
        location.lng = parseFloat(location.lng)
        location.lat = parseFloat(location.lat)
    }
    if (location.lng > 180 || location.lng < -180 || location.lat < -90 || location.lat > 90) {
        return null
    }
    return {
        lng: location.lng.toFixed(6),
        lat: location.lat.toFixed(6),
        color: location.color ? location.color : null
    }

}


