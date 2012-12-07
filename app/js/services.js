'use strict';

/* Services */

// service module
var subcatservices = angular.module('suburbcatServices', ['ngResource']);


// does the ajax calls
subcatservices.factory('Suburb', function($resource){
  return $resource('suburbs/:suburbId.json', {}, {
    query: {method:'GET', params:{suburbId:'suburbs'}, isArray:true}
  });
});    


/* services for cross controller communication of state, data, views etc  */


// shares a model current filters on suburbs across suburblist and mainmap controllers
subcatservices.factory('Subfilter', function() {  
    return { 
        name: "",
        traveltimes: {
            "stlucia": 0, 
            "herston": 0
        }
    };
});

// for tracking current view 
subcatservices.factory('State', function() {  
  return {  
    currentview: "home",
    buttonstate: function() {
      if (this.currentview == "home") {
        return {"mainmap": false ,"showfavourites": true, "addfavourites": false};
      } else if (this.currentview == "detailed") {
        return  {"mainmap": true ,"showfavourites": true , "addfavourites": true};
      } else if (this.currentview == "favourites") {
        return  {"mainmap": true ,"showfavourites": false , "addfavourites": false};
      } 
    } 
  }    
});



// for managing favourites
subcatservices.factory('Favourites', function($location) {

  var favourites = {
          currentsuburb: "",
          list: [],
          add: function() { 
           if (this.match()) {
              this.list.push({"name": this.currentsuburb, "url": $location.path(), "done": false});
           }
           this.localstorage.save();
          },
          match: function() {
            var found = true;
            angular.forEach(this.list, function(item) {
              if (item.url == $location.path()) {found = false};
            }); 
            return found;
          },
          length: function() { // checks if array is empty
            if (this.list.length !== 0) { return true }
          },
          remove: function() {
              var oldlist = this.list;
              var newlist = [];
              angular.forEach(oldlist, function(olditem){
                if (!olditem.done) {newlist.push(olditem)}
              })
              this.list = newlist; 
              this.localstorage.save();
          },
          localstorage: {   // persistence of favourites using HTML storage
            notloaded: true, // load locally stored data once              
            test: function()  { // test for web storage ability using modernizr
              if (Modernizr.localstorage) {
              return true;
              } else {
          // no native support for HTML5 storage :(
              return false;
              }
            }, 
            save: function() {
              if (this.test()) { 
                localStorage.setItem("suburbfavourites", "");
                localStorage.setItem("suburbfavourites", angular.toJson(favourites.list));
              }; 
            },
            read: function(){
              if (this.test() && this.notloaded) { 
                favourites.list  = angular.fromJson(localStorage.getItem("suburbfavourites"));
                this.notloaded = false;
              }
            }
          }
      }
  return favourites;    
})



// for managing polygon display
subcatservices.factory('MapPolygons', function() {
// controls polygon overlays on googlemap on homepage
  var overlaysctrl = {
    polyarray: [], // array of polys
    showPolys: function(map, distance) { // displays polys on map
      if (!this.polyarray.length) { // no polys yet created - create all. 
      this.makePolys();
    };

      // remove all polys
      this.hidePolys(); 
      if (distance == 0) {
        for (var i = 0; i < this.polyarray.length; i++) {
                this.polyarray[i].poly.setMap(map);
        };

      } else {
        for (var i = 0; i < this.polyarray.length; i++) {
          if (distance == this.polyarray[i].distance) {
            this.polyarray[i].poly.setMap(map);
          }     
        };
      }   
    }, 

    hidePolys: function() { // hides polys on map
      for (var i = 0; i < this.polyarray.length; i++) {
        this.polyarray[i].poly.setMap(null);
      };
    }, 

    makePolys: function(){
      for (var i = 0; i < polygonpathdata.length; i++) {
        var paths = polygonpathdata[i].data;
        var color = polygonpathdata[i].color;
        var distance = polygonpathdata[i].distance;

        var poly = new google.maps.Polygon({
            paths: paths,
            strokeColor: color,
            strokeOpacity: 0.35,
            strokeWeight: 1,
            fillColor: color,
            fillOpacity: 0.65,
            clickable: false
          });
        this.polyarray.push({"distance": distance, "poly": poly});  
      };       
    }
}
return overlaysctrl;    
})





