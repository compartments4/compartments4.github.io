//#region MAP SETUP

const map = new maplibregl.Map({
  container: 'map',
  style: './datasets/project_intersect.json',
  center: [77.58,12.97],
  zoom: 10.39,
  attributionControl: true
});
//#endregion


//#region COMPONENTS

map.addControl(new maplibregl.NavigationControl(), 'top-right');
map.addControl(new maplibregl.ScaleControl(), 'bottom-right');
map.addControl(new maplibregl.FullscreenControl(), 'top-right');

//#endregion


//#region LAYERS

/**
 * Registers a GeoJSON file from ./datasets/ as a map source.
 * Safe to call multiple times with the same sourceId — duplicate is skipped.
 *
 * @param {string} sourceId  Unique source identifier
 * @param {string} filename  File name inside ./datasets/  e.g. 'locations.geojson'
 */
function addSource(sourceId, filename) {
  if (map.getSource(sourceId)) return;
  map.addSource(sourceId, {
    type: 'geojson',
    data: `./datasets/${filename}`
  });
}

/**
 * Adds a circle (point) layer.
 *
 * @param {Object} options
 * @param {string}  options.layerId        Unique layer ID
 * @param {string}  options.sourceId       Source ID registered with addSource()
 * @param {string}  [options.color]        Fill colour        (default: '#3b82f6')
 * @param {string}  [options.strokeColor]  Stroke colour      (default: '#ffffff')
 * @param {number|Array} [options.radius]   Radius in px (default: 6), or a MapLibre
 *                                          expression for zoom-based control.
 * @param {number}  [options.strokeWidth]  Stroke width px    (default: 2)
 * @param {number}  [options.opacity]      Opacity 0–1        (default: 0.9)
 * @param {string}  [options.before]       Insert below this layer ID
 */
function addPointLayer({
  layerId,
  sourceId,
  color       = '#3b82f6',
  strokeColor = '#ffffff',
  radius      = 6,
  strokeWidth = 2,
  opacity     = 0.9,
  before      = undefined
} = {}) {
  if (map.getLayer(layerId)) return;
  map.addLayer(
    {
      id:     layerId,
      type:   'circle',
      source: sourceId,
      paint: {
        'circle-color':        color,
        'circle-radius':       radius,
        'circle-stroke-color': strokeColor,
        'circle-stroke-width': strokeWidth,
        'circle-opacity':      opacity
      }
    },
    before
  );
}

/**
 * Adds a fill (polygon) layer.
 *
 * @param {Object} options
 * @param {string}  options.layerId        Unique layer ID
 * @param {string}  options.sourceId       Source ID registered with addSource()
 * @param {string}  [options.color]        Fill colour        (default: '#3b82f6')
 * @param {number}  [options.opacity]      Fill opacity 0–1   (default: 0.4)
 * @param {string}  [options.strokeColor]  Outline colour     (default: '#1d4ed8')
 * @param {number}  [options.strokeWidth]  Outline width px   (default: 1)
 * @param {string}  [options.before]       Insert below this layer ID
 */
function addPolygonLayer({
  layerId,
  sourceId,
  color       = '#3b82f6',
  opacity     = 0.4,
  strokeColor = '#1d4ed8',
  strokeWidth = 1,
  before      = undefined
} = {}) {
  if (map.getLayer(layerId)) return;
  map.addLayer(
    {
      id:     layerId,
      type:   'fill',
      source: sourceId,
      paint: {
        'fill-color':   color,
        'fill-opacity': opacity,
        'fill-outline-color': strokeColor
      }
    },
    before
  );
  // fill-outline-color only supports width=1, so add a separate line layer for thicker strokes
  if (strokeWidth > 1) {
    map.addLayer(
      {
        id:     `${layerId}-outline`,
        type:   'line',
        source: sourceId,
        paint: {
          'line-color': strokeColor,
          'line-width': strokeWidth
        }
      },
      before
    );
  }
}

/**
 * Adds a line layer.
 *
 * @param {Object}        options
 * @param {string}        options.layerId    Unique layer ID
 * @param {string}        options.sourceId   Source ID registered with addSource()
 * @param {string}        [options.color]    Line colour           (default: '#3b82f6')
 * @param {number|Array}  [options.width]    Width in px (default: 2), or a MapLibre
 *                                           expression for zoom-based control.
 * @param {number}        [options.opacity]  Opacity 0–1           (default: 1)
 * @param {number[]}      [options.dash]     Dash pattern e.g. [2, 1]. Omit for solid line.
 * @param {string}        [options.cap]      Line cap: 'round' | 'butt' | 'square' (default: 'round')
 * @param {string}        [options.join]     Line join: 'round' | 'bevel' | 'miter' (default: 'round')
 * @param {string}        [options.before]   Insert below this layer ID
 */
