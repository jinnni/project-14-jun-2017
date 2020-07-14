/*jslint indent: 2 */
/*global window, jQuery, angular, cordova */
"use strict";

// Returns a jQuery or AngularJS deferred object, or pass a success and fail callbacks if you don't want to use jQuery or AngularJS
var getPromisedCordovaExec = function (command, success, fail) {
  var toReturn, deferred, injector, $q;
  if (success === undefined) {
    if (window.jQuery) {
      deferred = jQuery.Deferred();
      success = deferred.resolve;
      fail = deferred.reject;
      toReturn = deferred;
    } else if (window.angular) {
      injector = angular.injector(["ng"]);
      $q = injector.get("$q");
      deferred = $q.defer();
      success = deferred.resolve;
      fail = deferred.reject;
      toReturn = deferred.promise;
    } else if (window.when && window.when.promise) {
      deferred = when.defer();
      success = deferred.resolve;
      fail = deferred.reject;
      toReturn = deferred.promise;
    } else if (window.Promise) {
      toReturn = new Promise(function(c, e) {
        success = c;
        fail = e;
      });
    } else if (window.WinJS && window.WinJS.Promise) {
      toReturn = new WinJS.Promise(function(c, e) {
        success = c;
        fail = e;
      });
    } else {
      return console.error('PJPlugin either needs a success callback, or jQuery/AngularJS/Promise/WinJS.Promise defined for using promises');
    }
  }
  // 5th param is NOT optional. must be at least empty array
  cordova.exec(success, fail, "PJPlugin", command, []);
  return toReturn;
};

var getPromisedCordovaExecv2 = function (command, success, fail, args) {
  var toReturn, deferred, injector, $q;
  if (success === undefined) {
    if (window.jQuery) {
      deferred = jQuery.Deferred();
      success = deferred.resolve;
      fail = deferred.reject;
      toReturn = deferred;
    } else if (window.angular) {
      injector = angular.injector(["ng"]);
      $q = injector.get("$q");
      deferred = $q.defer();
      success = deferred.resolve;
      fail = deferred.reject;
      toReturn = deferred.promise;
    } else if (window.when && window.when.promise) {
      deferred = when.defer();
      success = deferred.resolve;
      fail = deferred.reject;
      toReturn = deferred.promise;
    } else if (window.Promise) {
      toReturn = new Promise(function(c, e) {
        success = c;
        fail = e;
      });
    } else if (window.WinJS && window.WinJS.Promise) {
      toReturn = new WinJS.Promise(function(c, e) {
        success = c;
        fail = e;
      });
    } else {
      return console.error('PJPlugin either needs a success callback, or jQuery/AngularJS/Promise/WinJS.Promise defined for using promises');
    }
  }
  // 5th param is NOT optional. must be at least empty array
  cordova.exec(success, fail, "PJPlugin", command, [args]);
  return toReturn;
};


module.exports = {

    notificationAuthorizationStatus: function (success, fail) {
        return getPromisedCordovaExec("notificationAuthorizationStatus", success, fail);
    },

    openAppSettings: function (success, fail){
        return getPromisedCordovaExec("openAppSettings", success, fail);
    },

    saveImage: function (success, fail, args) {
      return getPromisedCordovaExecv2("saveImage", success, fail,args );
    }
};
