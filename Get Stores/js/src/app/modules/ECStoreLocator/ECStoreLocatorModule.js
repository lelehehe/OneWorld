define('ECStoreLocatorModule', ['ECStoreLocatorData', 'ECStoreLocator.Views'], function (ECStoreLocatorData, Views)
{
	'use strict';

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
				}
			});

		}
	});

	// This object's methods are meant to be added to the layout
	var LayoutEnhance = {
		getStoresEventHandler: function(e) {
			e.preventDefault();
			var view = this.currentView;
			var collection = this.currentView.ecStoreLocatorModule.collection;

			collection.latitude1--;
			collection.latitude2++;
			collection.longitude1--;
			collection.longitude2++;
			collection.fetch({
				success: function() {
					view.ecStoreLocatorModule.$target.replaceWith(SC.macros.storeLocator(collection.models));
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