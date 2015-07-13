/**
 * Created by mike on 7/9/15.
 */
/// <reference path="References\Explore\SuiteScript\SuiteScriptAPI.js" />
/// <reference path="CS_SharedLibrary_ServerSide.js" />
/**
 * Company			Explore Consulting
 * Copyright			2011 Explore Consulting, LLC
 * Type				NetSuite Suitelet
 * Version			1.4.0.0
 * Description		Accepts zip code, radius and brands from store locator and returns list of stores.
 **/

var navOptions =
{
    usaCanada:'usacanada'
    , international:'international'
    , online:'online'
};
var plottedIcons =
{
    default:'https://system.netsuite.com/c.655844/store locator/images/solid_red_icon.png'
    , solid_red:'https://system.netsuite.com/c.655844/store locator/images/solid_red_icon.png'
    , faded_red:'https://system.netsuite.com/c.655844/store locator/images/faded_red_icon.png'
    , faded_blue:'https://system.netsuite.com/c.655844/store locator/images/faded_blue_icon.png'
};

/**
 * Will take an inbound request object and build a javascript object with properties of the request param as the object
 * property name and the request parameter value as the associated value. Returns this parameter object built
 * @param inboundRequest nlobjRequest object for inbound suitelet call
 * @returns {{}}
 */
function getRequestParameters(inboundRequest){
    // Input parameter object used for processing
    var inputParameters = {};


    Log.d("before getAllParameters");
    try{
        // Retrieve all of the parameters from the inbound request object
        var requestParameters = inboundRequest.getAllParameters();

        // For each parameter, get the parameter value and set the property on the input Param object to param name
        for(parameter in requestParameters ){
            inputParameters[this.parameter] = requestParameters[this.parameter];
        }
    }
    catch(e){
        Log.e('Unexpected Error', getExceptionDetail(e));
        EC.errorResponse(inputParameters.timestamp);
    }

    Log.d("input parameters =", inputParameters);
    Log.d("input parameters.filters =", inputParameters.filters);
    return inputParameters;
}

/**
 * Inbound request parameter validation. Will return true or false depending on pass or fail of validation.
 * @param inputParameters pre-made parameter object
 * @returns {boolean}
 */
EC.validateParameters = function(inputParameters){
    var valid = true;

    // If object is empty, return false
    if(!inputParameters)
        valid = false;

    // If filters is empty throw error
    if(inputParameters && inputParameters.filters && inputParameters.filters.length <= 0)
        valid = false;

    return valid;
};

/**
 * Primary functional script for processing the inbound request
 * @param inputParameters
 * @returns {string}
 * @constructor
 */
EC.processRequest = function(inputParameters) {
    // Response String
    //var responseStr = '';
    var searchResults = [];

    try {
        if(EC.validateParameters(inputParameters)) {
            searchResults = EC.runLocatorSearch(inputParameters);

            if(searchResults) {
                //responseStr += 'timestampInbound = ' + inputParameters.timestamp + ';';
                //responseStr += 'var resultData = ' + JSON.stringify(searchResults);
            }
            else
                EC.emptyResponse(inputParameters.timestamp);
        }
        else
            EC.errorResponse(inputParameters.timestamp);
    }
    catch(e){
        Log.e('Unexpected Error', getExceptionDetail(e));
        EC.errorResponse(inputParameters.timestamp);
    }

    //return responseStr;
    return searchResults;
};

/**
 * Run Store Locator Search. Will return result set based on criteria defined on search
 * @param inputParameters input parameters used as criteria for the search
 * @returns {*}
 */
EC.runLocatorSearch = function(inputParameters) {
    var results;

    try  {
        // Get filters for search
        var filters = JSON.parse(inputParameters.filters) || [];
        Log.d('Raw Incoming Filters', filters);

        // Get Columns for Search
        var columns = [['custrecord_name'], ['custrecord_address1'], ['custrecord_address2'], ['custrecord_city']
            , ['custrecord_state'], ['custrecord_zip'], ['custrecord_phone'], ['custrecord_email']
            , ['custrecord_site_url'], ['custrecord_latitude'], ['custrecord_longitude']];

        EC.enableLazySearch(); // required to bing the search functions into scope on the EC object
        results = EC.createSearch('customrecord_store_location', filters, columns)
            .nsSearchResult2obj(true).toArray(); // convert netsuite results to javascript objects
        Log.d('results', results);
        //results = _.sortBy(results, function(result){return result.custrecord_ndp_company_name;});
    }
    catch (e) {
        Log.e('Unexpected Error', getExceptionDetail(e));
        EC.errorResponse(inputParameters.timestamp);
    }
    return results;
};

///////////////////////////////////////////////////////////////////
//SORT STUFF///////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////

function getResultsWithinCircleBounds(storeData, inputParameters) {
    var storesWithinBounds = [];
    // Get current data provided. Center lat/lng and radius
    var centerlat = inputParameters.centerLat;
    var centerlng = inputParameters.centerLng;
    var radius = inputParameters.radius;

    // For each store, calculate the distance from the center lat/lng point to the store lat/lng. If the distance is less than
    // The radius value then push to returned results. Otherwise if it's greater, it's out of the circle bounds and don't push.
    if(storeData){
        for(var i = 0; i < storeData.length; i++){
            var storeLng = storeData[i].getValue('custrecord_longitude');
            var storeLat = storeData[i].getValue('custrecord_latitude');
            var storeDistance = getDistanceFromLatLonInMi(centerlat, centerlng, storeLat, storeLng);
            if(storeDistance < radius){
                storesWithinBounds.push(storeData[i]);
            }
        }
    }

    return storesWithinBounds;
}
function getDistanceFromLatLonInMi(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1);
    var a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    d = d/1.60934; //Convert to miles
    return d;
}
function deg2rad(deg) {
    return deg * (Math.PI/180)
}
function sortByCustomOrder(a, b) {
    return a.sortorder - b.sortorder;
}
EC.errorResponse = function(timestamp) {
    response.write('timestampInbound = ' + timestamp + ';  var responseFail = true;');
};
//return empty notification
EC.emptyResponse = function(timestamp) {
    response.write('timestampInbound = ' + timestamp + '; var responseNone = true;');
};

/**
 * Takes a netsuite error object and parses out the details of the message into a friendly string in a response
 * @param {nlobjError|Object|Error} e
 * @returns {string}
 */
function getExceptionDetail(e) {
    var detail = e.toString() + " \n";
    if (e.stack) detail += e.stack;
    else if (_.isFunction(e.getStackTrace)) detail += e.getStackTrace().join();
    else detail += "[no stack trace]";
    return detail;
}

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////

//return failure notification
EC.onStart = function(request, response) {

    var filters = request.getParameter('filters');
    Log.d("filters", filters);

    // Retrieve all of the inbound request parameters
    var inputParameters = getRequestParameters(request);


    Log.d("input parameters:", inputParameters);

    try {
        // Process the request
        var ret = EC.processRequest(inputParameters);

        // Write back the response string
        //response.write(responseStr);

        response.setContentType('JSON');

        response.write(JSON.stringify(ret || []));


    }
    catch(e){
        Log.e('Unexpected Error', getExceptionDetail(e));
        EC.errorResponse(inputParameters.timestamp);
    }
}

Log.AutoLogMethodEntryExit(undefined, false,false,true);