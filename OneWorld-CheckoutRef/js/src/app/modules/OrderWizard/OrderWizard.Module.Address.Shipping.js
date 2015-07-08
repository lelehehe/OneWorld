// OrderWizard.Module.Address.Shipping.js
// --------------------------------------
//
define('OrderWizard.Module.Address.Shipping', ['OrderWizard.Module.Address'],  function (OrderWizardModuleAddress)
{
	'use strict';

	return OrderWizardModuleAddress.extend({

		manage: 'shipaddress'
	,	sameAsManage: 'billaddress'

	,	errors: ['ERR_CHK_INCOMPLETE_ADDRESS', 'ERR_CHK_SELECT_SHIPPING_ADDRESS', 'ERR_CHK_INVALID_SHIPPING_ADDRESS', 'ERR_WS_INVALID_SHIPPING_ADDRESS']
	,	sameAsMessage: _('Same as billing address').translate()

	,	selectAddressErrorMessage: {
			errorCode: 'ERR_CHK_SELECT_SHIPPING_ADDRESS'
		,	errorMessage: _('Please select a shipping address').translate()
		}

	,	invalidAddressErrorMessage: {
			errorCode: 'ERR_CHK_INVALID_SHIPPING_ADDRESS'
		,	errorMessage: _('The selected shipping address is invalid').translate()
		}

	,	selectMessage: _('Ship to this Address').translate()

	,	isActive: function()
		{
			return !this.wizard.model.get('ismultishipto') && this.wizard.checkIfShippingAddressIsRequired(true);
		}

	,	eventHandlersOn: function ()
		{
			OrderWizardModuleAddress.prototype.eventHandlersOn.apply(this, arguments);

			this.model.on('change:tempshipaddress', jQuery.proxy(this, 'estimateShipping'), this);
			this.model.on('change:ismultishipto', jQuery.proxy(this, 'render'), this);
		}

	,	eventHandlersOff: function ()
		{
			OrderWizardModuleAddress.prototype.eventHandlersOff.apply(this, arguments);

			this.model.off('change:tempshipaddress', null, this);
			this.model.off('change:ismultishipto', null, this);
		}

	,	changeAddress: function ()
		{
			OrderWizardModuleAddress.prototype.changeAddress.apply(this, arguments);

			if (this.address)
			{
				this.model.trigger('change:' + this.manage);
			}
		}

	,	estimateShipping: function (model, address)
		{

			var	countries = this.wizard.application.getConfig('siteSettings.countries')
			,	country_value = address && address.country
			,	state_value = address && address.state
			,	zip_value = address && address.zip
			,	country_ready = country_value && (country_value !== model.previous('country'))
			,	state_ready = (country_value && !countries[country_value].states) || (state_value && state_value !== model.previous('state'))
			,	zip_ready = (country_value && countries[country_value].isziprequired === 'F') || (zip_value && zip_value !== model.previous('zip'));

			if (country_ready && zip_ready && state_ready)
			{

				var addresses = this.model.get('addresses')
				,	address_id = country_value + '-' + (state_value || '-') + '--' + (zip_value || '-')  + '----null'
				,	current_address = addresses.get(address_id);

				if (!current_address)
				{
					addresses.add({
						internalid: address_id
					,	country: country_value
					,	state: state_value
					,	zip: zip_value
					});
				}
				else
				{
					current_address.set({
						country: country_value
					,	state: state_value
					,	zip: zip_value
					});
				}

				if (this.addressId !== address_id)
				{
					model.set({
						shipaddress: address_id
					,	isEstimating: true
					});
				}
			}
			else
			{
				model.set({isEstimating: false});
			}
		}
	});
});