// Update the generate.js file so that it does not throw when --dataServiceUrl/--datasourceName/--datasetName are missing
const fs = require('fs');
const path = require('path');

function generate(dataServiceUrl, datasourceName, datasetName) {
    if (!dataServiceUrl || !datasourceName || !datasetName) {
        // Create dist/demo.html with empty placeholders and default attributeFilter 1=1
        const demoHtml = `<!DOCTYPE html>\n<html>\n<head>\n    <script src=\"https://iclient.supermap.io/dist/iclient-mapboxgl.min.js\"></script>\n</head>\n<body>\n    <input id=\"dataServiceUrl\" placeholder=\"__DATA_SERVICE_URL__\"/>\n    <input id=\"datasourceName\" placeholder=\"__DATASOURCE_NAME__\"/>\n    <input id=\"datasetName\" placeholder=\"__DATASET_NAME__\"/>\n    <input id=\"attributeFilter\" placeholder=\"__ATTRIBUTE_FILTER__\" value=\"1=1\"/>\n    <button id=\"queryButton\">Query</button>\n    <button id=\"clearButton\">Clear</button>\n    <div id=\"map\"></div>\n    <script>\n        // Implementation of getFeaturesBySQL\n        async function getFeaturesBySQL() {\n            // Logic to add results as GeoJSON layers\n            console.log('Service Result:', serviceResult);\n        }\n    <\/script>\n</body>\n</html>`;

        fs.writeFileSync(path.join(__dirname, 'dist', 'demo.html'), demoHtml);
        return;
    }
    // Existing implementation...
}
