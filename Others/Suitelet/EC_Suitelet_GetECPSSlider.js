/**
 * Company           Explore Consulting
 * Copyright         2015 Explore Consulting, LLC
 * Description       Example conversion of the other getslider suitelet to use Explore coding style
 **/


/**
 * Searches NS for a single slider record by name
 * @param name name of the record (unique)
 * @returns internal id of the found record
 */
EC.findECPSSliderByName = function (name) {
    EC.enableLazySearch();
    // get the first result from the search
    return EC.createSearch('customrecord_ecps_slider', [['name', 'is', name]], [['internalid'], ['isinactive']])
        .nsSearchResult2obj().first();
};

EC.onStart = function (request, response) {
    var name = request.getParameter('name');
    Log.a('sliderImgs', 'name = ' + name);

    var searchResult = EC.findECPSSliderByName(name);

    if (searchResult && searchResult.isinactive == 'F') {
        // get the slider with its custom sublist
        var slider = nsdal.loadObject('customrecord_ecps_slider', searchResult.internalid, [])
            .withSublist('recmachcustrecord_ecps_slide_parent', [ // desired sublist fields
                'custrecord_ecps_slide_img_desktop', 'custrecord_ecps_slide_img_mobile',
                'custrecord_ecps_slide_alt', 'custrecord_ecps_slide_link', 'custrecord_ecps_slider_slide_caption'
            ]
        );

        // turn each parent into a javascript object for the suitelet response
        var ret = _.map(slider.recmachcustrecord_ecps_slide_parent, function (p) {

            return {
                  alttext: p.custrecord_ecps_slide_alt
                , link: p.custrecord_ecps_slide_link
                , caption: p.custrecord_ecps_slider_slide_caption
            }
        });
    }
    response.setContentType('JSON');

    Log.a('sliderImgs', ret);

    response.write(JSON.stringify(ret || []));
};

Log.AutoLogMethodEntryExit(undefined, false,false,true);