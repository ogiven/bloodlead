
        var map = L.map('map', {center: [40, -75.155399], zoom: 11});

        // define basemap layers to add to the map
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '© OpenStreetMap' }).addTo(map);
        map.doubleClickZoom.disable();

        var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
            
        var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr}),
         streets  = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr});
            var baseMaps = {
                "gray background": grayscale,
                "street maps": streets
            };

        // add point marker
//        var myDataPoint = L.marker([39.981192, -75.155399]).addTo(map);
//       myDataPoint.bindPopup("This is Temple University.");
//       myDataPoint.bindPopup("<h3>Temple University</h3><p>Philadelphia, PA<br>Information about Temple University.</p>");
        
        // create a polyline
  //      var myDataLine = L.polyline([[40.080922, -75.207875], 
  //                                  [40.077375, -75.201967],
  //                                  [40.073474, -75.196917],
  //                                  [40.065221, -75.191110],
  //                                  [40.062765, -75.185204],
  //                                  [40.060498, -75.178856],
  //                                  [40.051092, -75.171567],
  //                                  [40.037719, -75.171922],
  //                                  [40.036117, -75.161619],
  //                                  [40.036117, -75.161619],
  //                                  [39.981586, -75.149515]
  //                                  ],
  //                      {color: 'red', weight: 5}).addTo(map);

        // Bind popup to line object
  //      myDataLine.bindPopup("Chestnut Line");

        // create a polygon of Philadelphia metro
//        var myArea = L.polygon([[40.134261, -75.270050],
//                                 [40.138132, -74.888837],
//                                 [39.873212, -74.988837],
//                                 [39.859046, -75.377775]
//                                 ],
//                     {color: 'blue', weight: 1}).addTo(map);

        // Bind popup to area object
//        myArea.bindPopup("Philadelphia metro");

        // Create an Empty Popup
        var popup = L.popup();

        // Write function to set Properties of the Popup
        function onMapClick(e) {
            popup
                .setLatLng(e.latlng)
                .setContent("You clicked the map at " + e.latlng.toString())
                .openOn(map);
        }
        
        // Listen for a click event on the Map element
        map.on('click', onMapClick);

        // Set function for color ramp, you can use a better palette
        function setColorFunc(density){
            return density > 68 ? '#980042' :
                   density > 54 ? '#dd1c76' :
                   density > 41 ? '#df65b0' :
                   density > 27 ? '#c994c7' :
                   density > 14 ? '#d4b9da' :
                   density > 0 ? '#ffffff' :
                                 '#666666';
        };
  
        // Set style function that sets fill color property equal to blood lead
        function styleFunc(feature) {
            return {
                fillColor: setColorFunc(feature.properties.num_bll_5p),
                fillOpacity: 0.6,
                weight: 1,
                opacity: 0.6,
                color: '#ffffff',
                dashArray: '3'
            };
        }

        function highlightFeature(e){
            var layer = e.target;

            layer.setStyle({
                weight: 5,
                color: '#666',
                dashArray: '',
                fillOpacity: 1
            });
            // for different web browsers
            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                layer.bringToFront();
            }
        }

        // Define what happens on mouseout:
        function resetHighlight(e) {
            neighborhoodsLayer.resetStyle(e.target);
        }  

        // As an additional touch, let’s define a click listener that zooms to the state: 
        function zoomFeature(e){
            console.log(e.target.getBounds());
            map.fitBounds(e.target.getBounds().pad(1.5));
        }

        // Now we’ll use the onEachFeature option to add the listeners on our state layers:
        function onEachFeatureFunc(feature, layer){
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: zoomFeature
            });
            layer.bindPopup('Blood lead level: '+feature.properties.num_bll_5p);
        }

        var myIcon = L.icon({
            iconUrl: 'imgs/temple.png',
            iconSize: [68, 15],
            iconAnchor: [22, 44],
            popupAnchor: [-3, -76],
            shadowUrl: 'my-icon-shadow.png',
            shadowSize: [68, 15],
            shadowAnchor: [22, 44]
        });
        var temple = L.marker([39.981192, -75.155399], {icon: myIcon});
        var drexel = L.marker([39.957352834066796, -75.18939693143933]);
        var penn = L.marker([39.95285548473699, -75.19309508637147]);

        var universities = L.layerGroup([temple, drexel, penn]);
        var universityLayer = {
            "Philly Universities": universities
        };

        var neighborhoodsLayer = null;
        $.getJSON("data/blood_lead.geojson",function(data){
            neighborhoodsLayer = L.geoJson(data, {
                style: styleFunc,
                onEachFeature: onEachFeatureFunc
            });
            var overlayLayer = {
                "blood_lead_level": neighborhoodsLayer,
                "Phily University": universities
            };
            L.control.layers(baseMaps, overlayLayer).addTo(map);
        });

        // Add Scale Bar to Map
        L.control.scale({position: 'bottomleft'}).addTo(map);

        // Create Leaflet Control Object for Legend
        var legend = L.control({position: 'bottomright'});

        // Function that runs when legend is added to map
        legend.onAdd = function (map) {
            // Create Div Element and Populate it with HTML
            var div = L.DomUtil.create('div', 'legend');            
            div.innerHTML += '<b>Blood lead level</b><br />';
            div.innerHTML += 'by census tract<br />';
            div.innerHTML += '<br>';
            div.innerHTML += 'Natural Breaks:<br />';
            div.innerHTML += '<br>';
            div.innerHTML += '<i style="background: #980042"></i><p>69+</p>';
            div.innerHTML += '<i style="background: #dd1c76"></i><p>55-68</p>';
            div.innerHTML += '<i style="background: #df65b0"></i><p>42-54</p>';
            div.innerHTML += '<i style="background: #c994c7"></i><p>28-41</p>';
            div.innerHTML += '<i style="background: #d4b9da"></i><p>15-27</p>';
            div.innerHTML += '<i style="background: #ffffff"></i><p>0-14</p>';
            div.innerHTML += '<hr>';
            div.innerHTML += '<i style="background: #666666"></i><p>No Data</p>';            
            // Return the Legend div containing the HTML content
            return div;
        };

        // Add Legend to Map
        legend.addTo(map);

        // Create Leaflet Control Object for Legend
        var title = L.control({position: 'topright'});

        // Function that runs when title is added to map
        title.onAdd = function (map) {
            // Create Div Element and Populate it with HTML
            var div = L.DomUtil.create('div', 'title');            
            div.innerHTML += '<b>Philadelphia Blood Lead Levels</b><br/>';
            div.innerHTML += 'GUS 4073 Geovisualization - Lab 8<br/>';
            div.innerHTML += 'Olivia Castello, Fall 2021</p>';            
            // Return the Title div containing the HTML content
            return div;
        };

        // Add Title to Map
        title.addTo(map);
