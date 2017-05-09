

export function getIpLocation() {
    return new Promise((resolve, reject) => {
        getGoogleLocation()
            .then(location => {
                resolve(formatLocation(location))
            })
            .catch(err => {
                console.log(err)
                getIpInfoLocation()
                    .then(location => {
                        resolve(formatLocation(location))
                    })
                    .catch(err => {
                        console.log(err)
                        reject(err)
                    })
            })
    })
}

function formatLocation(location) {
    if (typeof location.lng == "string") {
        location.lng = Number(location.lng);
        location.lat = Number(location.lat);
    }
    location.lng = location.lng.toFixed(6)
    location.lat = location.lat.toFixed(6)
    return location
}

function getIpInfoLocation() {
    return new Promise((resolve, reject) => {
        $.getJSON("http://ipinfo.io", function (ipinfo) {
            console.log("Found location [" + ipinfo.loc + "] by ipinfo.io");
            latLong = ipinfo.loc.split(",");
            var location = { lng: latLong[0], lat: latLong[1] }
            resolve(location)
        }).fail(function (err) { reject(err) })
    })
}

function getGoogleLocation() {
    return new Promise((resolve, reject) => {
        var options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                var crd = pos.coords;
                console.log(`Your current position is: Latitude : ${crd.latitude}, Longitude: ${crd.longitude}, More or less ${crd.accuracy} meters. `);
                var location = { lng: crd.longitude, lat: crd.latitude }
                resolve(location)
            },
            (err) => {
                reject(err)
            },
            options
        );
    })
}

