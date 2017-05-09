


Template.chatops_videodrone.onCreated(function () {
    console.log(this.data.rid)
    Meteor.call("whichDroneToShow", this.data.rid, function(answer){
        console.log(answer)

    })

})