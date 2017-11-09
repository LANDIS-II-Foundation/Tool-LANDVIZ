//loads any Json File to Object
function loadJson(jsonFile) {
    $.ajaxSetup({'async': false});
    var json = {};
    $.getJSON(jsonFile, function( data ) {
        json = data;
    });
    $.ajaxSetup({'async': true});
    //console.log(json);
    if (jQuery.isEmptyObject(json)) {
        return false;
    } else {
        return json;
    }
}


//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/math/mdc [rev. #1]

var mdc = function(o){
    if(!o.length)
        return 0;
    for(var r, a, i = o.length - 1, b = o[i]; i;)
        for(a = o[--i]; r = a % b; a = b, b = r);
    return b;
};

//size of objects
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

// http://www.jquerybyexample.net/2012/06/get-url-parameters-using-jquery.html
function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
    return false;
}

// http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}