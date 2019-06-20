//Rotate leaflet marker by bbecquet 
(function () {
    var proto_initIcon = L.Marker.prototype._initIcon;
    var proto_setPos = L.Marker.prototype._setPos;

    var oldIE = (L.DomUtil.TRANSFORM === 'msTransform');

    L.Marker.addInitHook(function () {
        var iconOptions = this.options.icon && this.options.icon.options;
        var iconAnchor = iconOptions && this.options.icon.options.iconAnchor;
        if (iconAnchor) {
            iconAnchor = (iconAnchor[0] + 'px ' + iconAnchor[1] + 'px');
        }
        this.options.rotationOrigin = this.options.rotationOrigin || iconAnchor || 'center bottom';
        this.options.rotationAngle = this.options.rotationAngle || 0;
        this.on('drag', function (e) { e.target._applyRotation(); });
    });
    L.Marker.include({
        _initIcon: function () {
            proto_initIcon.call(this);
        },

        _setPos: function (pos) {
            proto_setPos.call(this, pos);
            this._applyRotation();
        },

        _applyRotation: function () {
            if (this.options.rotationAngle) {
                this._icon.style[L.DomUtil.TRANSFORM + 'Origin'] = this.options.rotationOrigin;

                if (oldIE) {
                    // for IE 9, use the 2D rotation
                    this._icon.style[L.DomUtil.TRANSFORM] = 'rotate(' + this.options.rotationAngle + 'deg)';
                } else {
                    // for modern browsers, prefer the 3D accelerated version
                    this._icon.style[L.DomUtil.TRANSFORM] += ' rotateZ(' + this.options.rotationAngle + 'deg)';
                }
            }
        },

        setRotationAngle: function (angle) {
            this.options.rotationAngle = angle;
            this.update();
            return this;
        },

        setRotationOrigin: function (origin) {
            this.options.rotationOrigin = origin;
            this.update();
            return this;
        }
    });
})();
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);

    } else {
        console.log("Geolocation is not supported by this browser.");

    }
}
var uLat;
var uLng;
function showPosition(position) {
    uLat = position.coords.latitude;
    uLng = position.coords.longitude;
    var marker = L.marker([uLat, uLng]).addTo(mymap);
}
getLocation();
$('.ld').css('display', 'none');
var mymap = L.map('mapid').setView([13.7333439, 100.5359456], 15);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiaW5ubmVhbmciLCJhIjoiY2p3Yzlkdmg1MDBvMDQ5bnBlaXV3OGFycyJ9.4J6Br9eq-Yck6JyXqV1k8Q', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'your.mapbox.access.token'
}).addTo(mymap);
var greenIcon = L.icon({
    iconUrl: 'bus.png',
    iconSize: [38, 50], // size of the icon
    iconAnchor: [19, 25], // point of the icon which will correspond to marker's location
    popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
});
var dataR;
var overlays = Object;
var BusSelect = 0;
var refreshBus = Object;
var ajax = Array;
var loadCompleted = 0;
var allLoad = 0;
function getBus(busNum) {
    ajax[busNum] = $.ajax({
        type: "GET",
        url: "https://api.innnblog.com/track/" + busNum,
        crossDomain: true,
        success: function (data) {
            ajax[busNum].success = true;
            if (BusSelect != 0) {
                BusSelect.remove();
            }
            else {
                //console.log('! Remove');
            }
            dataR = data;
            var Group = [];
            dataR.forEach(element => {
                Group.push(L.marker([element.lat, element.lng], { icon: greenIcon, rotationAngle: element.direction }));
            });
            var busGroup = L.layerGroup(Group);
            overlays[busNum] = busGroup;
            busGroup.addTo(mymap);
            loadCompleted++;
            console.log('loadcomplete'+ loadCompleted);
            loadingCheck();

        },
        dataType: "json"
    });
}
function loadingCheck(){
    if(loadCompleted == allLoad){
        $('.ld').css('display', 'none');
        $('#refresh').css('display', 'inline');
    }
    console.log('loadcompletedddddd');
}
var timeout = 0;
$('#refresh').click(function () {


        console.log('Refresh!');
        overlays = [];
        mymap.eachLayer(function (layer) {
            if (typeof layer._url == 'undefined') {
                layer.remove();
            }
            getLocation();

        });
        allLoad = $('#menu input[type="checkbox"]:checked').length;
        $('#menu input:checked').each(function () {
            console.log('the checked is' + $(this).attr('id'));  
            getBus($(this).attr('id'));
            console.log('loading num = ' + allLoad);

        });
        $('.ld').css('display', 'inline-block');
        $('#refresh').css('display', 'none');

});
$('.busNum').change(function () {
    if (this.checked) {
        console.log($(this).attr('id') + 'ticked. Bus is loading');
        getBus($(this).attr('id'));
    }
    else {
        console.log($(this).attr('id') + 'uncheckededdddd');
        if (ajax[$(this).attr('id')].success !== true) {
            ajax[$(this).attr('id')].abort();
        }
        else {
            overlays[$(this).attr('id')].removeFrom(mymap);

        }


    }
});