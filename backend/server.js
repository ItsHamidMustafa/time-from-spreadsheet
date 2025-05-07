const express = require('express');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

const EXCEL_FILE_PATH = path.join(__dirname, 'pick-cal.xlsx');

let cachedTimeBefore = null;
let cachedTimeAfter = null;

function updateCache() {
    try {
        const workbook = xlsx.readFile(EXCEL_FILE_PATH);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const rawTimeBefore = sheet['I5']?.v || null;
        const rawTimeAfter = sheet['I14']?.v || null;

        console.log(`[DEBUG] Raw values - I5: ${rawTimeBefore}, I14: ${rawTimeAfter}`);

        cachedTimeBefore = rawTimeBefore;
        cachedTimeAfter = rawTimeAfter;

        console.log(`[DEBUG] Cached values - cachedTimeBefore: ${cachedTimeBefore}, cachedTimeAfter: ${cachedTimeAfter}`);
        console.log('[INFO] Excel file cache updated.');
    } catch (err) {
        console.error('[ERROR] Failed to update Excel cache:', err.message);
    }
}

updateCache();

fs.watch(EXCEL_FILE_PATH, (eventType, filename) => {
    if (eventType === 'change') {
        console.log('[INFO] Detected change in Excel file. Reloading...');
        updateCache();
    }
});

app.get('/time', (req, res) => {
    try {
        if (!cachedTimeBefore || !cachedTimeAfter) {
            return res.status(500).json({ error: 'Data not loaded yet' });
        }

        const now = new Date();
        const tenThirty = new Date();
        tenThirty.setHours(10, 30, 0, 0);

        const displayTime = now < tenThirty ? cachedTimeBefore : cachedTimeAfter;
        res.json({ time: displayTime });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});