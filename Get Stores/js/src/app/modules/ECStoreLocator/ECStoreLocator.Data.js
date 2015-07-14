define('ECStoreLocatorData', function()
{
	'use strict';
	
	var ECStoreLocatorData = {
	};
	
	ECStoreLocatorData.Model = Backbone.Model.extend({
		parse: function (response)
		{
			return response;
		}
	});
	ECStoreLocatorData.Collection = Backbone.Collection.extend({
		
		initialize: function(options) {
			this.latitude1 = 47.48534879985527;
			this.latitude2 = 47.63006660014471;
			this.longitude1 = -122.23984815953342;
			this.longitude2 = -122.01564484046658;

	    	//this.id = options.id;
	  	}

	,	url: function() {
			var path = '../EC-Store-Locator/services/ecGetStores.ss?filters=' + '[["isinactive","is","F"],"AND",["custrecord_latitude","between",' + this.latitude1 + ' , ' + this.latitude2 +
				'],"AND",["custrecord_longitude","between",' + this.longitude1 + ', ' + this.longitude2 + ']]';
			return path;
			//return '../EC-Store-Locator/services/ecGetStores.ss?filters=' + '[[%22isinactive%22,%22is%22,%22F%22],%22AND%22,[%22custrecord_latitude%22,%22between%22,47.48534879985527,47.63006660014471],%22AND%22,[%22custrecord_longitude%22,%22between%22,-122.23984815953342,-122.01564484046658]]'
		}
	
	,	model: ECStoreLocatorData.Model

	});
	
	return ECStoreLocatorData;
});

(function(application)
{	
	if (!window.ECStoreLocatorDataHomepageIncluded)
	{
		window.ECStoreLocatorDataHomepageIncluded = true;
		SC.ECTemplates.macros = _.union(SC.templates.macros, SC.ECTemplates.macros);
		SC.templates = _.extend(SC.templates, SC.ECTemplates);
		
		SC.compileMacros(SC.templates.macros);
	}
	application.Configuration.modules.push('ECStoreLocatorData');
})(SC.Application('Shopping'));