(function() {
  var Gmaps;
  Gmaps = {};
  Gmaps.loadMaps = function() {
    var key, value, _results;
    _results = [];
    for (key in Gmaps) {
      value = Gmaps[key];
      _results.push(key !== "loadMaps" ? window["load_" + key]() : void 0);
    }
    return _results;
  };
  window.Gmaps = Gmaps;
  this.Gmaps4Rails = (function() {
    function Gmaps4Rails() {
      this.map = null;
      this.visibleInfoWindow = null;
      this.userLocation = null;
      this.geolocationFailure = function() {
        return false;
      };
      this.callback = function() {
        return false;
      };
      this.customClusterer = function() {
        return false;
      };
      this.infobox = function() {
        return false;
      };
      this.default_map_options = {
        id: 'map',
        draggable: true,
        detect_location: false,
        center_on_user: false,
        center_latitude: 0,
        center_longitude: 0,
        zoom: 7,
        maxZoom: null,
        minZoom: null,
        auto_adjust: true,
        auto_zoom: true,
        bounds: []
      };
      this.default_markers_conf = {
        title: "",
        picture: "",
        width: 22,
        length: 32,
        draggable: false,
        do_clustering: true,
        randomize: false,
        max_random_distance: 100,
        list_container: null,
        offset: 0
      };
      this.markers = [];
      this.boundsObject = null;
      this.polygons = [];
      this.polylines = [];
      this.circles = [];
      this.markerClusterer = null;
      this.markerImages = [];
    }
    Gmaps4Rails.prototype.initialize = function() {
      this.map = this.createMap();
      if (this.map_options.detect_location === true || this.map_options.center_on_user === true) {
        this.findUserLocation(this);
      }
      return this.resetSidebarContent();
    };
    Gmaps4Rails.prototype.findUserLocation = function(map_object) {
      var positionFailure, positionSuccessful;
      if (navigator.geolocation) {
        positionSuccessful = function(position) {
          map_object.userLocation = map_object.createLatLng(position.coords.latitude, position.coords.longitude);
          if (map_object.map_options.center_on_user === true) {
            return map_object.centerMapOnUser();
          }
        };
        positionFailure = function() {
          return map_object.geolocationFailure(true);
        };
        return navigator.geolocation.getCurrentPosition(positionSuccessful, positionFailure);
      } else {
        return map_object.geolocationFailure(false);
      }
    };
    Gmaps4Rails.prototype.create_direction = function() {
      var directionsDisplay, directionsService, request;
      directionsDisplay = new google.maps.DirectionsRenderer();
      directionsService = new google.maps.DirectionsService();
      directionsDisplay.setMap(this.map);
      if (this.direction_conf.display_panel) {
        directionsDisplay.setPanel(document.getElementById(this.direction_conf.panel_id));
      }
      directionsDisplay.setOptions({
        suppressMarkers: false,
        suppressInfoWindows: false,
        suppressPolylines: false
      });
      request = {
        origin: this.direction_conf.origin,
        destination: this.direction_conf.destination,
        waypoints: this.direction_conf.waypoints,
        optimizeWaypoints: this.direction_conf.optimizeWaypoints,
        unitSystem: google.maps.DirectionsUnitSystem[this.direction_conf.unitSystem],
        avoidHighways: this.direction_conf.avoidHighways,
        avoidTolls: this.direction_conf.avoidTolls,
        region: this.direction_conf.region,
        travelMode: google.maps.DirectionsTravelMode[this.direction_conf.travelMode],
        language: "en"
      };
      return directionsService.route(request, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
          return directionsDisplay.setDirections(response);
        }
      });
    };
    Gmaps4Rails.prototype.create_circles = function() {
      var circle, _i, _len, _ref, _results;
      _ref = this.circles;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        circle = _ref[_i];
        _results.push(this.create_circle(circle));
      }
      return _results;
    };
    Gmaps4Rails.prototype.create_circle = function(circle) {
      var newCircle;
      if (circle === this.circles[0]) {
        if (circle.strokeColor != null) {
          this.circles_conf.strokeColor = circle.strokeColor;
        }
        if (circle.strokeOpacity != null) {
          this.circles_conf.strokeOpacity = circle.strokeOpacity;
        }
        if (circle.strokeWeight != null) {
          this.circles_conf.strokeWeight = circle.strokeWeight;
        }
        if (circle.fillColor != null) {
          this.circles_conf.fillColor = circle.fillColor;
        }
        if (circle.fillOpacity != null) {
          this.circles_conf.fillOpacity = circle.fillOpacity;
        }
      }
      if ((circle.lat != null) && (circle.lng != null)) {
        newCircle = new google.maps.Circle({
          center: this.createLatLng(circle.lat, circle.lng),
          strokeColor: circle.strokeColor || this.circles_conf.strokeColor,
          strokeOpacity: circle.strokeOpacity || this.circles_conf.strokeOpacity,
          strokeWeight: circle.strokeWeight || this.circles_conf.strokeWeight,
          fillOpacity: circle.fillOpacity || this.circles_conf.fillOpacity,
          fillColor: circle.fillColor || this.circles_conf.fillColor,
          clickable: circle.clickable || this.circles_conf.clickable,
          zIndex: circle.zIndex || this.circles_conf.zIndex,
          radius: circle.radius
        });
        circle.serviceObject = newCircle;
        return newCircle.setMap(this.map);
      }
    };
    Gmaps4Rails.prototype.clear_circles = function() {
      var circle, _i, _len, _ref, _results;
      _ref = this.circles;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        circle = _ref[_i];
        _results.push(this.clear_circle(circle));
      }
      return _results;
    };
    Gmaps4Rails.prototype.clear_circle = function(circle) {
      return circle.serviceObject.setMap(null);
    };
    Gmaps4Rails.prototype.hide_circles = function() {
      var circle, _i, _len, _ref, _results;
      _ref = this.circles;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        circle = _ref[_i];
        _results.push(this.hide_circle(circle));
      }
      return _results;
    };
    Gmaps4Rails.prototype.hide_circle = function(circle) {
      return circle.serviceObject.setMap(null);
    };
    Gmaps4Rails.prototype.show_circles = function() {
      var circle, _i, _len, _ref, _results;
      _ref = this.circles;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        circle = _ref[_i];
        _results.push(this.show_circle(this.circle));
      }
      return _results;
    };
    Gmaps4Rails.prototype.show_circle = function(circle) {
      return circle.serviceObject.setMap(this.map);
    };
    Gmaps4Rails.prototype.create_polygons = function() {
      var polygon, _i, _len, _ref, _results;
      _ref = this.polygons;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        polygon = _ref[_i];
        _results.push(this.create_polygon(polygon));
      }
      return _results;
    };
    Gmaps4Rails.prototype.create_polygon = function(polygon) {
      var fillColor, fillOpacity, latlng, new_poly, point, polygon_coordinates, strokeColor, strokeOpacity, strokeWeight, _i, _len;
      polygon_coordinates = [];
      for (_i = 0, _len = polygon.length; _i < _len; _i++) {
        point = polygon[_i];
        latlng = this.createLatLng(point.lat, point.lng);
        polygon_coordinates.push(latlng);
        if (point === polygon[0]) {
          strokeColor = this.polygons[i][j].strokeColor || this.polygons_conf.strokeColor;
          strokeOpacity = this.polygons[i][j].strokeOpacity || this.polygons_conf.strokeOpacity;
          strokeWeight = this.polygons[i][j].strokeWeight || this.polygons_conf.strokeWeight;
          fillColor = this.polygons[i][j].fillColor || this.polygons_conf.fillColor;
          fillOpacity = this.polygons[i][j].fillOpacity || this.polygons_conf.fillOpacity;
        }
      }
      new_poly = new google.maps.Polygon({
        paths: polygon_coordinates,
        strokeColor: strokeColor,
        strokeOpacity: strokeOpacity,
        strokeWeight: strokeWeight,
        fillColor: fillColor,
        fillOpacity: fillOpacity,
        clickable: false
      });
      polygon.serviceObject = new_poly;
      return new_poly.setMap(this.map);
    };
    Gmaps4Rails.prototype.create_polylines = function() {
      var polyline, _i, _len, _ref, _results;
      _ref = this.polylines;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        polyline = _ref[_i];
        _results.push(this.create_polyline(polyline));
      }
      return _results;
    };
    Gmaps4Rails.prototype.create_polyline = function(polyline) {
      var decoded_array, element, latlng, new_poly, point, polyline_coordinates, strokeColor, strokeOpacity, strokeWeight, _i, _j, _len, _len2, _ref;
      polyline_coordinates = [];
      for (_i = 0, _len = polyline.length; _i < _len; _i++) {
        element = polyline[_i];
        if (element.coded_array != null) {
          decoded_array = new google.maps.geometry.encoding.decodePath(element.coded_array);
          _ref = decoded_array.length;
          for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
            point = _ref[_j];
            polyline_coordinates.push(point);
            polyline_coordinates.push(point);
          }
        } else {
          if (element === polyline[0]) {
            strokeColor = element.strokeColor || this.polylines_conf.strokeColor;
            strokeOpacity = element.strokeOpacity || this.polylines_conf.strokeOpacity;
            strokeWeight = element.strokeWeight || this.polylines_conf.strokeWeight;
          }
          if ((element.lat != null) && (element.lng != null)) {
            latlng = this.createLatLng(element.lat, element.lng);
            polyline_coordinates.push(latlng);
          }
        }
      }
      new_poly = new google.maps.Polyline({
        path: polyline_coordinates,
        strokeColor: strokeColor,
        strokeOpacity: strokeOpacity,
        strokeWeight: strokeWeight,
        clickable: false
      });
      polyline.serviceObject = new_poly;
      return new_poly.setMap(this.map);
    };
    Gmaps4Rails.prototype.create_markers = function() {
      this.createServiceMarkersFromMarkers();
      return this.clusterize();
    };
    Gmaps4Rails.prototype.createServiceMarkersFromMarkers = function() {
      var Lat, LatLng, Lng, index, _ref, _ref2;
      for (index = _ref = this.markers_conf.offset, _ref2 = this.markers.length - 1; _ref <= _ref2 ? index <= _ref2 : index >= _ref2; _ref <= _ref2 ? index++ : index--) {
        console.log(index);
        Lat = this.markers[index].lat;
        Lng = this.markers[index].lng;
        if (this.markers_conf.randomize) {
          LatLng = this.randomize(Lat, Lng);
          Lat = LatLng[0];
          Lng = LatLng[1];
        }
        this.markers[index].serviceObject = this.createMarker({
          "marker_picture": this.markers[index].picture ? this.markers[index].picture : this.markers_conf.picture,
          "marker_width": this.markers[index].width ? this.markers[index].width : this.markers_conf.width,
          "marker_height": this.markers[index].height ? this.markers[index].height : this.markers_conf.length,
          "marker_title": this.markers[index].title ? this.markers[index].title : null,
          "marker_anchor": this.markers[index].marker_anchor ? this.markers[index].marker_anchor : null,
          "shadow_anchor": this.markers[index].shadow_anchor ? this.markers[index].shadow_anchor : null,
          "shadow_picture": this.markers[index].shadow_picture ? this.markers[index].shadow_picture : null,
          "shadow_width": this.markers[index].shadow_width ? this.markers[index].shadow_width : null,
          "shadow_height": this.markers[index].shadow_height ? this.markers[index].shadow_height : null,
          "marker_draggable": this.markers[index].draggable ? this.markers[index].draggable : this.markers_conf.draggable,
          "rich_marker": this.markers[index].rich_marker ? this.markers[index].rich_marker : null,
          "Lat": Lat,
          "Lng": Lng,
          "index": index
        });
        this.createInfoWindow(this.markers[index]);
        this.createSidebar(this.markers[index]);
      }
      return this.markers_conf.offset = this.markers.length;
    };
    Gmaps4Rails.prototype.createImageAnchorPosition = function(anchorLocation) {
      if (anchorLocation === null) {
        return null;
      } else {
        return this.createPoint(anchorLocation[0], anchorLocation[1]);
      }
    };
    Gmaps4Rails.prototype.replaceMarkers = function(new_markers) {
      this.clearMarkers();
      this.markers = new Array;
      this.boundsObject = this.createLatLngBounds();
      this.resetSidebarContent();
      this.markers_conf.offset = 0;
      return this.addMarkers(new_markers);
    };
    Gmaps4Rails.prototype.addMarkers = function(new_markers) {
      this.markers = this.markers.concat(new_markers);
      this.create_markers();
      return this.adjustMapToBounds();
    };
    Gmaps4Rails.prototype.createSidebar = function(marker_container) {
      var aSel, currentMap, html, li, ul;
      if (this.markers_conf.list_container) {
        ul = document.getElementById(this.markers_conf.list_container);
        li = document.createElement('li');
        aSel = document.createElement('a');
        aSel.href = 'javascript:void(0);';
        html = marker_container.sidebar != null ? marker_container.sidebar : "Marker";
        aSel.innerHTML = html;
        currentMap = this;
        aSel.onclick = this.sidebar_element_handler(currentMap, marker_container.serviceObject, 'click');
        li.appendChild(aSel);
        return ul.appendChild(li);
      }
    };
    Gmaps4Rails.prototype.sidebar_element_handler = function(currentMap, marker, eventType) {
      return function() {
        currentMap.map.panTo(marker.position);
        return google.maps.event.trigger(marker, eventType);
      };
    };
    Gmaps4Rails.prototype.resetSidebarContent = function() {
      var ul;
      if (this.markers_conf.list_container !== null) {
        ul = document.getElementById(this.markers_conf.list_container);
        return ul.innerHTML = "";
      }
    };
    Gmaps4Rails.prototype.adjustMapToBounds = function() {
      var bound, circle, map_center, point, polygon, polygon_points, polyline, polyline_points, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _len6, _m, _n, _ref, _ref2, _ref3, _ref4;
      if (this.map_options.auto_adjust || this.map_options.bounds !== null) {
        this.boundsObject = this.createLatLngBounds();
      }
      if (this.map_options.auto_adjust) {
        this.extendBoundsWithMarkers();
        _ref = this.polylines;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          polyline = _ref[_i];
          polyline_points = polyline.serviceObject.latLngs.getArray()[0].getArray();
          for (_j = 0, _len2 = polyline.length; _j < _len2; _j++) {
            point = polyline[_j];
            this.boundsObject.extend(point);
          }
        }
        _ref2 = this.polygons;
        for (_k = 0, _len3 = _ref2.length; _k < _len3; _k++) {
          polygon = _ref2[_k];
          polygon_points = polygon.serviceObject.latLngs.getArray()[0].getArray();
          for (_l = 0, _len4 = polygon.length; _l < _len4; _l++) {
            point = polygon[_l];
            this.boundsObject.extend(point);
          }
        }
        _ref3 = this.circles;
        for (_m = 0, _len5 = _ref3.length; _m < _len5; _m++) {
          circle = _ref3[_m];
          this.boundsObject.extend(circle.serviceObject.getBounds().getNorthEast());
          this.boundsObject.extend(circle.serviceObject.getBounds().getSouthWest());
        }
      }
      _ref4 = this.map_options.bounds;
      for (_n = 0, _len6 = _ref4.length; _n < _len6; _n++) {
        bound = _ref4[_n];
        bound = this.createLatLng(bound.lat, bound.lng);
        this.boundsObject.extend(bound);
      }
      if (this.map_options.auto_adjust || this.map_options.bounds.length > 0) {
        if (!this.map_options.auto_zoom) {
          map_center = this.boundsObject.getCenter();
          this.map_options.center_latitude = map_center.lat();
          this.map_options.center_longitude = map_center.lng();
          return this.map.setCenter(map_center);
        } else {
          return this.fitBounds();
        }
      }
    };
    Gmaps4Rails.prototype.create_kml = function() {
      var kml, _i, _len, _ref, _results;
      _ref = this.kml;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        kml = _ref[_i];
        _results.push(kml.serviceObject = this.createKmlLayer(kml));
      }
      return _results;
    };
    Gmaps4Rails.prototype.exists = function(var_name) {
      return var_name !== "" && typeof var_name !== "undefined";
    };
    Gmaps4Rails.prototype.randomize = function(Lat0, Lng0) {
      var Lat, Lng, dx, dy;
      dx = this.markers_conf.max_random_distance * this.random();
      dy = this.markers_conf.max_random_distance * this.random();
      Lat = parseFloat(Lat0) + (180 / Math.PI) * (dy / 6378137);
      Lng = parseFloat(Lng0) + (90 / Math.PI) * (dx / 6378137) / Math.cos(Lat0);
      return [Lat, Lng];
    };
    Gmaps4Rails.prototype.mergeObjectWithDefault = function(object1, object2) {
      var copy_object1, key, value;
      copy_object1 = object1;
      for (key in object2) {
        value = object2[key];
        if (copy_object1[key] == null) {
          copy_object1[key] = value;
        }
      }
      return copy_object1;
    };
    Gmaps4Rails.prototype.mergeWithDefault = function(objectName) {
      var default_object, object;
      default_object = this["default_" + objectName];
      object = this[objectName];
      this[objectName] = this.mergeObjectWithDefault(object, default_object);
      return true;
    };
    Gmaps4Rails.prototype.random = function() {
      return Math.random() * 2 - 1;
    };
    return Gmaps4Rails;
  })();
}).call(this);
