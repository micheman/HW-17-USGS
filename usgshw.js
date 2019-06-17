function plotQuakeInfo(info2plot) {
  for (let [key, value] of Object.entries(info2plot)) {
    console.log(`${key}: ${value}`);
  } 
}

function getGradedColor(QuakeColorByMag) {
  if (QuakeColorByMag > 7) {return "red"}
  else if (QuakeColorByMag > 6) {return "orange"}
  else if (QuakeColorByMag > 5) {return "yellow"}
  else if (QuakeColorByMag > 4) {return "green"}
  else {return "green"}
}


// Create a map object
var myMap = L.map("map", {
  center: [37.09, -95.71],
  // center: [-81.4748, 41.7033], antarctica!!!
  zoom: 2.5
});

L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets-basic",
  accessToken: API_KEY
}).addTo(myMap);

// Define a markerSize function that will give each city a different radius based on its population
function markerSize(sizeWanted) {
  // return population / 40; // convert from population in .1-10 million
  return sizeWanted * 20000; // convert to Richter scale in .5-10 .
}

// Base website for earthquake datasets...
// https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php

// All day, all quakes: more data than we need rigth now.
// url4geojson = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
//
// Small dataset above works, now try something bigger...
// This is for all month, all quakes... Wow, that is way too big and slow.
// url4geojson = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// ANother.. significant quakes ALL DAY
// https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson

// All day, all quakes - works well for long term use.
// url4geojson = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Significant earthquakes, 30 days
url4geojson = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";

d3.json(url4geojson, function(GeoJson) {
    // Upon response, do some cool stuff...
    console.log(GeoJson);
    var locations = {}
    console.log(GeoJson.features[0].properties.place,
                GeoJson.features[0].geometry.coordinates[1], // beware: coord[0] is "Y" (longitude)
                GeoJson.features[0].geometry.coordinates[0]  // beware: coord[1] is "X" (latitude)
                );
    var QuakeCities = {};
    QuakeCities = GeoJson.features.map(data => {
        return (
            {
                QuakeMag: data.properties.mag,
                QuakeGps: [data.geometry.coordinates[1], data.geometry.coordinates[0]],
                QuakeLoc: data.properties.place
            }
        )
    }); 
    console.log(QuakeCities);
    QuakeCities.forEach(City => {
      L.circle(City.QuakeGps, {
        fillOpacity: 0.55,
        // color: "black",
        color: 0,
        weight: 1,
        // fillColor: "red",
        fillColor: getGradedColor(City.QuakeMag),
        // Setting our circle's radius equal to the output of our markerSize function
        // This will make our marker's size proportionate to its population
        radius: markerSize(City.QuakeMag)
      })
      .bindPopup("<h3>" + City.QuakeLoc + "</h3> <hr> <h4>Magnitude: " + City.QuakeMag  + "</h4>").addTo(myMap);
    });
    CreateLegend();
});

function getColor(d) {
  return d > 1000 ? '#800026' :
         d > 500  ? '#BD0026' :
         d > 200  ? '#E31A1C' :
         d > 100  ? '#FC4E2A' :
         d > 50   ? '#FD8D3C' :
         d > 20   ? '#FEB24C' :
         d > 10   ? '#FED976' :
                    '#FFEDA0';
}

function CreateLegend() {
  // var botrht = "bottomright";
  var legend = L.control({position: 'bottom right'});
  legend.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'info legend'),
          grades = [0, 10, 20, 50, 100, 200, 500, 1000],
          // labels = [];
          labels = ["L0", "L10:", "L20", "L50", "L100", "L200", "L500", "L1000"];
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
      return div;
  };
  legend.addTo(map);
};
  
// Reference: Week#17-Lesson-01-06Ins_City-Population
