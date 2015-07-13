define('ECPSSlider', function()
{
	'use strict';
	
	var ECPSSlider = {};
	
	ECPSSlider.Model = Backbone.Model.extend({
		parse: function (response)
		{
			return response;
		}
	});
	ECPSSlider.Collection = Backbone.Collection.extend({
		
		initialize: function(options) {

	    	this.id = options.id;
	  	}

	,	url: function() {			
			return "../OneWorld-Mike/ECPS-SSP/services/ecpsGetSlider.ss?name=" + this.id
		}
	
	,	model: ECPSSlider.Model

	});
	
	return ECPSSlider;
});

(function(application)
{	
	if (!window.ECPSHomepageIncluded)
	{
		window.ECPSHomepageIncluded = true;
		SC.ECPSTemplates.macros = _.union(SC.templates.macros, SC.ECPSTemplates.macros);
		SC.templates = _.extend(SC.templates, SC.ECPSTemplates);
		
		SC.compileMacros(SC.templates.macros);
	}
	application.Configuration.modules.push('ECPSSlider');
})(SC.Application('Shopping'));