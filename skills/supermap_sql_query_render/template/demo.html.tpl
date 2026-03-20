<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SuperMap SQL Query Render</title>
    <style>
        #map {
            height: 100vh;
            width: 100%;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script src="https://iclient.supermap.io/iclient/examples/2208092115/client.24152.js"></script>
    <script>
        var mapServiceUrl = '__DATA_SERVICE_URL__';
        var datasourceName = '__DATASOURCE_NAME__';
        var datasetName = '__DATASET_NAME__';
        var attributeFilter = '__ATTRIBUTE_FILTER__';
        var tileLayers = new SuperMap.Layer.TiledDynamicRESTLayer("China", mapServiceUrl + "?zxyTileImage.png?z={z}&x={x}&y={y}", {transparent: true});
        var map = new SuperMap.Map("map");
        map.addLayer(tileLayers);
        // Further map configurations...
    </script>
</body>
</html>