function addLineLayer({
  layerId,
  sourceId,
  color   = '#3b82f6',
  width   = 2,
  opacity = 1,
  dash    = undefined,
  cap     = 'round',
  join    = 'round',
  before  = undefined
} = {}) {
  if (map.getLayer(layerId)) return;

  const paint = {
    'line-color':   color,
    'line-width':   width,
    'line-opacity': opacity,
    ...(dash ? { 'line-dasharray': dash } : {})
  };

  map.addLayer(
    {
      id:     layerId,
      type:   'line',
      source: sourceId,
      layout: { 'line-cap': cap, 'line-join': join },
      paint
    },
    before
  );
}

/**
 * Adds a symbol (text label) layer.
 *
 * @param {Object} options
 * @param {string}  options.layerId        Unique layer ID
 * @param {string}  options.sourceId       Source ID registered with addSource()
 * @param {string}  [options.property]     Feature property to use as label text  (default: 'name')
 * @param {string}  [options.placement]    'point' | 'line' | 'line-center'       (default: 'line')
 * @param {number}  [options.size]         Font size in px                         (default: 12)
 * @param {string}  [options.color]        Text colour                             (default: '#ffffff')
 * @param {string}  [options.haloColor]    Halo colour                             (default: '#000000')
 * @param {number}  [options.haloWidth]    Halo width in px                        (default: 1.5)
 * @param {number}  [options.minzoom]      Minimum zoom to show labels             (default: undefined)
 * @param {string}  [options.before]       Insert below this layer ID
 */
function addSymbolLayer({
  layerId,
  sourceId,
  property    = 'name',
  placement   = 'line',
  size        = 12,
  color       = '#ffffff',
  haloColor   = '#000000',
  haloWidth   = 1.5,
  minzoom     = undefined,
  before      = undefined
} = {}) {
  if (map.getLayer(layerId)) return;
  const layer = {
    id:     layerId,
    type:   'symbol',
    source: sourceId,
    layout: {
      'symbol-placement': placement,
      'text-field':       ['get', property],
      'text-font':        ['Open Sans Regular'],
      'text-size':        size,
      'text-max-angle':   30,
    },
    paint: {
      'text-color':       color,
      'text-halo-color':  haloColor,
      'text-halo-width':  haloWidth,
    }
  };
  if (minzoom !== undefined) layer.minzoom = minzoom;
  map.addLayer(layer, before);
}

/**
 * Adds a heatmap layer.
 *
 * @param {Object}  options
 * @param {string}  options.layerId       Unique layer ID
 * @param {string}  options.sourceId      Source ID registered with addSource()
 * @param {string}  [options.weightProp]  Feature property used as intensity weight.
 *                                        Pass null/omit to weight all points equally.
 * @param {number}  [options.weightMax]   Maximum value of weightProp  (default: 10)
 * @param {Object}  [options.paint]       MapLibre paint properties for the heatmap.
 *                                        Merged on top of the computed heatmap-weight.
 * @param {string}  [options.before]      Insert below this layer ID
 *
 * @example
 * addHeatmapLayer({
 *   layerId:   'crash-points-heat',
 *   sourceId:  'crash-points',
 *   weightProp: 'density',
 *   weightMax:  1,
 *   paint: {
 *     'heatmap-radius':    ["interpolate", ["linear"], ["zoom"], 0, 2, 13.68, 60],
 *     'heatmap-opacity':   0.54,
 *     'heatmap-intensity': 0.5,
 *     'heatmap-color':     ["step", ["heatmap-density"], "rgba(0,0,255,0)", 0.5, "red"]
 *   }
 * });
 */
function addHeatmapLayer({
  layerId,
  sourceId,
  weightProp = null,
  weightMax  = 10,
  paint      = {},
  before     = undefined
} = {}) {
  if (map.getLayer(layerId)) return;

  const heatmapWeight = weightProp
    ? ['interpolate', ['linear'], ['get', weightProp], 0, 0, weightMax, 1]
    : 1;

  map.addLayer(
    {
      id:     layerId,
      type:   'heatmap',
      source: sourceId,
      paint:  { 'heatmap-weight': heatmapWeight, ...paint }
    },
    before
  );
}

