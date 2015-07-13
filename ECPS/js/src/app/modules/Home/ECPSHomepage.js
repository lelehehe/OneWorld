define('ECPSHomepage', function()
{
	'use strict';
	
	var ECPSHomepage = {};
	
	ECPSHomepage.View = Backbone.View.extend({
		title: 'Homepage'
	,	page_header: 'Homepage'
	,	template: 'EC_home'
		
	,	initialize: function (options) 
		{

		}
	});
	
	ECPSHomepage.Router = Backbone.Router.extend({
		routes: {
			'ecps-slider-demo': 'customHomePage'
		}
		
	,	initialize: function (application)
		{
			this.application = application;
		}
		
	,	customHomePage: function()
		{

			var view = new ECPSHomepage.View({
				application: this.application
			});
			
			view.showContent();
			
		}
	});
	
	ECPSHomepage.mountToApp = function(application)
	{
		
		return new ECPSHomepage.Router(application);
		
	};
	
	return ECPSHomepage;
});

(function(application)
{
	application.Configuration.modules.push('ECPSHomepage');
	
	application.Configuration.navigationTabs.push({		
		data: {		
			hashtag: '#/ecps-slider-demo'		
		,	touchpoint: 'home'		
		}		
	,	href: 'ecps-slider-demo'		
	,	text: 'ECPS Slider Demo'		
	});
	
})(SC.Application('Shopping'));