RocketChat.callbacks.add('renderMessage', message => {
    if (message.msg.includes("@mapmip")) {
        let key = "@mapmip(";
        if (message.msg.includes("selfloc(")) {
            key= "selfloc("
        }
        let location = createLocatinObject(message.msg, message.u.username, key)
        key = key=="@mapmip"? "mip</a>(" : key
        if (location && !message.html.includes("focusLoc")) {
            message.html = addButton(message.html, location, key)
        }
        else {
            message.html = message.html + "<div><strong>##invalid location</strong></div>"
        }
        return message
    }
    else {
        return message
    }
}, RocketChat.callbacks.priority.LOW)



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
    if (location.lng > 180 || location.lng < -180 || location.lat < -90 || location.lat > 90) {
        return null
    }
    return {
        lng: location.lng,
        lat: location.lat
    }

}

function addButton(messageHtml, location, key) {
    let locationString = location.lng + "," + location.lat
    let index = messageHtml.indexOf(locationString)
    let length = locationString.length
    messageHtml = messageHtml.substring(0, index) +
                      "<button class='focusLoc'>" + 
                      messageHtml.substring(index, index + length) +  
                      "<button>" + 
                      messageHtml.substring(index + length, messageHtml.length) 
    return messageHtml
}