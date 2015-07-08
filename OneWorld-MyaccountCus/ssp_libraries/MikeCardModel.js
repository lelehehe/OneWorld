//Models.Init.js
// Init.js
// -------
// Global variables to be used accross models
// This is the head of combined file Model.js

/* exported container, session, settings, customer, context, order */
var container = nlapiGetWebContainer()
    , session = container.getShoppingSession()
//,	settings = session.getSiteSettings()
    , customer = session.getCustomer()
    , context = nlapiGetContext()
    , order = session.getOrder();

//Model.js
// Address.js
// ----------
// Handles fetching, creating and updating addresses
Application.defineModel('MikeCard', {

    get: function (id) {
        'use strict';

        //Return a specific credit card
        return customer.getCreditCard(id);
    }

    , list: function () {
        'use strict';

        //Return all the credit cards with paymentmethod
        return _.filter(customer.getCreditCards(), function (credit_card) {
            return credit_card.paymentmethod;
        });
    }

});


