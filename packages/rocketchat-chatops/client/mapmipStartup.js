import { mipMaplistener, linkLocListener } from './views/listeners'

Meteor.startup(function () {
    RocketChat.callbacks.add('enter-room', (res, err) => {
        if (document.getElementById('mipmapFrame')) {
            if (res) {
                console.log("listner on" + res.rid)
            }
            Session.set('baseUrlReactive', sessionStorage.getItem(res.rid + "baseUrl"))

            window.addEventListener("click", linkLocListener, false)
            window.addEventListener("message", mipMaplistener, false)
        }
    })
})	