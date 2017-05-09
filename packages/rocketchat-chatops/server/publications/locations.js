Meteor.publish('locations', function(rid) {
    return RocketChat.models.Locations.find({rid :  rid})
})  