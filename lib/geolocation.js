"use strict";

var EventEmitter = require('eventemitter3');



var Geolocation = module.exports = function (startLat, startLng) {
    this.options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };
    this.watch = -1;
    this.cache = {
        latitude: startLat ? startLat : null,
        longitude: startLng ? startLng : null,
        accuracy: null,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null
    };

};
Geolocation.prototype = Object.create(EventEmitter.prototype);



Geolocation.prototype.calculateAccuracy = function (coords) {
    var latAccuracy = 180 * coords.accuracy / 40075017;
    var lngAccuracy = latAccuracy / Math.cos((Math.PI / 180) * coords.latitude);

    return {
        southWest : [coords.latitude - latAccuracy, coords.longitude - lngAccuracy],
        northEast : [coords.latitude + latAccuracy, coords.longitude + lngAccuracy]
    }
};



Geolocation.prototype.onSuccess = function (position) {
    this.cache = position.coords;
    this.emit('position', this.cache);
};



Geolocation.prototype.onError = function (error) {
    this.emit('error', error.code, error.message);
};



Geolocation.prototype.listen = function () {
    var self = this;

    if (!navigator.geolocation) {
        return this.emit('error', -1, 'Not supported');
    } 

    this.watch = navigator.geolocation.watchPosition(function (position) {
        self.onSuccess(position);
    }, function (error) {
        self.onError(error);
    });

};



Geolocation.prototype.destroy = function () {
    navigator.geolocation.clearWatch(this.watch);
};



Geolocation.prototype.locate = function () {
    var self = this;

    if (!navigator.geolocation) {
        return this.emit('error', -1, 'Not supported');
    } 

    navigator.geolocation.getCurrentPosition(function (position) {
        self.onSuccess(position);
    }, function (error) {
        self.onError(error);
    }, self.options);
};



Geolocation.prototype.location = function () {
    return this.cache;
};
