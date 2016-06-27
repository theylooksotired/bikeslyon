var city = 'Lyon';
var cityIdFirst = 754;
var baseLatitude = 45.764;
var baseLongitude = 4.835;
var centerLatitude = baseLatitude;
var centerLongitude = baseLongitude;
var boundSouth = 45.712;
var boundNorth = 45.795;
var boundWest = 4.773;
var boundEast = 4.921;
var activeStation = map[0];
var mapRender;
var centerMarker;
var mapLoaded = false;
var markers;
var iconInfo = {
                    iconUrl: 'img/markerIcon1.png',
                    iconRetinaUrl: 'img/markerIcon1.png',
                    iconSize: [30, 40],
                    iconAnchor: [15, 40],
                    shadowUrl: 'img/markerShadow.png',
                    shadowRetinaUrl: 'img/markerShadow.png',
                    shadowSize: [41, 41],
                    shadowAnchor: [12, 41],
                    opacity: 0.4
                };

var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
    },
    onDeviceReady: function() {
        checkGPSLocation();
    }
};

$(document).ready(function(){
    adaptMapSize();
});

$(window).load(function() {
    var centerIcon = L.divIcon({className: 'centerIcon'});
    iconInfo.iconUrl = 'img/markerIcon1.png';
    var bikeIcon1 = L.icon(iconInfo);
    iconInfo.iconUrl = 'img/markerIcon2.png';
    var bikeIcon2 = L.icon(iconInfo);
    iconInfo.iconUrl = 'img/markerIcon3.png';
    var bikeIcon3 = L.icon(iconInfo);
    iconInfo.iconUrl = 'img/markerIcon4.png';
    var bikeIcon4 = L.icon(iconInfo);
    iconInfo.iconUrl = 'img/markerIcon5.png';
    var bikeIcon5 = L.icon(iconInfo);
    iconInfo.iconUrl = 'img/markerIcon1_2x.png';
    var bikeIconAlt1 = L.icon(iconInfo);
    iconInfo.iconUrl = 'img/markerIcon2_2x.png';
    var bikeIconAlt2 = L.icon(iconInfo);
    iconInfo.iconUrl = 'img/markerIcon3_2x.png';
    var bikeIconAlt3 = L.icon(iconInfo);
    iconInfo.iconUrl = 'img/markerIcon4_2x.png';
    var bikeIconAlt4 = L.icon(iconInfo);
    iconInfo.iconUrl = 'img/markerIcon5_2x.png';
    var bikeIconAlt5 = L.icon(iconInfo);

    mapRender = new L.Map('mapBikes').setView([centerLatitude, centerLongitude], 16);
    var southWest = L.latLng(boundSouth, boundWest),
        northEast = L.latLng(boundNorth, boundEast),
        mybounds = L.latLngBounds(southWest, northEast);

    L.tileLayer('data/Lyon/maps/{z}/{x}/{y}.jpg', {
        minZoom: 14,
        maxZoom: 17,
        zoom: 15,
        bounds: mybounds,
        id: 'mapbox.streets'
    }).addTo(mapRender);

    centerMarker = L.marker([centerLatitude, centerLongitude], {clickable: false, icon: centerIcon, zIndexOffset:9999});
    centerMarker.addTo(mapRender);

    markers = new L.MarkerClusterGroup();

    $(map).each(function(index, ele) {
        var percentageBikes = parseInt((ele.avg_available_bikes / ele.bike_stands) * 100);
        if (percentageBikes<=20) {
            var marker = new L.Marker([ele.latitude, ele.longitude], {icon: bikeIcon1});
        } else if (percentageBikes > 20 && percentageBikes <= 40) {
            var marker = new L.Marker([ele.latitude, ele.longitude], {icon: bikeIcon2});
        } else if (percentageBikes > 40 && percentageBikes <= 60) {
            var marker = new L.Marker([ele.latitude, ele.longitude], {icon: bikeIcon3});
        } else if (percentageBikes > 60 && percentageBikes <= 80) {
            var marker = new L.Marker([ele.latitude, ele.longitude], {icon: bikeIcon4});
        } else {
            var marker = new L.Marker([ele.latitude, ele.longitude], {icon: bikeIcon5});
        }
        marker.on('click', function(){
            var infoBikes = $('.infoBikes');
            $('.infoName').html(ele.name);
            $('.infoAddress').html(ele.address);
            infoBikes.html('');
            for (var i=1; i<=ele.bike_stands; i++) {
                var divBike = (i<=ele.avg_available_bikes) ? $('<div class="bike"></div>') : $('<div class="bike bikeEmpty"></div>');
                divBike.appendTo(infoBikes);
            }
        });
        markers.addLayer(marker);
    });

    mapRender.addLayer(markers);
    
    mapLoaded = true;
    updateMap();

    $('.locateMeIns').click(function(){
        $('.infoName').html('We are checking your location...');
        $('.infoAddress').html('');
        $('.infoBikes').html('');
        checkGPSLocation();
    });

    checkGPSLocation();
    watchGPSLocation();

});

