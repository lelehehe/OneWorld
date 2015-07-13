function service (request, response)
{
	var ret = [];


	var filters = request.getParameter('filters');

	//var get_slider_suitelet = nlapiResolveURL('SUITELET','customscript_ec_suitelet_getslider','customdeploy_ec_suitelet_getslider',true);
	//var postdata = { name: name };
	//var request = nlapiRequestURL(get_slider_suitelet, postdata);
	var get_store_suitelet = nlapiResolveURL('SUITELET','customscript_ec_suitelet_getstores','customdeploy_ec_suitelet_getstores',true);
	var postdata = { filters: filters };
	var request = nlapiRequestURL(get_store_suitelet, postdata);

	ret = JSON.parse(request.getBody());

	response.setContentType('JSON');
	response.write(JSON.stringify( ret || []));
	//response.write(request);
}