/**
 * Central place to define every layer in the map.
 * Called once inside map.on('load').
 *
 * Pattern for each dataset:
 *   1. addSource('<id>', '<file>.geojson')
 *   2. addPointLayer({ ... })  and/or  addHeatmapLayer({ ... })
 */

// ── Point layer template ──────────────────────────────────────────────────
  // addSource('my-points', 'my-points.geojson');
  // addPointLayer({
  //   layerId:     'my-points-layer',
  //   sourceId:    'my-points',
  //   color:       '#3b82f6',   // fill colour
  //   strokeColor: '#ffffff',   // outline colour
  //   radius:      6,           // px
  //   strokeWidth: 2,           // px
  //   opacity:     0.9          // 0–1
  // });

  // ── Heatmap layer template ────────────────────────────────────────────────
  // addSource('my-heat', 'my-heat.geojson');
  // addHeatmapLayer({
  //   layerId:    'my-heat-layer',
  //   sourceId:   'my-heat',
  //   weightProp: 'magnitude',  // feature property to drive intensity; null = equal weight
  //   weightMax:  10,           // max value of weightProp
  //   radius:     20,           // px
  //   opacity:    0.85,         // 0–1
  //   maxZoom:    14            // zoom at which heatmap fully fades out
  // });

  // ── Heatmap + points on the same source (common pattern) ─────────────────
  // addSource('events', 'events.geojson');
  // addHeatmapLayer({ layerId: 'events-heat', sourceId: 'events', weightProp: 'count' });
  // addPointLayer({ layerId: 'events-points', sourceId: 'events', radius: 4, opacity: 0.7 });


function addLayers() {

    // Road labels
    addSource('labels', 'labels.geojson');
    addSymbolLayer({ layerId: 'labels-text', sourceId: 'labels', property: 'name', placement: 'line', size: 11, color: '#ffffff', haloColor: '#143542', haloWidth: 2 });

    // Boundaries
    addSource('gba-boundary', 'gba-boundary.geojson');
    addLineLayer({ layerId: 'gba-boundary-line', sourceId: 'gba-boundary', color: '#fff', width: 1, dash: [2, 3] });

    addSource('gba-zones', 'gba-zones.geojson');
    addLineLayer({ layerId: 'gba-zones-line', sourceId: 'gba-zones', color: '#ffffff82', width: 1 });

     addSource('gba-wards', 'gba-wards.geojson');
    addLineLayer({ layerId: 'gba-wards-line', sourceId: 'gba-wards', color: '#ffffff82', width: 0.1 });

    
    
    
    
    
    //Heat Map Crash Points 2020-2022
    addSource('crash-points', 'crash-points.geojson');
    addHeatmapLayer({
      layerId:    'crash-points-heat',
      sourceId:   'crash-points',
      weightProp: 'density',
      weightMax:  1,
      paint: {
        'heatmap-radius': [
          "interpolate", ["linear"], ["zoom"],
          0, 2, 5, 10, 8.54, 10, 10.04, 15, 10.53, 25, 11.26, 30, 12.18, 40, 13.68, 60
        ],
        'heatmap-opacity':   0.3,
        'heatmap-intensity': 0.5,
        'heatmap-color': [
          "step", ["heatmap-density"],
          "rgba(0, 0, 255, 0)",
          0.5, "hsla(0, 53%, 92%, 0.43)",
          0.6, "hsla(0, 86%, 87%, 0.56)",
          0.9, "hsla(0, 83%, 75%, 0.61)",
          1,   "hsla(0, 90%, 53%, 0.88)"
        ]
      }
    });

    // 63 Blackspots
    addSource('blackspots', 'blackspots.geojson');
    addPolygonLayer({layerId:     'blackspots-polygon',
      sourceId:    'blackspots',
      color:       '#ff00004e',   // fill colour
      opacity:     0.2,         // 0–1
      strokeColor: '#ff0000',   // outline colour
      strokeWidth: 6           // px
    });
    addLayerInteractivity('blackspots-polygon', [
      { attr: 'location', label: 'Location' },
      { attr: 'junction id', label: 'Junction IDs' },
      { attr: 'traffic_ps',  label: 'Traffic Police Station' }
    ]);

    //Suraksha 75 and 15th Finance Junctions
    addSource('junctions-development', 'junctions-development.geojson');
    addPointLayer({ layerId: 'junctions-development-points', 
                    sourceId: 'junctions-development', 
                    color: '#00f82d', 
                    strokeColor: '#00ff15c9', 
                    radius: [
                              "interpolate", ["linear"], ["zoom"],
                              0, 1.5,
                              10.25, 2,
                              12.1, 3,
                              13.51, 6,
                              14.62, 9,
                              22, 3
                            ],  
                    strokeWidth: 2, 
                    opacity: 0.5 });
    addLayerInteractivity('junctions-development-points', [
        { attr: 'category', label: 'Category' },
        { attr: 'j_name', label: 'Name' },
        { attr: 'j_code', label: 'Junction Code' },
        { attr: 'Grant Name',  label: 'Grant Name' },
        { attr: 'Year of grant',  label: 'Grant Year' }
      ]);

          //177 Locations
    addSource('proposed-locations', 'proposed-locations.geojson');
    addPolygonLayer({layerId:     'proposed-locations-polygon',
      sourceId:    'proposed-locations',
      color:       '#ffea004e',   // fill colour
      opacity:     0.2,         // 0–1
      strokeColor: '#d9ff00',   // outline colour
      strokeWidth: 2.5           // px
    });
    map.on('mouseenter', 'proposed-locations-polygon', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'proposed-locations-polygon', () => { map.getCanvas().style.cursor = ''; });
}

