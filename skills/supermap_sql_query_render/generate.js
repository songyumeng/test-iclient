const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const dataServiceUrl = args[0] || ''; // dataServiceUrl from args or empty
const datasourceName = args[1] || ''; // datasourceName from args or empty
const datasetName = args[2] || ''; // datasetName from args or empty
const attributeFilter = args[3] || '1=1'; // attributeFilter from args or default 1=1

const templatePath = path.join(__dirname, 'template/demo.html.tpl');
const outputPath = path.join(__dirname, 'dist/demo.html');

// Ensure dist directory exists
if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
}

fs.readFile(templatePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading template:', err);
        return;
    }

    // Simple replace logic, warning if values are missing
    let result = data.replace(/__DATA_SERVICE_URL__/g, dataServiceUrl || (console.warn('dataServiceUrl is missing'), ''))
                     .replace(/__DATASOURCE_NAME__/g, datasourceName || (console.warn('datasourceName is missing'), ''))
                     .replace(/__DATASET_NAME__/g, datasetName || (console.warn('datasetName is missing'), ''))
                     .replace(/__ATTRIBUTE_FILTER__/g, attributeFilter);

    fs.writeFile(outputPath, result, 'utf8', (err) => {
        if (err) {
            console.error('Error writing output file:', err);
        } else {
            console.log('Output written to', outputPath);
        }
    });
});
