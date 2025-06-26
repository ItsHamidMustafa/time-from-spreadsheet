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

        const rawDueTime = sheet['F7']?.v || null;
let formattedDueTime = null;

if (typeof rawDueTime === 'number') {
    // Excel time as float (e.g., 0.541666666 ≈ 1:00 PM)
    const totalMinutes = Math.round(rawDueTime * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    formattedDueTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
} else if (typeof rawDueTime === 'string') {
    // Excel time as AM/PM string — e.g., "1:00:00 PM"
    const [timePart, meridian] = rawDueTime.split(/[\s]+/); // splits into ["1:00:00", "PM"]
    let [hour, minute] = timePart.split(':');
    hour = parseInt(hour, 10);
    minute = parseInt(minute, 10);

    if (meridian?.toUpperCase() === 'PM' && hour < 12) {
        hour += 12;
    }
    if (meridian?.toUpperCase() === 'AM' && hour === 12) {
        hour = 0;
    }

    formattedDueTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}


        console.log(`[DEBUG] Raw values - I5: ${rawTimeBefore}, I14: ${rawTimeAfter}, F7 (due): ${rawDueTime}`);

        cachedTimeBefore = rawTimeBefore;
        cachedTimeAfter = rawTimeAfter;
        cachedDueTime = rawDueTime;

        console.log(`[DEBUG] Cached values - cachedTimeBefore: ${cachedTimeBefore}, cachedTimeAfter: ${cachedTimeAfter}, cachedDueTime: ${cachedDueTime}`);
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
        if (!cachedTimeBefore || !cachedTimeAfter || !cachedDueTime) {
            return res.status(500).json({ error: 'Data not loaded yet' });
        }

        const now = new Date();
        const tenThirty = new Date();
        tenThirty.setHours(10, 15, 0, 0);

        const displayTime = now < tenThirty ? cachedTimeBefore : cachedTimeAfter;
        res.json({ time: displayTime, dueTime: cachedDueTime });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});