//#endregion


//#region FILTERS

/**
 * Wire up a filter dropdown to one or more map layers.
 * Selecting 'all' clears the filter; any other value applies ['==', property, value].
 *
 * @param {string}          dropdownId  id of the <sl-dropdown> element
 * @param {string|string[]} layerIds    layer ID or array of layer IDs to filter
 * @param {string}          property    feature property to filter on
 *
 * @example
 * // Single layer
 * setupFilter('filter-category', 'junctions-development-points', 'category');
 *
 * // Multiple layers — same filter applied to all
 * setupFilter('filter-ward', ['blackspots-polygon', 'junctions-development-points', 'proposed-locations-polygon'], 'ward');
 */
/**
 * Resolves layer IDs to their GeoJSON source URLs, fetches each source, and
 * auto-populates a dropdown with the sorted unique values of the given property.
 * Array-valued properties are flattened so each element becomes its own option.
 *
 * Call this alongside setupFilter() — it only handles the UI population.
 *
 * @param {string}   dropdownId  id of the <sl-dropdown> element
 * @param {string[]} layerIds    layer IDs whose sources will be scanned
 * @param {string}   property    feature property to collect values from
 *
 * @example
 * populateFilter('filter-junction', ['junctions-development-points', 'proposed-locations-polygon'], 'j_code');
 */
async function populateFilter(dropdownId, layerIds, property) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;
  const menu = dropdown.querySelector('sl-menu');
  if (!menu) return;

  // Resolve layer IDs → deduplicated source data URLs
  const sourceUrls = new Set();
  for (const id of layerIds) {
    const layer  = map.getLayer(id);
    if (!layer) continue;
    const source = map.getSource(layer.source);
    if (!source) continue;
    const url = source.serialize().data;
    if (typeof url === 'string') sourceUrls.add(url);
  }

  const valuesSet = new Set();
  const codeToRaws = new Map(); // individual code → Set of raw property strings containing it
  for (const url of sourceUrls) {
    try {
      const res  = await fetch(url);
      const data = await res.json();
      for (const feat of data.features ?? []) {
        const raw = feat.properties?.[property];
        if (raw === null || raw === undefined || raw === '') continue;
        const rawStr = String(raw);
        const vals = rawStr.split(',');
        vals.forEach(v => {
          const t = v.trim();
          if (!t) return;
          valuesSet.add(t);
          if (!codeToRaws.has(t)) codeToRaws.set(t, new Set());
          codeToRaws.get(t).add(rawStr);
        });
      }
    } catch (err) {
      console.error(`populateFilter: failed to load ${url}:`, err);
    }
  }

  // Store for setupFilter to expand individual codes → raw property values
  dropdown._codeToRaws = codeToRaws;

  const divider = document.createElement('sl-divider');
  menu.appendChild(divider);
  [...valuesSet].sort().forEach(val => {
    const item = document.createElement('sl-menu-item');
    item.setAttribute('type', 'checkbox');
    item.setAttribute('value', val);
    item.textContent = val;
    menu.appendChild(item);
  });
}

