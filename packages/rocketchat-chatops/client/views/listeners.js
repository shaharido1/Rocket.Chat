import { getParameterByName, getMarkersFromUrl } from './getMarkersFromUrl'
import { differenceBy } from 'lodash'

export function linkLocListener(event) {
    if (event.srcElement.className == "focusLoc") {
        let rid = Session.keys.openedRoom.substring(1, Session.keys.openedRoom.length - 1)
        let arr = event.srcElement.innerText.split(",")
        let str = sessionStorage.getItem(rid + "baseUrl")
        str = str.replace(str.substring(str.indexOf("lng=") + 4, str.indexOf("&lat=")), arr[0])
        let lastIndex
        if (str.includes("&zoom")) {
            if (isNaN(str.charAt(str.indexOf("&zoom=") + 7))) {
                //one digit zoom
                str = str.substring(0, str.indexOf("&zoom=") + 6) + "18" + str.substring(str.indexOf("&zoom=") + 7)
            }
            else {
                //two digit zoom
                str = str.substring(0, str.indexOf("&zoom=") + 6) + "18" + str.substring(str.indexOf("&zoom=") + 8)
            }
            lastIndex = str.indexOf("&zoom")
        }
        else {
            lastIndex = str.indexOf("&height")
        }
        str = str.replace(str.substring(str.indexOf("&lat=") + 5, lastIndex), arr[1])
        if (sessionStorage.getItem("locationToAdd") && (JSON.parse(sessionStorage.getItem("locationToAdd").length))) {
            Meteor.call('addMsgLocation', rid, JSON.parse(sessionStorage.getItem("locationToAdd")), (err, res) => {
                sessionStorage.setItem("locationToAdd", [])
            })
        }
        sessionStorage.setItem(rid + "baseUrl", str)
        Session.set('baseUrlReactive', str)
    }
}


export function mipMaplistener(event) {
    let rid = Session.keys.openedRoom.substring(1, Session.keys.openedRoom.length - 1)
    if (event.origin == "http://mapmip.webiks.com") {
        let baseUrl = event.data.substring(0, event.data.indexOf('markers'))
        sessionStorage.setItem(rid + "baseUrl", baseUrl)
        if (getParameterByName('markers', event.data)) {
            let urlLocation = getMarkersFromUrl(event.data)
            if (JSON.parse(sessionStorage.getItem(rid + "dblocations"))) {
                compereDbUrlLocations(urlLocation)
            }
        }
    }
}

function compereDbUrlLocations(urlLocation) {
    let rid = Session.keys.openedRoom.substring(1, Session.keys.openedRoom.length - 1)
    // if (!(dbLocations == "getting data")) {
    //     dbLocations.set(
    let dbLocations = JSON.parse(sessionStorage.getItem(rid + "dblocations"))
    dbLocations = dbLocations.map(loc => {
        return Object.assign({}, loc, { toCompere: loc.lng + loc.lat })
    })
    // )
    let onlyOne = true
    differenceBy(urlLocation, dbLocations, "toCompere").map(toadd => {
        if (onlyOne) {
            onlyOne = false
            let locationToAdd
            if (!sessionStorage.getItem("locationToAdd")) {
                locationToAdd = []
            }
            else {
                locationToAdd = JSON.parse(sessionStorage.getItem("locationToAdd"))
            }
            locationToAdd.push(toadd)
            dbLocations.push(toadd)
            sessionStorage.setItem(rid + "dblocations", JSON.stringify(dbLocations))
            sessionStorage.setItem("locationToAdd", JSON.stringify(locationToAdd))
            let msg = Object.assign({
                _id: Random.id(),
                rid: rid,
                ts: new Date(),
                msg: `you added new location in @mapmip(${toadd.lng},${toadd.lat},${toadd.color})`,
            });
            Meteor.call('sendMessage', msg)
        }
    })
}

