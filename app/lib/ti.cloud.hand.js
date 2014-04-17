/**
 * This is generated code - it will be overwritten. Do not modify.
 * Copyright (c) 2012 by Appcelerator, Inc. All Rights Reserved.
 */

function InvokeService(path, method, data, cb) {
   if (typeof(data) == "function") {
      cb = data; data = null;
   }
   if (typeof(cb) !== "function")
      throw new Error("callback must be provided!");
   var xhr = Ti.Network.createHTTPClient();
   xhr.onerror = function(e) {
      cb(e.error);
   };
   xhr.onload = function(e) {
      var r = this.responseText;
      try {
         if (xhr.getResponseHeader("content-type").indexOf("json") != -1) {
             r = JSON.parse(r);
         }
      } catch (E) {}
      cb(null, r);
   };
   if(exports.URL.match('/$') == '/' && path.indexOf('/') == 0) {
       xhr.open(method, exports.URL + path.substring(1));
   } else {
       xhr.open(method, exports.URL + path);
   }
   xhr.send(data);
};

var url = Ti.App.Properties.getString("acs-service-baseurl-hand");

if(!url) throw new Error("Url not found by acs-service-baseurl-hand.");
if(url.replace(/^\s+|\s+$/g, "")) {
   exports.URL = url.replace(/^\s+|\s+$/g, "");
} else {
   exports.URL = "http://localhost:8080";
}

exports.application_index = function(data, cb) {
   var path = [];
   path.push('/');
   InvokeService(path.join(''), "GET", data, cb);
};
