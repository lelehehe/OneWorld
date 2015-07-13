define('ECStoreLocatorHomepage', function()
{
	'use strict';
	
	var ECStoreLocatorHomepage = {};
	
	ECStoreLocatorHomepage.View = Backbone.View.extend({
		title: 'Homepage'
	,	page_header: 'Homepage'
	,	template: 'EC_storelocator_home'
		
	,	initialize: function (options) 
		{

		}
	});
	
	ECStoreLocatorHomepage.Router = Backbone.Router.extend({
		routes: {
			'store-locator-demo': 'customHomePage'
		}
		
	,	initialize: function (application)
		{
			this.application = application;
		}
		
	,	customHomePage: function()
		{

			var view = new ECStoreLocatorHomepage.View({
				application: this.application
			});
			
			view.showContent();
			
		}
	});
	
	ECStoreLocatorHomepage.mountToApp = function(application)
	{
		
		return new ECStoreLocatorHomepage.Router(application);
		
	};
	
	return ECStoreLocatorHomepage;
});

(function(application)
{
	application.Configuration.modules.push('ECStoreLocatorHomepage');
	
	application.Configuration.navigationTabs.push({		
		data: {		
			hashtag: '#store-locator-demo'
		,	touchpoint: 'home'		
		}		
	,	href: '/store-locator-demo'
	,	text: 'Store Locator Demo'
	,   'class': 'tab store-locator-tab'
	});

})(SC.Application('Shopping'));