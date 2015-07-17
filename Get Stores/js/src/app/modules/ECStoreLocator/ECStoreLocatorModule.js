define('ECStoreLocatorModule', ['ECStoreLocatorData', 'ECStoreLocator.Views'], function (ECStoreLocatorData, Views)
{
	'use strict';
	var navOptions = {usa:'usa', international:'international', online:'online'};

	var ECStoreLocator = function ECStoreLocator (options)
	{
		this.options = options;
		this.$target = options.$target;
		//this.collection = null;
		this.layoutEnhance = LayoutEnhance;
		
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
			//var self = this;
			//this.collection = new ECStoreLocatorData.Collection();
			//this.collection.fetch({
			//	success: function() {
			//		//self.$target.append(SC.macros.storeLocator(self.collection.models));
			//		self.$target.append(SC.macros.storeLocator(null));
			//		self.layoutEnhance.initialize();
			//	}
			//});
			this.$target.append(SC.macros.storeLocator(null));
			this.layoutEnhance.initialize();

		}
	});

	// This object's methods are meant to be added to the layout
	var LayoutEnhance = {
		map: null,
		geocoder: null,
		v3GeoCoder: null,
		markers: [],
		responseNone: false,
		searchString: "",
		interval: "",
		resultData:  null,
		selectedNav: '', // Used to determine which navigation area is selected
		infoWindow: null,
		collection: null,

		initialize: function() {
			this.selectedNav = navOptions.usa;
			this.geocoder = new google.maps.Geocoder();
			this.v3GeoCoder = new google.maps.Geocoder();
			this.infoWindow = new google.maps.InfoWindow();

			var mapOptions = {
				center: new google.maps.LatLng(39.099, -94.578),
				zoom: 4,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			this.map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
			this.collection = new ECStoreLocatorData.Collection();
			console.log("geocoder and this.map are created!!!")
		},
		getStoresEventHandler: function(e) {
			e.preventDefault();
			var view = this.currentView;
			//var collection = this.currentView.ecStoreLocatorModule.collection;
			var that = view.ecStoreLocatorModule.layoutEnhance;

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
			that.removeAllMarkers();
			that.getAddressLatLng(searchInput, holder, view.ecStoreLocatorModule.$target);
			//collection.latitude1--;
			//collection.latitude2++;
			//collection.longitude1--;
			//collection.longitude2++;
			//collection.fetch({
			//	success: function() {
			//		//view.ecStoreLocatorModule.$target.empty().append(SC.macros.storeLocator(collection.models));
			//		view.ecStoreLocatorModule.$target.find('#storeList').empty().append(SC.macros.storeList(collection.models));
			//	}
			//});
		},

		removeAllMarkers: function() {
			_.each(this.markers, function(marker){
				marker.setMap(null);
			});
			this.markers = []
		},

		// Takes in an address string parameter value. Will do a google api call to retrieve the lat lng given the address string.
		// Once a match is found, parse that lat and lng value out, and pass it along to add that address to the page.
		getAddressLatLng: function(addressString, holder, $target) {
			var pointObj = {};

			// Move the map zoom to the provided address
			//if(selectedNav == navOptions.usa)
				this.showAddress(addressString, jQuery('#radius').val());
			//else if(selectedNav == navOptions.international)
			//	this.showAddress($("#country option:selected").text(), 250);

			// Uses the geocode function of the sourced Google V3 API library referenced onto the page.
			// It uses the address parameter and on the callback function will gather the lat/lng values returned for that address
			var self = this;
			this.v3GeoCoder.geocode({ 'address': addressString },
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
					var filters = self.getFilters(lat, lng);
					var collection = self.collection;
					collection.setFilters(filters);
					collection.fetch({
						success: function() {
							$target.find('#storeList').empty().append(SC.macros.storeList(self.collection.models));
							//self.displayStores(self.collection.models);
							_.each(self.collection.models, function(model, index){
								var result = model.attributes;
								var innerString = '';
								if(self.selectedNav == navOptions.usa || self.selectedNav == navOptions.international) {
									var lat = result.custrecord_latitude;
									var lng = result.custrecord_longitude;

									////////////////////////////////////////////////////////////////////////////////////////////////////////
									//Plot Result Content///////////////////////////////////////////////////////////////////////////////////
									////////////////////////////////////////////////////////////////////////////////////////////////////////
									if(lat && lng){
										var addressDisplayText = "<div class='marker-bubble'>";
										if (result.custrecord_name != "")
											addressDisplayText += "<b>" + result.custrecord_name + "</b><br />";

										// City state logic////////////////////////////////////////////////
										var city = result.custrecord_city;
										var state = result.custrecord_stateText;
										if(city != '')
											addressDisplayText += city;
										if(state != '')
											addressDisplayText += (city  != '' ? ', ' : '') + state + "<br />";
										else
											addressDisplayText += "<br/>";
										///////////////////////////////////////////////////////////////////

										if (jQuery.trim(result.custrecord__phone))
											addressDisplayText += result.custrecord_phone + "<br />";

										addressDisplayText += "</div>";

										self.addAddress(lat, lng, addressDisplayText);
										setTimeout(function(){}, 400);
									}
									////////////////////////////////////////////////////////////////////////////////////////////////////////
									////////////////////////////////////////////////////////////////////////////////////////////////////////

								}
								else if(selectedNav == navOptions.online) {
									if ($.trim(result.custrecord_name)) {
										// Line counter is designed to handle formatting for the result content
											innerString += "<span class='result_set onlineResult'>";

										innerString += "<br /> <a class='onlineLinks' href=\"";

										if ($.trim(result.custrecord_site_url))
											innerString += result.custrecord_site_url.indexOf('http') == -1 ? 'http://' + result.custrecord_site_url : result.custrecord_site_url;

										innerString += "\" target=\"_blank\">" + result.custrecord_name + "</a></span>";
									}
								}
								// Append inner string value to the outer loop variable
								//outerString += innerString;
							});

						}
					});
					// Perform search in NetSuite for store location records
					//suiteletDataRequest(filters, holder);
				})
		},

		addAddress: function (lat, lng, html) {
			var markerOptions = {
				'position': new google.maps.LatLng(lat, lng)
			};
			var marker = new google.maps.Marker(markerOptions);
			var self = this;
			google.maps.event.addListener(marker, "click", function ()
			{
				self.infoWindow.setContent(html);
				self.infoWindow.open(self.map, marker);
			});
			marker.setMap(this.map);
			this.markers.push(marker);
		},



		getFilters: function (lat, lng){
			var filters = [];

			// Get form data
			var radius = jQuery('#radius').val();
			var countryId = document.getElementById('country').value;

			// Default filter where inactive is false
			filters.push(['isinactive', 'is', 'F']);

			// Perform form validation based on the navigation option selected
			if(this.selectedNav == navOptions.usa) {
				var locationObj = getLatLngObj(lat, lng, radius);
				if (radius) {
					if (parseFloat(locationObj.northLat) <= parseFloat(locationObj.southLat))
						filters.push('AND', ['custrecord_latitude', 'between', locationObj.northLat, locationObj.southLat]); //latitude filter
					else
						filters.push('AND', ['custrecord_latitude', 'between', locationObj.southLat, locationObj.northLat]); //latitude filter

					if (parseFloat(locationObj.westLng) <= parseFloat(locationObj.eastLng))
						filters.push('AND', ['custrecord_longitude', 'between', locationObj.westLng, locationObj.eastLng]); //longitude filter
					else
						filters.push('AND', ['custrecord_longitude', 'between', locationObj.eastLng, locationObj.westLng]); //longitude filter
				}
			}
			else if(this.selectedNav == navOptions.international) {
				filters.push('AND', ['custrecord_country', 'is', countryId]);
			}
			else if(this.selectedNav == navOptions.online) {
				filters.push('AND', ['custrecord_online_location', 'is', 'T']);
			}

			return filters;
			function getLatLngObj(lat,lng, radius){
				var locationObj = {centerLat:lat, centerLng:lng, northLat:0, southLat:0, westLng:0, eastLng:0};

				locationObj.northLat = getNorthLat(locationObj.centerLat, radius);
				locationObj.southLat = getSouthLat(locationObj.northLat, locationObj.centerLat);
				locationObj.westLng = getWestLng(locationObj.centerLng , locationObj.centerLat, radius);
				locationObj.eastLng = getEastLng(locationObj.centerLng , locationObj.westLng);

				return locationObj;
			}
			//////////////////////////////////////////////////////////////////////////
			//GET LAT/LNG POINTS//////////////////////////////////////////////////////
			//////////////////////////////////////////////////////////////////////////
			function getNorthLat(currlat, miles) {
				return (parseInt(miles, 10) / 69.1) + parseFloat(currlat);
			}
			function getSouthLat(nlat, currlat) {
				return parseFloat(currlat) - (nlat - parseFloat(currlat));
			}
			function getWestLng(currlng, currlat, miles) {
				return (parseInt(miles, 10) / (69.1 * (Math.cos(((parseFloat(currlat) * Math.PI) / 180) * 60 / 57.3)))) + parseFloat(currlng);
			}
			function getEastLng(currlng, wlng) {
				return parseFloat(currlng) - (wlng - parseFloat(currlng));
			}
			//////////////////////////////////////////////////////////////////////////
			//////////////////////////////////////////////////////////////////////////
		},

		showAddress: function(address, radius) {
			var self = this;
			this.geocoder.geocode({ 'address': address },
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

						self.map.setCenter(point, zoom);
						self.map.setZoom(zoom);
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