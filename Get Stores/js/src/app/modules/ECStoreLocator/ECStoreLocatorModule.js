define('ECStoreLocatorModule', ['ECStoreLocatorData', 'ECStoreLocator.Views'], function (ECStoreLocatorData, Views)
{
	'use strict';
	var navOptions = {usa:'usa', international:'international', online:'online'};

	var ECStoreLocator = function ECStoreLocator (options)
	{
		this.options = options;
		this.$target = options.$target;
		this.collection = null;
		
		this.initialize();
	};

	_.extend(ECStoreLocator.prototype, {

		initialize: function ()
		{
			this.ECStoreLocatorID = this.options.ECStoreLocatorID;
			this.$target = this.options.$target;
			
			this.buildStoreLocator();

			return this;
		}

	//,   getStoresEventHandler: function(e) {
	//		e.preventDefault();
	//		debugger
	//		console.log("haha, we are in the searStoreEvent")
	//	}

	,	buildStoreLocator: function()
		{
			var self = this;
			this.collection = new ECStoreLocatorData.Collection();
			this.collection.fetch({
				success: function() {
					self.$target.append(SC.macros.storeLocator(self.collection.models));
					LayoutEnhance.initialize();

				}
			});

		}
	});

	// This object's methods are meant to be added to the layout
	var LayoutEnhance = {
		map: null,
		geocoder: null,
		markers: [],
		responseNone: false,
		searchString: "",
		interval: "",
		resultData:  null,
		selectedNav: '', // Used to determine which navigation area is selected
		infoWindow: null,

		initialize: function() {
			this.selectedNav = navOptions.usa;
			this.geocoder = new google.maps.Geocoder();
			this.infoWindow = new google.maps.InfoWindow();

			var mapOptions = {
				center: new google.maps.LatLng(39.099, -94.578),
				zoom: 4,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			this.map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

		},
		getStoresEventHandler: function(e) {
			e.preventDefault();
			var view = this.currentView;
			var collection = this.currentView.ecStoreLocatorModule.collection;

			//get lat/long
			var searchInput = view.$("#search_input").val();
			var holder = document.getElementById('scriptHolder');
			if (holder.hasChildNodes()) {
				for (var i = 0; i < holder.childNodes.length; i++) {
					holder.removeChild(holder.childNodes[i]);
				}
			}

			for (var x = 0; x < holder.childNodes.length; x++) {
				holder.removeChild(holder.childNodes[x]);
			}

			this.getAddressLatLng(searchInput, holder);
			collection.latitude1--;
			collection.latitude2++;
			collection.longitude1--;
			collection.longitude2++;
			collection.fetch({
				success: function() {
					view.ecStoreLocatorModule.$target.empty().append(SC.macros.storeLocator(collection.models));
				}
			});
		},
		// Takes in an address string parameter value. Will do a google api call to retrieve the lat lng given the address string.
		// Once a match is found, parse that lat and lng value out, and pass it along to add that address to the page.
		getAddressLatLng: function(addressString, holder) {
			var v3GeoCoder = new google.maps.Geocoder();
			var pointObj = {};

			// Move the map zoom to the provided address
			//if(selectedNav == navOptions.usa)
				this.showAddress(addressString, $('#radius').val());
			//else if(selectedNav == navOptions.international)
			//	this.showAddress($("#country option:selected").text(), 250);

			// Uses the geocode function of the sourced Google V3 API library referenced onto the page.
			// It uses the address parameter and on the callback function will gather the lat/lng values returned for that address
			v3GeoCoder.geocode({ 'address': addressString },
				function (results, status) {
					var lat = '';
					var lng = '';
					if(status == google.maps.GeocoderStatus.OK){
						var point = results[0].geometry.location.toString();
						point = point.replace('(', '');
						point = point.replace(')', '');
						pointObj = point.split(',');
						lat = pointObj[0];
						lng = pointObj[1];
					}

					// Get search filters
					//var filters = getFilters(lat, lng);

					// Perform search in NetSuite for store location records
					//suiteletDataRequest(filters, holder);
				})
		},
		showAddress: function(address, radius) {
			geocoder.geocode({ 'address': address },
				function (results, status) {
					if(status == google.maps.GeocoderStatus.OK) {
						var point = results[0].geometry.location;
						var zoom = 0;
						if ((radius <= 6 && radius > -1))
							zoom = 11;
						else if ((radius <= 11 && radius > 6))
							zoom = 10;
						else if ((radius <= 25 && radius > 11))
							zoom = 9;
						else if ((radius <= 50 && radius > 25))
							zoom = 8;
						else if ((radius <= 100 && radius > 50))
							zoom = 7;
						else if(radius > 500)
							zoom = 2;
						else
							zoom = 4;

						map.setCenter(point, zoom);
						map.setZoom(zoom);
					}
				});
		}


};

	var ECStoreLocatorModule = {
		Views: Views
	, 	Model: ECStoreLocatorData.Model
	,   Collection: ECStoreLocatorData.Collection

	,	ECStoreLocator: ECStoreLocator
	,   LayoutEnhance: LayoutEnhance
		
	,	initialize: function (view)
		{
			var ecStoreLocatorSelector = '[data-type="ec-storelocator"]';

			if (view.$(ecStoreLocatorSelector).length == 1) {
				var item = view.$(ecStoreLocatorSelector)[0];
				var ecStoreLocatorID = jQuery.trim(jQuery(item).attr('data-ec-storelocator'));
				view.ecStoreLocatorModule = new ECStoreLocatorModule.ECStoreLocator({
					$target: jQuery(item)
				,	ecStoreLocatorID: ecStoreLocatorID
				});

				//LayoutEnhance.initialize();

				//todo: why code here doesn't work
				//var Layout = SC.Application('Shopping').getLayout();
				//_.extend(Layout.events, {
				//	'click [data-action="get-store-locations"]': 'getStoresEventHandler'
				//});
                //
				//_.extend(Layout, {
				//	getStoresEventHandler: function(e) {
				//		//self.getStoresEventHandler(e);
				//		debugger
				//	}
				//});

			}
		}
	,	mountToApp: function (application, options)
		{
			application.getLayout().on('afterAppendView', this.initialize);
			if (options && options.startRouter)
			{
				console.log("ecstoremodule.js startRouter");
			}

			var Layout = application.getLayout();
			_.extend(Layout, LayoutEnhance);
			_.extend(Layout.events, {
				'click [data-action="get-store-locations"]': 'getStoresEventHandler'
			});

            //
			//_.extend(Layout, {
			//	getStoresEventHandler: function(e) {
			//		ECStoreLocator.getStoresEventHandler(e);
			//	}
			//});
		}
			
	}
	
	return ECStoreLocatorModule;
});

(function(application)
{
	application.Configuration.modules.push('ECStoreLocatorModule');
})(SC.Application('Shopping'));