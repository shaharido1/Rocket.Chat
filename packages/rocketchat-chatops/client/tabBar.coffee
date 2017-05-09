Meteor.startup ->
	Tracker.autorun ->
		if RocketChat.settings.get('Chatops_Enabled')
			console.log 'Adding chatops to tabbar'
			RocketChat.TabBar.addButton
				groups: ['channel', 'group', 'direct']
				id: 'chatops-button3'
				i18nTitle: 'rocketchat-chatops:Chatops_Title'
				icon: 'icon-inbox'
				template: 'chatops_droneflight'
				width: 850
				order: 5
			RocketChat.TabBar.addButton
				groups: ['channel', 'group', 'direct']
				id: 'chatops-button2'
				i18nTitle: 'rocketchat-chatops:Chatops_Title'
				icon: 'icon-video'
				template: 'chatops_videodrone'
				width: 850
				order: 6
		else
			RocketChat.TabBar.removeButton 'chatops-button2'
			RocketChat.TabBar.removeButton 'chatops-button3'
 