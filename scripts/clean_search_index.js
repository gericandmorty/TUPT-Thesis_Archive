const fs = require('fs');
const path = require('path');

// Use relative path from the project root (web/data/search_index.json)
const filePath = path.join(__dirname, '..', 'data', 'search_index.json');

try {
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`Loaded ${data.length} items. Removing "folder" metadata...`);

    const cleanedData = data.map(item => {
        const { folder, ...rest } = item;
        return rest;
    });

    fs.writeFileSync(filePath, JSON.stringify(cleanedData, null, 2));
    console.log('Successfully cleaned search_index.json and saved relative to project root.');
} catch (error) {
    console.error('Error processing search_index.json:', error.message);
    process.exit(1);
}
