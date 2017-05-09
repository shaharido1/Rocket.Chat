class Locations extends RocketChat.models._Base {
	constructor() {
		super();
		this._initModel('locations');
	}
}

RocketChat.models.Locations = new Locations();
