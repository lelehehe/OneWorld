define('ECSlider', function()
{
	'use strict';
	
	var ECSlider = {};
	
	ECSlider.Model = Backbone.Model.extend({
		parse: function (response)
		{
			return response;
		}
	});
	ECSlider.Collection = Backbone.Collection.extend({
		
		initialize: function(options) {

	    	this.id = options.id;
	  	}

	,	url: function() {			
			return '../OneWorld-Mike/ECPS-SSP/services/ecqsGetSlider.ss?name=' + this.id
		}
	
	,	model: ECSlider.Model

	});
	
	return ECSlider;
});

(function(application)
{	
	if (!window.ECHomepageIncluded)
	{
		window.ECHomepageIncluded = true;
		SC.ECTemplates.macros = _.union(SC.templates.macros, SC.ECTemplates.macros);
		SC.templates = _.extend(SC.templates, SC.ECTemplates);
		
		SC.compileMacros(SC.templates.macros);
	}
	application.Configuration.modules.push('ECSlider');
})(SC.Application('Shopping'));
define('OwlCarousel', ['ECSlider'], function (ECSlider)
{
	'use strict';

	var OwlCarousel = function OwlCarousel (options)
	{
		this.options = options;
		this.$target = options.$target;
		
		this.initialize();
	};

	_.extend(OwlCarousel.prototype, {

		initialize: function ()
		{
			this.ecSliderID = this.options.ecSliderID;
			this.$target = this.options.$target;
			
			this.buildSlides();

			return this;
		}

	,	initSlider: function (target)
		{
			return target.owlCarousel({
				loop:true
			,	autoplay:true
			,	nav:true
			,	center:true
			,	mouseDrag:false
			,	items:1
			});
		}
	
	,	buildSlides: function() 
		{
			var self = this;
			var desktopWrapper = self.$target.find('.ec-slider-desktop');
			var mobileWrapper = self.$target.find('.ec-slider-mobile');
			var collection = new ECSlider.Collection({id:self.ecSliderID});
			
			collection.fetch({
				success: function ()
				{
					_.each(collection.models, function(collectionItem) {
						if (collectionItem.get('imgdesktop') != '') {
							desktopWrapper.append(
								SC.macros.sliderImg(collectionItem, collectionItem.get('imgdesktop'))
							);
						}
						
						if (collectionItem.get('imgmobile') != '') {
							mobileWrapper.append(
								SC.macros.sliderImg(collectionItem, collectionItem.get('imgmobile'))
							);
						}
					});

					if (desktopWrapper.children().length > 0) {
						self.initSlider(desktopWrapper);
					}
					
					if (mobileWrapper.children().length > 0) {
						self.initSlider(mobileWrapper);
					}
				}
			});
		}
	});

	var OwlCarouselModule = {

		OwlCarousel: OwlCarousel
		
	,	initialize: function (view)
		{

			var ecSliderSelector = '[data-type="ec-slider"]';

			_.each(view.$(ecSliderSelector), function(slider) {

				var ecSliderID = jQuery.trim(jQuery(slider).attr('data-ec-slider'));
				
				jQuery(slider).append('<div class="ec-slider ec-slider-desktop" />');
				jQuery(slider).append('<div class="ec-slider ec-slider-mobile" />');	
				
				view.owlCarousel = new OwlCarouselModule.OwlCarousel({
					$target: jQuery(slider)
				,	ecSliderID: ecSliderID
				});			
			});

		}
	,	mountToApp: function (application)
		{
			application.getLayout().on('afterAppendView', this.initialize);		
		}
			
	}
	
	return OwlCarouselModule;
});

(function(application)
{
	application.Configuration.modules.push('OwlCarousel');
})(SC.Application('Shopping'));
define('ECHomepage', function()
{
	'use strict';
	
	var ECHomepage = {};
	
	ECHomepage.View = Backbone.View.extend({
		title: 'Homepage'
	,	page_header: 'Homepage'
	,	template: 'EC_home'
		
	,	initialize: function (options) 
		{

		}
	});
	
	ECHomepage.Router = Backbone.Router.extend({
		routes: {
			'ecqs-slider-demo': 'customHomePage'
		}
		
	,	initialize: function (application)
		{
			this.application = application;
		}
		
	,	customHomePage: function()
		{

			var view = new ECHomepage.View({
				application: this.application
			});
			
			view.showContent();
			
		}
	});
	
	ECHomepage.mountToApp = function(application)
	{
		
		return new ECHomepage.Router(application);
		
	};
	
	return ECHomepage;
});

(function(application)
{
	application.Configuration.modules.push('ECHomepage');
	
	application.Configuration.navigationTabs.push({		
		data: {		
			hashtag: '#/ecqs-slider-demo'		
		,	touchpoint: 'home'		
		}		
	,	href: 'ecqs-slider-demo'		
	,	text: 'ECQS Slider Demo'		
	});
	
})(SC.Application('Shopping'));
