//#region CSV PARSING
// Shared by map.js (live side panel) and junction.html (standalone detail page).

/**
 * Parses a single CSV line into an array of field strings, honoring
 * double-quoted fields that may contain embedded commas and escaped
 * double-quotes ("").
 */
function parseCsvLine(line) {
  const fields = [];
  let field = '', inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') { if (line[i + 1] === '"') { field += '"'; i++; } else inQuotes = false; }
      else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { fields.push(field); field = ''; }
      else field += c;
    }
  }
  fields.push(field);
  return fields;
}

/**
 * Parses a full CSV string (with header row) into an array of row objects.
 * Treats the literal string "nil"/"NULL" and blank fields as null.
 */
function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(l => l.length > 0);
  if (lines.length === 0) return [];
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((h, i) => {
      let v = values[i] !== undefined ? values[i].trim() : '';
      if (v === '' || v === 'nil' || v === 'NULL') v = null;
      row[h] = v;
    });
    return row;
  });
}

//#endregion


//#region FORMATTING + DOM HELPERS

const formatHierarchy = (val) => {
  if (!val) return null;
  return val.split(',').map(s => {
    const t = s.trim();
    if (t === 'ARTERIAL') return 'Arterial';
    if (t === 'SUB_ARTERIAL') return 'Sub-Arterial';
    return t;
  }).join(', ');
};

const makeTags = (val, tagName) => {
  if (!val) return '';
  return val.split(',').map(s => s.trim()).filter(Boolean)
    .map(s => `<sl-tag size="small" data-tag="${tagName}">${s}</sl-tag>`).join('');
};

/**
 * Classifies a raw Indian-formatted rupee amount (e.g. "2,00,00,000") into a
 * named budget tier. Stripping commas before parseFloat is sufficient —
 * Indian digit grouping still yields the correct decimal value once commas
 * are removed. Open-ended at both extremes; only the internal boundaries
 * (10L/50L/1Cr) are strict cutoffs.
 */
function classifyBudget(budgetStr) {
  if (!budgetStr) return null;
  const amount = parseFloat(String(budgetStr).replace(/,/g, ''));
  if (Number.isNaN(amount)) return null;
  const LAKH = 100000, CRORE = 10000000;
  if (amount < 10 * LAKH) return '< 10 lakhs';
  if (amount < 50 * LAKH) return '10 - 49 lakhs';
  if (amount < CRORE) return '50 lakhs - <1 crore';
  return '1 - 5 crore';
}

function setTag(id, value) {
  const el = document.getElementById(id);
  el.hidden = !value;
  if (value) el.textContent = value;
}

function setRow(rowId, valId, value) {
  const row = document.getElementById(rowId);
  const empty = value == null || value === '';
  row.hidden = empty;
  if (!empty) document.getElementById(valId).textContent = value;
}

function setTagRow(rowId, valId, value, tagName) {
  const row = document.getElementById(rowId);
  row.hidden = !value;
  if (value) document.getElementById(valId).innerHTML = makeTags(value, tagName);
}

//#endregion


//#region STREET VIEW CAROUSEL

// TODO: replace with a real Google Maps API key, restricted by HTTP referrer
// to this site's domain in Google Cloud Console before deploying.
const GOOGLE_MAPS_API_KEY = 'AIzaSyBXn7GpJuRZm-AMbZAiL7Vwyo6oTsDj9Co';

/**
 * Builds a junction panel carousel from live Google Street View imagery.
 * Checks the Street View Metadata endpoint for each heading first — the
 * Static API image endpoint itself returns 200 even when there's no real
 * imagery at that location/heading, so headings without coverage are
 * skipped based on metadata status rather than image load success.
 * Items are appended in heading order regardless of fetch completion order.
 */
async function buildStreetViewCarousel(lat, lng, carousel, headings = [0, 90, 180, 270]) {
  const checks = await Promise.all(headings.map(async (heading) => {
    const metaUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&heading=${heading}&key=${GOOGLE_MAPS_API_KEY}`;
    try {
      const res  = await fetch(metaUrl);
      const data = await res.json();
      return data.status === 'OK' ? heading : null;
    } catch (e) {
      console.error('buildStreetViewCarousel: metadata check failed', heading, e);
      return null;
    }
  }));

  checks.filter(h => h !== null).forEach(heading => {
    const img = new Image();
    img.onload = () => {
      const item = document.createElement('sl-carousel-item');
      item.appendChild(img);
      carousel.appendChild(item);
    };
    img.src = `https://maps.googleapis.com/maps/api/streetview?size=640x640&location=${lat},${lng}&heading=${heading}&fov=90&pitch=0&key=${GOOGLE_MAPS_API_KEY}`;
  });
}

//#endregion
