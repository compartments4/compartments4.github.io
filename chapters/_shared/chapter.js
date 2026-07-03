//#region Map Init

export function initMap(containerId, options = {}) {
  const { style, center, zoom, ...rest } = options;

  const map = new maplibregl.Map({
    container: containerId,
    style: style ?? '../../dashboard/datasets/project_intersect.json',
    center: center ?? [77.59, 12.97],
    zoom: zoom ?? 10.1,
    ...rest,
  });

  map.addControl(new maplibregl.NavigationControl(), 'top-right');

  return map;
}

//#endregion


//#region Layer Helpers

export function addSource(map, sourceId, filename, basePath = '../../dashboard/datasets/') {
  if (map.getSource(sourceId)) return;
  map.addSource(sourceId, { type: 'geojson', data: `${basePath}${filename}` });
}

export function addHeatmapLayer(map, {
  layerId, sourceId,
  weightProp = null, weightMax = 5,
  paint = {},
  before,
} = {}) {
  const defaultPaint = {
    'heatmap-weight': weightProp
      ? ['interpolate', ['linear'], ['get', weightProp], 0, 0, weightMax, 1]
      : 1,
    'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 10, 1, 15, 3],
    'heatmap-color': [
      'interpolate', ['linear'], ['heatmap-density'],
      0,   'rgba(0,0,255,0)',
      0.2, 'rgba(0,128,255,0.6)',
      0.4, 'rgba(0,220,220,0.8)',
      0.6, 'rgba(0,220,0,0.9)',
      0.8, 'rgba(255,220,0,1)',
      1,   'rgba(255,60,0,1)',
    ],
    'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 10, 15, 15, 25],
    'heatmap-opacity': 0.85,
    ...paint,
  };

  map.addLayer({ id: layerId, type: 'heatmap', source: sourceId, paint: defaultPaint }, before);
}

export function addPolygonLayer(map, {
  layerId, sourceId,
  color = '#3b82f6', opacity = 0.15,
  strokeColor = '#3b82f6', strokeWidth = 1,
  before,
} = {}) {
  map.addLayer({
    id: layerId,
    type: 'fill',
    source: sourceId,
    paint: { 'fill-color': color, 'fill-opacity': opacity },
  }, before);

  if (strokeWidth > 0) {
    map.addLayer({
      id: `${layerId}-outline`,
      type: 'line',
      source: sourceId,
      paint: { 'line-color': strokeColor, 'line-width': strokeWidth },
    }, before);
  }
}

export function addPointLayer(map, {
  layerId, sourceId,
  color = '#3b82f6', radius = 6, opacity = 0.9,
  strokeColor = '#ffffff', strokeWidth = 2,
  before,
} = {}) {
  map.addLayer({
    id: layerId,
    type: 'circle',
    source: sourceId,
    paint: {
      'circle-color': color,
      'circle-radius': radius,
      'circle-opacity': opacity,
      'circle-stroke-color': strokeColor,
      'circle-stroke-width': strokeWidth,
    },
  }, before);
}

export function addLineLayer(map, {
  layerId, sourceId,
  color = '#3b82f6', width = 2, opacity = 1,
  dash = null, cap = 'round', join = 'round',
  before,
} = {}) {
  const paint = { 'line-color': color, 'line-width': width, 'line-opacity': opacity };
  if (dash) paint['line-dasharray'] = dash;

  map.addLayer({
    id: layerId,
    type: 'line',
    source: sourceId,
    layout: { 'line-cap': cap, 'line-join': join },
    paint,
  }, before);
}

export function addSymbolLayer(map, {
  layerId, sourceId,
  property,
  placement = 'point',
  size = 12, color = '#000000',
  haloColor = '#ffffff', haloWidth = 1,
  before,
} = {}) {
  map.addLayer({
    id: layerId,
    type: 'symbol',
    source: sourceId,
    layout: {
      'text-field': ['get', property],
      'text-font': ['Open Sans Regular'],
      'text-size': size,
      'symbol-placement': placement,
      'text-max-angle': 30,
    },
    paint: {
      'text-color': color,
      'text-halo-color': haloColor,
      'text-halo-width': haloWidth,
    },
  }, before);
}

export function filterLayer(map, layerId, attribute, value) {
  map.setFilter(layerId, ['==', ['get', attribute], value]);
}

export function filterLayerByValues(map, layerId, attribute, values) {
  map.setFilter(layerId, ['match', ['get', attribute], values, true, false]);
}

export function clearLayerFilter(map, layerId) {
  map.setFilter(layerId, null);
}

export function colorLayerByValue(map, layerId, attribute, value, matchColor, otherColor) {
  const type = map.getLayer(layerId)?.type;
  const prop = { circle: 'circle-color', fill: 'fill-color', line: 'line-color' }[type];
  if (!prop) return;
  map.setPaintProperty(layerId, prop, ['match', ['get', attribute], value, matchColor, otherColor]);
}

