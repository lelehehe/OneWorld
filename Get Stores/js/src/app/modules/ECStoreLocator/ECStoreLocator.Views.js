define('ECStoreLocator.Views', function () {
    'use strict';

    var Views = {};

    // List stores
    Views.List = Backbone.View.extend({

        template: 'address_book'
        , title: _('Find Stores').translate()
        , attributes: {'class': 'StoreListView'}
        , events: {'click [data-action="get-store-locations"]': 'getStoresEventHandler'}

        , initialize: function () {
            //only enable "default" functionality in myaccount
            this.options.showDefaults = this.options.application.getConfig('currentTouchpoint') === 'customercenter';
        }

        , showContent: function (path, label) {
            label = label || path;
            this.options.application.getLayout().showContent(this, label, {text: this.title, href: '/' + path});
        }

        // remove address
        , getStoresEventHandler: function (e) {
            e.preventDefault();
            debugger

        }

        , removeAddressModel: function (address_id) {
            this.collection.get(address_id).destroy({wait: true});
        }
    });

    return Views;
});

(function(application)
{
    application.Configuration.modules.push('ECStoreLocator.Views');
})(SC.Application('Shopping'));