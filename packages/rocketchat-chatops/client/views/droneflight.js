
import { union } from 'lodash'
import { getIpLocation } from './getUserIpLocation'
import { mipMaplistener, linkLocListener } from './listeners'
import toastr from 'toastr';

Template.chatops_droneflight.helpers({
    mampim_url: function () {
        let rid = Session.keys.openedRoom.substring(1, Session.keys.openedRoom.length - 1)
        let allLocations = []
        //let baseUrl = sessionStorage.getItem(rid + "baseUrl")
        let baseUrl = Session.get('baseUrlReactive')
        let locationDoc = RocketChat.models.Locations.find({ "rid": rid }).fetch()[0]
        if (locationDoc) {
            if (locationDoc.userLocations) {
                locationDoc.userLocations = colorUsersLocations(locationDoc.userLocations, sessionStorage.getItem('username'))
            }
            allLocations = union(locationDoc.userLocations, locationDoc.msgLocations)
            if (allLocations) {
                sessionStorage.setItem(rid + "dblocations", JSON.stringify(allLocations))
            }
        }
        return mipmapUrlCreater(allLocations, baseUrl)
    }
});

Template.chatops_droneflight.events({
    'click .refreshUsers': function () {
        Meteor.call('setAllUsers', this.rid, (err, res) => {
            if (err) {
                toastr.error("fail to refresh users locations")
                console.log(err)
            }
            if (res) {
                toastr.success("user locations updated")
            }
        })
    },
    'click .refreshMessage': function () {
        Meteor.call('setAllmessages', this.rid, (err, res) => {
            if (err) {
                toastr.error("fail to refresh messages locations")
                console.log(err)
            }
            if (res) {
                toastr.success("messages locations updated")
            }
        })
    },
    'click .setIp': setUserLocation,
    // 'click .getLiveUpdates': function () {
    //     let self = Template.instance()
    //     if (self.subscribeOn) {
    //         self.subscription.stop()
    //     }
    //     else {
    //        self.subscription = self.subscribe('locations', rid)
    //     }
    //     self.subscribeOn= !self.subscribeOn
    // },
    'click .refreshMap' : function () {
        toastr.success("refresh all")
        sessionStorage.setItem(this.rid + "baseUrl", "http://mapmip.webiks.com")
        Session.set('baseUrlReactive', "http://mapmip.webiks.com")
        Meteor.call('setAllUsers', this.rid)
        Meteor.call('setAllmessages', this.rid)
    }
})

Template.chatops_droneflight.onCreated(function () {
    let rid = Session.keys.openedRoom.substring(1, Session.keys.openedRoom.length - 1)
    if (!sessionStorage.getItem("username")) {
        sessionStorage.setItem("username", RocketChat.models.Users.findOne(Meteor.userId()).username)
    }
    self = this
    Session.set('baseUrlReactive', sessionStorage.getItem(rid + "baseUrl"))
    self.subscribe('locations', rid)
    //self.subscribeOn = true
    Meteor.call('setAllUsers', rid)
    console.log("listener on" + rid)
    window.addEventListener("click", linkLocListener, false)
    window.addEventListener("message", mipMaplistener, false)
    RocketChat.callbacks.add('roomExit', () => {
        onDestroyListener()
    })
})

Template.chatops_droneflight.onDestroyed(function () {
    try {
        onDestroyListener()
    }
    catch (err) { console.log(err) }
})



function colorUsersLocations(userLocations, username) {
    return userLocations.map(loc => {
        loc.color = loc.color ?
            loc.color :
            username == loc.username ?
                "man" :
                "man2"
        return loc
    })
}


///////////////////////////////////the iframe + zoom on location listener///////////////////////


function onDestroyListener() {
    let rid = Session.keys.openedRoom.substring(1, Session.keys.openedRoom.length - 1)
    window.removeEventListener("message", mipMaplistener)
    window.removeEventListener("click", linkLocListener)
    console.log("listener off" + rid)
    if (sessionStorage.getItem("locationToAdd") && (JSON.parse(sessionStorage.getItem("locationToAdd").length))) {
        Meteor.call('addMsgLocation', rid, JSON.parse(sessionStorage.getItem("locationToAdd")), (err, res) => {
            sessionStorage.setItem("locationToAdd", [])
        })
    }
}

////////////////////////////mipmapUrlCreater///////////////////////////////////////////
function mipmapUrlCreater(locations, baseUrl) {
    if (!baseUrl) { 
        baseUrl = "http://mapmip.webiks.com"
    }
    if (!locations[0]) { 
        return baseUrl 
    }
    let returnUrl
    if (baseUrl.includes("&zoom")) {
        returnUrl = baseUrl + "markers="
    }
    else {
        returnUrl = baseUrl + "/leaflet?lng=" + locations[0].lng + "&lat=" + locations[0].lat + "&zoom=6&markers="
    }
    locations.forEach(location => {
        if (location) {
            returnUrl = returnUrl.concat("(" + location.lng + "," + location.lat + "," + location.color + "),")
        }
    })
    return returnUrl
}

/////////////////////////set user locaiton from ip/////////////////////////////////////////////
function setUserLocation() {
    let rid = Session.keys.openedRoom.substring(1, Session.keys.openedRoom.length - 1)
    toastr.warning("getting ip location")
    getIpLocation()
        .then(location => {
            Meteor.call('saveUserProfile', {}, { location: { lng: location.lng, lat: location.lat } }, (err, result) => {
                if (err) {
                    console.log(err)
                    toastr.error("fail to save ip location")
                }
                if (result) {
                    toastr.success(`updating your location (${location.lng},${location.lat})`)
                    console.log("her??")
                    Meteor.call('setAllUsers', rid)
                    // Meteor.call('sendMessage', {_id: Random.id(), rid: rid, ts: new Date(), msg: `updated user location (${location.lng},${location.lat})})
                }
            })
        })
        .catch(err => {
            console.log(err)
        })
}