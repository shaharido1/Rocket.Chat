export function getMarkersFromUrl(url) {

    let urlLocation = markersStrToArray(getParameterByName('markers', url))
    urlLocation = urlLocation.map(pos => {
        return {
            lng: pos.position[0].toFixed(6),
            lat: pos.position[1].toFixed(6),
            color: pos.color ? pos.color : "blue",
            toCompere: pos.position[0].toFixed(6) + pos.position[1].toFixed(6)
        }
    })
    return urlLocation
}

export function getParameterByName(name, url) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function markersStrToArray(markersStr) {
    if (_.isEmpty(markersStr)) return [];
    let markersArrayStr = markersStr.split(" ").join("").split("),(").map(
        (str, index, array) => {
            if (index == 0) {
                str = str.replace("(", "")
            }
            if (index == array.length - 1) {
                str = str.replace(")", "")
            }
            return str
        });
    let markersArrayObject = markersArrayStr.map((one) => {
        let split_array = one.split(",");
        let position = split_array.filter(i => !isNaN(+i)).map(i => +(+i).toFixed(7));
        let color = split_array.find(i => isNaN(+i));
        let marker_obj = { position };
        if (color) marker_obj['color'] = color;
        return marker_obj;
    });
    return markersArrayObject;
}