/**
 * Injects a live search input into a dropdown panel.
 * Items are shown/hidden as the user types; resets when the dropdown closes.
 * The 'All' item (value="all") is always visible regardless of the query.
 *
 * @param {string} dropdownId  id of the <sl-dropdown> element
 */
function addDropdownSearch(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;
  const menu = dropdown.querySelector('sl-menu');
  if (!menu) return;

  const input = dropdown.querySelector('sl-input');
  if (!input) return;

  // Filter items as the user types
  input.addEventListener('sl-input', () => {
    const q = input.value.toLowerCase();
    menu.querySelectorAll('sl-menu-item').forEach(item => {
      if (item.value === 'all') return;
      item.style.display = item.textContent.trim().toLowerCase().includes(q) ? '' : 'none';
    });
  });

  // Prevent arrow keys from being captured by the menu while typing
  input.addEventListener('keydown', e => e.stopPropagation());

  // Auto-focus the search input when the dropdown opens
  dropdown.addEventListener('sl-after-show', () => input.focus());

  // Reset search when the dropdown closes
  dropdown.addEventListener('sl-after-hide', () => {
    input.value = '';
    menu.querySelectorAll('sl-menu-item').forEach(item => item.style.display = '');
  });
}

// Registry: dropdownId → { ids, currentFilter }
const _filterRegistry = new Map();

// Cache of sourceId → Feature[] for reliable counting independent of map viewport
const _sourceCache = {};

async function cacheSource(sourceId, filename) {
  if (_sourceCache[sourceId]) return;
  try {
    const res  = await fetch(`./datasets/${filename}`);
    const data = await res.json();
    _sourceCache[sourceId] = data.features ?? [];
  } catch (e) {
    console.error(`cacheSource: failed to load ${filename}`, e);
    _sourceCache[sourceId] = [];
  }
}

// Combines all active filter expressions per layer and applies them.
function applyFilters() {
  const allLayerIds = new Set();
  _filterRegistry.forEach(({ ids }) => ids.forEach(id => allLayerIds.add(id)));

  allLayerIds.forEach(layerId => {
    const conditions = [];
    _filterRegistry.forEach(({ ids, currentFilter }) => {
      if (ids.includes(layerId) && currentFilter) conditions.push(currentFilter);
    });

    const combined = conditions.length === 0 ? null
      : conditions.length === 1 ? conditions[0]
      : ['all', ...conditions];

    map.setFilter(layerId, combined);
    if (map.getLayer(`${layerId}-outline`)) map.setFilter(`${layerId}-outline`, combined);
  });

  updateOverlayStats();
}

function setupFilter(dropdownId, layerIds, property) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;

  const ids = Array.isArray(layerIds) ? layerIds : [layerIds];
  _filterRegistry.set(dropdownId, { ids, currentFilter: null });

  dropdown.addEventListener('sl-select', (e) => {
    if (e.detail.item.value === 'all') {
      dropdown.querySelectorAll('sl-menu-item[type="checkbox"]').forEach(i => { i.checked = false; });
    }

    // Shoelace auto-toggles checked on checkbox items before firing sl-select,
    // so we read the current state directly from the DOM.
    const selected = [...dropdown.querySelectorAll('sl-menu-item[type="checkbox"]')]
      .filter(i => i.checked)
      .map(i => i.value);

    // For CSV properties (e.g. j_code), expand each selected individual code to
    // all raw property values that contain it, then match against those raw values.
    // For scalar properties, selected values are used directly.
    const codeMap = dropdown._codeToRaws;
    let matchValues = selected;
    if (codeMap) {
      const rawSet = new Set();
      selected.forEach(code => (codeMap.get(code) ?? [code]).forEach(r => rawSet.add(r)));
      matchValues = [...rawSet];
    }

    _filterRegistry.get(dropdownId).currentFilter = selected.length === 0
      ? null
      : ['match', ['get', property], matchValues, true, false];

    applyFilters();
  });
}

/**
 * Clears all active filters, resets checkmarks, and clears search inputs.
 * Wired to the Reset button in the header.
 */
function resetAllFilters() {
  _filterRegistry.forEach((entry, dropdownId) => {
    entry.currentFilter = null;
    const dd = document.getElementById(dropdownId);
    if (dd) {
      dd.querySelectorAll('sl-menu-item[type="checkbox"]').forEach(i => { i.checked = false; });
      const input = dd.querySelector('sl-input');
      if (input) input.value = '';
      dd.querySelectorAll('sl-menu-item').forEach(i => { i.style.display = ''; });
    }
  });
  applyFilters();
}