export function colorLayerByValues(map, layerId, attribute, colorsObj, fallback = '#cccccc') {
  const type = map.getLayer(layerId)?.type;
  const prop = { circle: 'circle-color', fill: 'fill-color', line: 'line-color' }[type];
  if (!prop) return;
  const pairs = Object.entries(colorsObj).flat();
  map.setPaintProperty(layerId, prop, ['match', ['get', attribute], ...pairs, fallback]);
}

export function resetLayerColor(map, layerId, color) {
  const type = map.getLayer(layerId)?.type;
  const prop = { circle: 'circle-color', fill: 'fill-color', line: 'line-color' }[type];
  if (prop) map.setPaintProperty(layerId, prop, color);
}

export function setLayerOpacity(map, layerId, opacity) {
  const type = map.getLayer(layerId)?.type;
  const prop = {
    heatmap: 'heatmap-opacity',
    circle:  'circle-opacity',
    fill:    'fill-opacity',
    line:    'line-opacity',
    symbol:  'text-opacity',
  }[type];
  if (prop) map.setPaintProperty(layerId, prop, opacity);
}

export function showLayer(map, layerId) {
  if (!map.getLayer(layerId)) return;
  map.setLayoutProperty(layerId, 'visibility', 'visible');
}

export function hideLayer(map, layerId) {
  if (!map.getLayer(layerId)) return;
  map.setLayoutProperty(layerId, 'visibility', 'none');
}

//#endregion


//#region Legend

export function showLegend(items) {
  const el = document.getElementById('legend');
  if (!el) return;
  el.innerHTML = items.map(({ shape = 'square', fill = 'transparent', stroke = null, strokeWidth = 1.5, label = '' }) => {
    let style = '';
    if (shape === 'line') {
      style = `background:${fill || stroke || '#ccc'}`;
    } else {
      style = `background:${fill || 'transparent'}`;
      if (stroke) style += `;border:${strokeWidth}px solid ${stroke}`;
    }
    const cls = shape === 'circle' ? 'circle' : shape === 'line' ? 'line' : '';
    return `<div class="legend-item"><div class="legend-swatch ${cls}" style="${style}"></div><span class="legend-label">${label}</span></div>`;
  }).join('');
  el.style.display = 'block';
}

export function hideLegend() {
  const el = document.getElementById('legend');
  if (el) el.style.display = 'none';
}

//#endregion


//#region Base Map

export function addBaseMap(map, datasetsPath = '../../dashboard/datasets/') {
    addSource(map, 'bud-boundary', 'bud-boundary.geojson', datasetsPath);
    addPolygonLayer(map, {
      layerId: 'bud-boundary-line',
      sourceId: 'bud-boundary',
      color: 'transparent',
      opacity: 0,
      strokeColor: '#94a3b8',
      strokeWidth: 1.5,
    });

    // Highways
    addSource(map, 'highways', 'highways.geojson', datasetsPath);
    addLineLayer(map, { layerId: 'highways-line', sourceId: 'highways', color: '#faf21839', width: 3 });



     // Road labels
    addSource(map, 'labels', 'labels.geojson', datasetsPath);
    addSymbolLayer(map, { layerId: 'labels-text', sourceId: 'labels', property: 'name', placement: 'point', size: 12, color: '#000000', haloColor: '#d5e655', haloWidth: 4 });


}

//#endregion


//#region Step Navigation

export function initSteps(onStepChange, steps = []) {
  const contents  = Array.from(document.querySelectorAll('.step-content'));
  const prevBtn   = document.getElementById('btn-prev');
  const nextBtn   = document.getElementById('btn-next');
  const indicator = document.getElementById('step-indicator');
  const quotePanel = document.getElementById('quote-panel');
  const quoteText  = quotePanel?.querySelector('.quote-text');
  let current = 0;

  function go(index) {
    contents.forEach((el, i) => el.classList.toggle('is-active', i === index));
    if (prevBtn)   prevBtn.disabled  = index === 0;
    if (nextBtn)   nextBtn.disabled  = index === contents.length - 1;
    if (indicator) indicator.textContent = `${index + 1} / ${contents.length}`;
    onStepChange(index, current);
    current = index;

    const quote = steps[index]?.quote ?? '';
    if (quotePanel) quotePanel.style.display = quote ? 'flex' : 'none';
    if (quoteText)  quoteText.textContent = quote;
  }

  prevBtn?.addEventListener('click', () => go(current - 1));
  nextBtn?.addEventListener('click', () => go(current + 1));

  go(0);
}

//#endregion


//#region Charts

let _chart = null;

async function fetchFeatures(map, sourceId) {
  const src = map.getSource(sourceId)?.serialize();
  if (!src) return [];
  if (typeof src.data === 'string') {
    const res = await fetch(src.data);
    const json = await res.json();
    return json.features ?? [];
  }
  return src.data?.features ?? [];
}

function countFeatures(features, attribute) {
  const counts = {};
  for (const f of features) {
    const val = f.properties?.[attribute];
    if (val != null) counts[val] = (counts[val] || 0) + 1;
  }
  return counts;
}

