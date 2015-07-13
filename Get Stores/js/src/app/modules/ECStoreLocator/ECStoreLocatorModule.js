define('ECStoreLocatorModule', ['ECStoreLocatorData'], function (ECStoreLocatorData)
{
	'use strict';

	var ECStoreLocator = function ECStoreLocator (options)
	{
		this.options = options;
		this.$target = options.$target;
		
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

	,   getStoresEventHandler: function(e) {
			e.preventDefault();
			debugger
			console.log("haha, we are in the searStoreEvent")
		}

	,	buildStoreLocator: function()
		{
			var self = this;
			var collection = new ECStoreLocatorData.Collection();
			collection.fetch({
				success: function() {
					self.$target.append(SC.macros.storeLocator(collection.models));
				}
			});


			//todo: why code here doesn't work
			//var Layout = SC.Application('Shopping').getLayout();
			//_.extend(Layout.events, {
			//	'click [data-action="get-store-locations"]': 'getStoresEventHandler'
			//});
            //
			//_.extend(Layout, {
			//	getStoresEventHandler: function(e) {
			//		self.getStoresEventHandler(e);
			//	}
			//});

		}
	});

	var ECStoreLocatorModule = {

		ECStoreLocator: ECStoreLocator
		
	,	initialize: function (view)
		{
			var Layout = SC.Application('Shopping').getLayout();
			var ecStoreLocatorSelector = '[data-type="ec-storelocator"]';

			if (view.$(ecStoreLocatorSelector).length == 1) {
				var item = view.$(ecStoreLocatorSelector)[0];
				var ecStoreLocatorID = jQuery.trim(jQuery(item).attr('data-ec-storelocator'));
				view.ecStoreLocatorModule = new ECStoreLocatorModule.ECStoreLocator({
					$target: jQuery(item)
				,	ecStoreLocatorID: ecStoreLocatorID
				});

			}
		}
	,	mountToApp: function (application)
		{
			application.getLayout().on('afterAppendView', this.initialize);

			var Layout = SC.Application('Shopping').getLayout();
			_.extend(Layout.events, {
				'click [data-action="get-store-locations"]': 'getStoresEventHandler'
			});

			_.extend(Layout, {
				getStoresEventHandler: function(e) {
					ECStoreLocator.getStoresEventHandler(e);
				}
			});
		}
			
	}
	
	return ECStoreLocatorModule;
});

(function(application)
{
	application.Configuration.modules.push('ECStoreLocatorModule');
})(SC.Application('Shopping'));