/**
 * Central place to wire up all filter dropdowns.
 * Called once inside map.on('load').
 */
function addFilters() {
  const allLayers = ['blackspots-polygon', 'junctions-development-points', 'gba-wards-line', 'gba-zones-line', 'proposed-locations-polygon'];
  const junctionLayers = ['blackspots-polygon', 'junctions-development-points', 'proposed-locations-polygon'];

  addDropdownSearch('filter-corporation');
  setupFilter('filter-corporation',    allLayers,                                                   'Corporation');

  addDropdownSearch('filter-road-hierarchy');
  setupFilter('filter-road-hierarchy', junctionLayers,        'road_hierarchy');

  addDropdownSearch('filter-junction');
  populateFilter('filter-junction', junctionLayers, 'j_code');
  setupFilter('filter-junction',    junctionLayers,  'j_code');

  document.getElementById('btn-reset-filters')?.addEventListener('click', resetAllFilters);
}

//#endregion


//#region LAYER MANAGER

/**
 * Friendly display names for map layers shown in the layers panel.
 * Key: layer ID as registered with addPointLayer / addPolygonLayer / addHeatmapLayer.
 * Value: label shown in the panel UI.
 * Layers without an entry here will fall back to their raw layer ID.
 */
const layerLabels = {
  'blackspots-polygon':            'Blackspots',
  'junctions-development-points':  'Suraksha 75 + 15th Finance',
  'proposed-locations-polygon':  '177 Priority Locations',
};

//#endregion


//#region INTERACTIVITY

/**
 * Attaches click-popup and hover-cursor interactivity to a layer.
 *
 * @param {string} layerId     ID of the layer to make interactive
 * @param {Array}  attributes  Each entry is either:
 *   - a string → used as both the property key and the display label
 *   - an object { attr, label } → attr is the property key, label is the display text
 *
 * @example
 * addLayerInteractivity('blackspots-polygon', [
 *   'location',
 *   { attr: 'junction id', label: 'Junction IDs within the Blackspot' },
 *   { attr: 'traffic_ps',  label: 'Traffic (peak season)' }
 * ]);
 */
// Registry of layerId → attributes, in registration order.
const _interactiveLayers = new Map();

/**
 * Registers a layer for click-popup and hover-cursor interactivity.
 * When layers overlap, the popup belongs to whichever is rendered on top.
 */
function addLayerInteractivity(layerId, attributes = []) {
  _interactiveLayers.set(layerId, attributes);
  map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; });
}

// Single click handler — queryRenderedFeatures returns features topmost-first.
map.on('click', (e) => {
  // proposed-locations-polygon → side panel instead of popup
  const panelFeats = map.queryRenderedFeatures(e.point, { layers: ['proposed-locations-polygon'] });
  if (panelFeats.length) { openFeaturePanel(panelFeats[0]); return; }

  // Close panel if open and clicking elsewhere on the map
  document.getElementById('feature-panel')?.hide();

  if (_interactiveLayers.size === 0) return;

  const features = map.queryRenderedFeatures(e.point, {
    layers: [..._interactiveLayers.keys()]
  });
  if (!features.length) return;

  const feature    = features[0];                               // topmost
  const attributes = _interactiveLayers.get(feature.layer.id);
  const props      = feature.properties;

  const rows = attributes
    .filter(entry => {
      const attr = typeof entry === 'string' ? entry : entry.attr;
      const val  = props[attr];
      return val !== null && val !== undefined && val !== '';
    })
    .map(entry => {
      const attr  = typeof entry === 'string' ? entry : entry.attr;
      const label = typeof entry === 'string' ? entry : entry.label;
      return `<div style="display:grid;grid-template-columns:auto 1fr;gap:0 6px"><strong style="white-space:nowrap">${label}:</strong><span>${props[attr]}</span></div>`;
    })
    .join('');

  new maplibregl.Popup()
    .setMaxWidth('320px')
    .setLngLat(e.lngLat)
    .setHTML(rows || '(no attributes)')
    .addTo(map);
});

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