function resolveColors(labels, colors) {
  if (Array.isArray(colors)) return labels.map((_, i) => colors[i % colors.length]);
  return labels.map(l => colors?.[l] ?? '#38bdf8');
}

export function showChartPanel(title = '', subtitle = '') {
  const panel = document.getElementById('chart-panel');
  panel.style.visibility = 'visible';
  const titleEl = panel.querySelector('.chart-title');
  const subtitleEl = panel.querySelector('.chart-subtitle');
  if (titleEl) titleEl.textContent = title;
  if (subtitleEl) subtitleEl.textContent = subtitle;
}

export function clearChart() {
  if (_chart) { _chart.destroy(); _chart = null; }
  document.getElementById('chart-panel').style.visibility = 'hidden';
}

export async function drawBarChart(map, sourceId, attribute, options = {}) {
  const { title, subtitle = '', colors = {}, labels: labelsMap = {}, topN = null, filter = null, exclude = null } = options;
  let features = await fetchFeatures(map, sourceId);
  if (filter) {
    if (Array.isArray(filter.values)) {
      features = features.filter(f => filter.values.includes(f.properties?.[filter.attribute]));
    } else {
      features = features.filter(f => f.properties?.[filter.attribute] === filter.value);
    }
  }
  const counts = countFeatures(features, attribute);
  let entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (exclude) entries = entries.filter(([k]) => !exclude.includes(k));
  if (topN) entries = entries.slice(0, topN);
  const rawKeys = entries.map(([k]) => k);
  const displayLabels = rawKeys.map(k => labelsMap[k] ?? k);
  const bgColors = resolveColors(rawKeys, colors);
  if (_chart) { _chart.destroy(); _chart = null; }
  showChartPanel(title ?? attribute, subtitle);
  _chart = new window.Chart(document.getElementById('chart'), {
    type: 'bar',
    data: { labels: displayLabels, datasets: [{ data: rawKeys.map(k => counts[k]), backgroundColor: bgColors, borderWidth: 0 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { ticks: { color: '#ffffff', font: { size: 11 } }, grid: { display: false } },
        y: { ticks: { color: '#ffffff' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      },
    },
  });
}

export async function drawPieChart(map, sourceId, attribute, options = {}) {
  const { title, subtitle = '', colors = {}, labels: labelsMap = {}, filter = null } = options;
  let features = await fetchFeatures(map, sourceId);
  if (filter) features = features.filter(f => f.properties?.[filter.attribute] === filter.value);
  const counts = countFeatures(features, attribute);
  const rawKeys = Object.keys(counts).sort();
  const displayLabels = rawKeys.map(k => labelsMap[k] ?? k);
  const bgColors = resolveColors(rawKeys, colors);
  if (_chart) { _chart.destroy(); _chart = null; }

  showChartPanel(title ?? attribute, subtitle);
  const LEGEND_BOX_WIDTH = 20;

  _chart = new window.Chart(document.getElementById('chart'), {
    type: 'doughnut',
    data: {
      labels: displayLabels,
      datasets: [{
        data: rawKeys.map(k => counts[k]),
        backgroundColor: bgColors,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#ffffff',
            font: { size: 12, family: 'Roboto' },
            boxWidth: LEGEND_BOX_WIDTH,
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const value = context.parsed;
              const percentage = ((value / total) * 100).toFixed(1);
              return ` ${context.label}: ${percentage}%`;
            }
          }
        }
      },
    },
  });
}

//#endregion


//#region Custom Carousel

export function initCarousels() {
  document.querySelectorAll('.ch-carousel').forEach(el => {
    const slideEls = [...el.querySelectorAll('.ch-slide')];
    if (!slideEls.length) return;

    const captions = slideEls.map(s => s.querySelector('.ch-caption')?.textContent || '');
    const imgs     = slideEls.map(s => s.querySelector('img').outerHTML);

    let current = 0;

    el.innerHTML = `
      <div class="ch-carousel-track-wrap">
        <div class="ch-carousel-track">
          ${imgs.map(img => `<div class="ch-carousel-slide">${img}</div>`).join('')}
        </div>
        <button class="ch-carousel-btn ch-prev">&#8592;</button>
        <button class="ch-carousel-btn ch-next">&#8594;</button>
      </div>
      <div class="ch-carousel-bottom">
        <div class="ch-carousel-caption">${captions[0]}</div>
        <div class="ch-carousel-dots">
          ${captions.map((_, i) => `<button class="ch-carousel-dot${i === 0 ? ' active' : ''}"></button>`).join('')}
        </div>
      </div>
    `;

    const track   = el.querySelector('.ch-carousel-track');
    const caption = el.querySelector('.ch-carousel-caption');
    const dots    = el.querySelectorAll('.ch-carousel-dot');

    function goTo(n) {
      current = (n + captions.length) % captions.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      caption.textContent = captions[current];
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    el.querySelector('.ch-prev').addEventListener('click', () => goTo(current - 1));
    el.querySelector('.ch-next').addEventListener('click', () => goTo(current + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));
  });
}

//#endregion