$(window).resize(function() {
    updateMap();
});

function updateMap() {
    if (mapLoaded) {
        adaptMapSize();
        mapRender.invalidateSize();
        mapRender.panTo([centerLatitude, centerLongitude]);
        centerMarker.setLatLng([centerLatitude, centerLongitude]);
        mapRender.setView([centerLatitude, centerLongitude], 16)
    }
}

function adaptMapSize() {
    $('#mapBikes').css('width', $(window).width());
    $('#mapBikes').css('height', $(window).height());
}

function checkGPSLocation() {
    var onSuccess = function(position) {
        posLatitude = position.coords.latitude;
        posLongitude = position.coords.longitude;
        posLatitude = !(posLatitude<boundNorth && posLatitude>boundSouth) ? baseLatitude : posLatitude;
        posLongitude = !(posLongitude<boundEast && posLongitude>boundWest) ? baseLongitude : posLongitude;
        posLatitude = (posLatitude<boundSouth) ? boundSouth : posLatitude;
        posLatitude = (posLatitude>boundNorth) ? boundNorth : posLatitude;
        posLongitude = (posLongitude<boundWest) ? boundWest : posLongitude;
        posLongitude = (posLongitude>boundEast) ? boundEast : posLongitude;
        centerLatitude = posLatitude;
        centerLongitude = posLongitude;
        $('.centerIcon').addClass('centerIconShow');
        $('.infoName').html('Your location is updated!');
        $('.infoAddress').html('');
        $('.infoBikes').html('');
        updateMap();
    };
    var onError = function(error) {
        $('.infoName').html('Sorry, we cannot find your location');
        $('.infoAddress').html('');
        $('.infoBikes').html('');
    }
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
}

function watchGPSLocation() {
    var onSuccess = function(position) {
        posLatitude = position.coords.latitude;
        posLongitude = position.coords.longitude;
        posLatitude = !(posLatitude<boundNorth && posLatitude>boundSouth) ? baseLatitude : posLatitude;
        posLongitude = !(posLongitude<boundEast && posLongitude>boundWest) ? baseLongitude : posLongitude;
        posLatitude = (posLatitude<boundSouth) ? boundSouth : posLatitude;
        posLatitude = (posLatitude>boundNorth) ? boundNorth : posLatitude;
        posLongitude = (posLongitude<boundWest) ? boundWest : posLongitude;
        posLongitude = (posLongitude>boundEast) ? boundEast : posLongitude;
        centerLatitude = posLatitude;
        centerLongitude = posLongitude;
        $('.centerIcon').addClass('centerIconShow');
        centerMarker.setLatLng([centerLatitude, centerLongitude]);
    };
    var onError = function(error) {
    }
    var watchGPS = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 10000 });
}