function buildCarousel(pl_id, carousel) {
  const base = `files/media/proposed-locations/${pl_id}/${pl_id}`;

  const probeImage = (idx) => {
    const img = new Image();
    img.onload = () => {
      const item = document.createElement('sl-carousel-item');
      item.appendChild(img);
      carousel.appendChild(item);
      probeImage(idx + 1);
    };
    img.src = `${base}_${idx}.png`;
  };

  probeImage(1);
}

function openFeaturePanel(feature) {
  const props = feature.properties;
  const { theme, type, j_name, pl_id, size, road_hierarchy, crash_count, crash_type, crash_context } = props;
  const hierarchy = formatHierarchy(road_hierarchy);
  const name = j_name ? j_name.split(',').map(s => s.trim()).filter(s => s && s !== 'NULL').join(', ') : null;

  // Header tags
  setTag('panel-tag-type',  type);
  setTag('panel-tag-theme', theme);
  document.getElementById('panel-header-tags').hidden = !type && !theme;

  // Fields
  setRow('panel-row-id',        'panel-val-id',        pl_id);
  setRow('panel-row-size',      'panel-val-size',      size != null ? `${size}m` : null);
  setRow('panel-row-hierarchy', 'panel-val-hierarchy', hierarchy);

  // Carousel
  const carousel = document.getElementById('panel-carousel');
  carousel.innerHTML = '';
  buildCarousel(pl_id, carousel);

  // Crash section
  document.getElementById('panel-crash-section').hidden = crash_count == null && !crash_type && !crash_context;
  setRow('panel-row-crash-count',    'panel-val-crash-count',    crash_count != null ? String(crash_count) : null);
  setTagRow('panel-row-crash-type',    'panel-val-crash-type',    crash_type,    'crash-type');
  setTagRow('panel-row-crash-context', 'panel-val-crash-context', crash_context, 'crash-context');

  document.getElementById('panel-view-details').href = `files/pages/${pl_id}.html`;

  const drawer = document.getElementById('feature-panel');
  drawer.label = name || pl_id || '';
  drawer.show();
}

function evalFilter(filter, props) {
  if (!filter) return true;
  const [op, ...args] = filter;
  if (op === 'all')   return args.every(f => evalFilter(f, props));
  if (op === '==')    return String(props[args[0][1]] ?? '') === String(args[1]);
  if (op === 'match') {
    const val    = String(props[args[0][1]] ?? '');
    const values = args[1];
    return ((Array.isArray(values) ? values : [values]).map(String).includes(val) ? args[2] : args[3]);
  }
  return true;
}

function countLayer(sourceId, layerId, extraFilter) {
  const features    = _sourceCache[sourceId] ?? [];
  const layerFilter = map.getFilter(layerId);
  let combined;
  if (extraFilter && layerFilter) combined = ['all', layerFilter, extraFilter];
  else if (extraFilter)           combined = extraFilter;
  else                            combined = layerFilter;
  return features.filter(f => evalFilter(combined, f.properties)).length;
}

function updateOverlayStats() {
  document.getElementById('stat-pl').textContent  = countLayer('proposed-locations',    'proposed-locations-polygon');
  document.getElementById('stat-bs').textContent  = countLayer('blackspots',             'blackspots-polygon');
  document.getElementById('stat-jd').textContent  = countLayer('junctions-development', 'junctions-development-points');
  document.getElementById('stat-s75').textContent = countLayer('junctions-development', 'junctions-development-points', ['==', ['get', 'category'],    'Suraksha 75']);
  document.getElementById('stat-f15').textContent = countLayer('junctions-development', 'junctions-development-points', ['==', ['get', 'Grant Name'], '15th Finance']);
}

//#endregion


//#region MAP LOAD

map.on('load', async () => {
  addLayers();

  const layersControl = new LayersControl({
    title:        'Layers',
    customLabels: layerLabels,
  });
  map.addControl(layersControl, 'bottom-left');
  layersControl.buildPanel(); // 'load' already fired; populate panel manually

  addFilters();

  await Promise.all([
    cacheSource('proposed-locations',    'proposed-locations.geojson'),
    cacheSource('blackspots',             'blackspots.geojson'),
    cacheSource('junctions-development', 'junctions-development.geojson'),
  ]);

  document.getElementById('loading').style.display = 'none';
  updateOverlayStats();
});

map.on('style.load', () => console.log('Style loaded'));

map.on('error', (e) => {
  console.error('Map error:', e);
  document.getElementById('loading').innerHTML =
    '<strong>Error loading map</strong><br>Check console for details';
});

//#endregion
