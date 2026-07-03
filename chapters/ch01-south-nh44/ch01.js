import { addHeatmapLayer, addLineLayer, showLayer, hideLayer, setLayerOpacity, colorLayerByValue, colorLayerByValues, resetLayerColor, addSource, addPolygonLayer, addPointLayer, showLegend, hideLegend, filterLayer, filterLayerByValues, clearLayerFilter } from '../_shared/chapter.js';
import * as Charts from './ch01-charts.js';

//#region Layer Setup

// Called once inside map.on('load'), after addBaseMap(map).
// Add all chapter-specific sources and layers here.
// Layers that should start hidden: set visibility: 'none' in their layout.
export function addChapterLayers(map) {

  addSource(map, 'land-use', 'land-use-intersection.geojson');
  addPolygonLayer(map, {
    layerId:     'land-use-polygon',
    sourceId:    'land-use',
    color: [
      'match', ['get', 'LU_MERGE'],
      'Agriculture',    'rgba(168,225,114,0.7)',
      'Commercial Area','rgb(255, 60, 171)',
      'Educational',    'rgba(125,165,218,1)',
      'Industrial',     'rgba(192,126,223,1)',
      'Layout',         'rgba(126,167,214,1)',
      'Parks',          'rgba(133,228,144,1)',
      'Residential',    'rgba(233,222,137,1)',
      'Transport',      'rgba(200,207,188,1)',
      'Vacant Land',    'rgba(198,165,105,0.53)',
      'Vegetated Area', 'rgba(199,218,131,1)',
      'Water Bodies',   'rgba(140,227,208,1)',
      '#cccccc' // fallback
    ],
    opacity:     1,
    strokeColor: 'rgba(35,35,35,0)',
    strokeWidth: 0
  });
  hideLayer(map, 'land-use-polygon');

  //Heat Map Crash Points 2020-2022
  addSource(map, 'old-crash-points', 'old-crash-points.geojson');
  addHeatmapLayer(map, {
        layerId:    'crash-points-heat',
        sourceId:   'old-crash-points',
        weightProp: 'density',
        weightMax:  1,
        paint: {
          'heatmap-radius': [
            "interpolate", ["linear"], ["zoom"],
            0, 2, 5, 10, 8.54, 10, 10.04, 15, 10.53, 25, 11.26, 30, 12.18, 40, 13.68, 60
          ],
          'heatmap-opacity':   0.6,
          'heatmap-intensity': ["interpolate", 
            ["linear"], 
            ["zoom"], 10, 0.4, 
                      12, 0.6, 
                      14, 1, 
                      16, 2],
          'heatmap-color': [
            "step", ["heatmap-density"],
            "rgba(0, 0, 255, 0)",
            0.5, "hsla(0, 88%, 81%, 0.68)",
            0.6, "hsla(0, 85%, 87%, 0.79)",
            0.9, "hsla(10, 83%, 75%, 0.61)",
            1,   "hsla(0, 90%, 53%, 0.88)"
          ]
        }
  });
  hideLayer(map, 'crash-points-heat');

  // addSource(map, 'place-labels', 'place-labels.geojson');
  // addSymbolLayer(map, { layerId: 'place-labels', sourceId: 'place-labels', property: 'name', placement: 'point', size: 13, color: '#f1f5f9', haloColor: '#0f2530', haloWidth: 2 });

  addSource(map, 'south-blackspots', 'south-blackspots.geojson');
  addPolygonLayer(map, {layerId:     'south-blackspots-polygon',
      sourceId:    'south-blackspots',
      color:       '#ff0000ea',   // fill colour
      opacity:     0.5,         // 0–1
      strokeColor: '#ff0000',   // outline colour
      strokeWidth: 0           // px
  });
  hideLayer(map, 'south-blackspots-polygon');
  hideLayer(map, 'south-blackspots-polygon-outline');

  addSource(map, 'south-crashes', 'south-crashes.geojson');
  addPointLayer(map, {
    layerId:     'south-crashes',
    sourceId:    'south-crashes',
    color:       '#e31010a0',
    radius:      6,
    opacity:     0.9,
    strokeColor: '#ffffff08',
    strokeWidth: 0.5,
  });
  hideLayer(map, 'south-crashes');

  addSource(map, 'south-nh44-box', 'south-nh44-box.geojson');
  addPolygonLayer(map, {layerId:     'south-nh44-polygon',
      sourceId:    'south-nh44-box',
      color:       '#ff000000',   // fill colour
      opacity:     0.5,         // 0–1
      strokeColor: '#00fff2',   // outline colour
      strokeWidth: 2          // px
  });
  hideLayer(map, 'south-nh44-polygon');
  hideLayer(map, 'south-nh44-polygon-outline');

  addSource(map, 'fob', 'fob.geojson');
  addLineLayer(map, { layerId: 'fob-line', sourceId: 'fob', color: '#22c55e', width: 2 });
  hideLayer(map, 'fob-line');

  addSource(map, 'fob-buffer', 'fob-buffer.geojson');
  addPolygonLayer(map, { layerId: 'fob-buffer-polygon', sourceId: 'fob-buffer', color: '#3b82f6', opacity: 0.5, strokeWidth: 0, before: 'south-crashes' });
  addLineLayer(map, { layerId: 'fob-buffer-outline', sourceId: 'fob-buffer', color: '#3b82f6', width: 1.5, dash: [3, 2], before: 'south-crashes' });
  hideLayer(map, 'fob-buffer-polygon');
  hideLayer(map, 'fob-buffer-outline');


}

//#endregion


//#region View Cycle

const step1Views = [
  //{ center: [77.59, 12.97], zoom: 10.1 },
  { center: [77.6387, 12.8835], zoom: 13.19 },
  //{ center: [77.6944, 12.972], zoom: 13.4 },
  //{ center: [77.67546, 13.0121], zoom: 12.90 },
  //{ center: [77.5923, 13.0657], zoom: 13.80 },
  { center: [77.5262, 13.0335], zoom: 13.0397 },
];

function startViewCycle(map, views, intervalMs = 15000) {
  let index = 0;
  map.flyTo({ ...views[0], duration: 3000 });

  const timer = setInterval(() => {
    index = (index + 1) % views.length;
    map.flyTo({ ...views[index], duration: 2000 });
  }, intervalMs);10

  return () => clearInterval(timer);
}

let _stopCycle = null;

//#endregion


//#region Steps

// One entry per .step-content div in index.html, in the same order.
// center / zoom : map camera when this step is active
// enter(map)    : called when navigating INTO this step
// exit(map)     : called when navigating OUT of this step
export const steps = [
  //Step 0
  {
    quote: '41% of accidents (2019 - 2022) occured on National Highways, ORR and NICE Roads.',
    center: [77.59, 12.97], zoom: 10.1,
    enter(map) {

      showLegend([
        { shape: 'circle', fill: '#ff2121', stroke: null, label: 'Crash Heat Map' },
        { shape: 'line', fill: '#fff821', stroke: null, label: 'Highway' },
     
      ]);

      showLayer(map, 'crash-points-heat');
      setLayerOpacity(map, 'crash-points-heat', 0.6);
      hideLayer(map, 'land-use-polygon');
      hideLayer(map, 'south-blackspots-polygon');
      hideLayer(map, 'south-blackspots-polygon-outline');
      hideLayer(map, 'south-crashes');
    },
    exit(map) {
      hideLegend();
    },
  },
  //Step 1
  {
    enter(map) {
      showLegend([
        { shape: 'circle', fill: '#ff2121', stroke: null, label: 'Crash Heat Map' },
        { shape: 'square', fill: '#ff5cce', stroke: null, label: 'Commercial' },
        { shape: 'square', fill: '#b05ee6', stroke: null, label: 'Industrial' },
        { shape: 'square', fill: '#e6c65e75', stroke: null, label: 'Residential' },

      ]);

      showLayer(map, 'crash-points-heat');
      setLayerOpacity(map, 'crash-points-heat', 0.7);
      showLayer(map, 'land-use-polygon');
      setLayerOpacity(map, 'land-use-polygon', 0.5);
      hideLayer(map, 'south-blackspots-polygon');
      hideLayer(map, 'south-blackspots-polygon-outline');
      hideLayer(map, 'south-crashes');
      _stopCycle = startViewCycle(map, step1Views);
    },
    exit(map) {
      hideLegend();
      _stopCycle?.();
      _stopCycle = null;
    },
  },
  //Step 2
  {
    center: [77.59, 12.97], zoom: 10.1,
    enter(map) {
      showLayer(map, 'crash-points-heat');
      setLayerOpacity(map, 'crash-points-heat', 0.7);
      showLayer(map, 'south-nh44-polygon-outline');

      hideLayer(map, 'south-blackspots-polygon');
      hideLayer(map, 'land-use-polygon');
      hideLayer(map, 'south-blackspots-polygon-outline');
      hideLayer(map, 'south-crashes');
      

    },
    exit(map) {
      hideLayer(map,'south-nh44-polygon-outline');
    },
  },
  //Step 3
  {
    center: [77.7, 12.85], zoom: 11.4,
    // quote: '',
    enter(map) {
      showLayer(map, 'south-crashes');
      setLayerOpacity(map, 'crash-points-heat', 0.1);
      colorLayerByValues(map, 'south-crashes', 'Combinations', Charts.combinationColors, '#ffeef192');
      Charts.chartCombination(map);

      showLegend([
        { shape: 'circle', fill: 'white', stroke: null, label: 'Crash Points' },
      ]);
    },
    exit(map)  {
      hideLayer(map, 'south-crashes');
      setLayerOpacity(map, 'crash-points-heat', 0.6);
      hideLegend();
      Charts.clearChart();
    },
  },
  //Pattern 01
  {
    center: [77.7, 12.85], zoom: 11.4,
    // quote: '',
    enter(map) {
      showLayer(map, 'south-crashes');
      setLayerOpacity(map, 'crash-points-heat', 0.1);
      colorLayerByValue(map, 'south-crashes', 'Combinations', 'Hit Pedestrian,Bus Stop', '#F15C61', 'rgba(255, 255, 255, 0.04)');
      showLayer(map, 'fob-line');
      showLayer(map, 'fob-buffer-polygon');
      showLayer(map, 'fob-buffer-outline');
      showLegend([
        { shape: 'circle', fill: '#F15C61', stroke: null, label: 'Hit Pedestrian · Bus Stop' },
        { shape: 'square', fill: '#3b82f6', stroke: null, label: '250m Buffer around FOB/ Subway' },
        { shape: 'line',   fill: '#22c55e', stroke: null, label: 'Footover Bridge / Subway' },
      ]);
      document.getElementById('carousel-panel').style.display = 'flex';
      document.getElementById('right-panel').classList.add('has-carousel');
    },
    exit(map)  {
      resetLayerColor(map, 'south-crashes', '#e31010a0');
      hideLayer(map, 'south-crashes');
      setLayerOpacity(map, 'crash-points-heat', 0.6);
      hideLayer(map, 'fob-line');
      hideLayer(map, 'fob-buffer-polygon');
      hideLayer(map, 'fob-buffer-outline');
      hideLegend();
      document.getElementById('carousel-panel').style.display = 'none';
      document.getElementById('right-panel').classList.remove('has-carousel');
    },
  },
  //Pattern 02
  {
    center: [77.7, 12.85], zoom: 11.4,
    // quote: '',
    enter(map) {
      showLayer(map, 'south-crashes');
      setLayerOpacity(map, 'crash-points-heat', 0.1);
      colorLayerByValue(map, 'south-crashes', 'Combinations', 'Hit from Back,Along Main Road', '#F15C61', 'rgba(255, 255, 255, 0.12)');
      showLegend([
        { shape: 'circle', fill: '#F15C61', stroke: null, label: 'Hit from Back · Along Main Road' },
      ]);
      Charts.chartTimeOfDay(map);
    },
    exit(map)  {
      resetLayerColor(map, 'south-crashes', '#e31010a0');
      hideLegend();
      Charts.clearChart();
    },
  },
  //Pattern 03
  {
    center: [77.6931, 12.8141], zoom: 18.6,
    // quote: '',
    enter(map) {
      showLayer(map, 'south-crashes');
      setLayerOpacity(map, 'crash-points-heat', 0.1);
      filterLayer(map, 'south-crashes', 'Context Mapping', 'Access Point');
      colorLayerByValue(map, 'south-crashes', 'Type of Collision', 'Hit Pedestrian', '#f472b6', '#60a5fa');
      showLegend([
        { shape: 'circle', fill: '#f472b6', stroke: null, label: 'Hit Pedestrian · Access Point' },
        { shape: 'circle', fill: '#60a5fa', stroke: null, label: 'Vehicular Crashes · Access Point' },
      ]);
      document.getElementById('carousel-panel-p03').style.display = 'flex';
      document.getElementById('right-panel').classList.add('has-carousel');
    },
    exit(map) {
      clearLayerFilter(map, 'south-crashes');
      resetLayerColor(map, 'south-crashes', '#e31010a0');
      hideLayer(map, 'south-crashes');
      setLayerOpacity(map, 'crash-points-heat', 0.6);
      hideLegend();
      document.getElementById('carousel-panel-p03').style.display = 'none';
      document.getElementById('right-panel').classList.remove('has-carousel');
    },
  },

  //Pattern 04
  {
    center: [77.7, 12.85], zoom: 11.4,
    // quote: '',
    enter(map) {
      showLegend([
        { shape: 'circle', fill: '#ff2121', stroke: null, label: 'Accused - Victim: Lorry - 2 Wheeler' },
        { shape: 'circle', fill: '#72f4e7', stroke: null, label: 'Accused - Victim: 2 Wheeler - 2 Wheeler' },

      ]);
      showLayer(map, 'south-crashes');
      setLayerOpacity(map, 'crash-points-heat', 0.1);
      filterLayer(map, 'south-crashes', 'Type of Collision Cleaned', 'Head On');
      colorLayerByValue(map, 'south-crashes', 'Accused Vehicle', '2W', '#72f4e7', '#ff2121')
      Charts.chartheadOn(map);
    },
    exit(map) {
      clearLayerFilter(map, 'south-crashes');
      resetLayerColor(map, 'south-crashes', '#e31010a0');
      hideLayer(map, 'south-crashes');
      setLayerOpacity(map, 'crash-points-heat', 0.6);
      hideLegend();
      Charts.clearChart();
    },
  },

  //Pattern 05
  {
    center: [77.6905, 12.8186], zoom: 15.28,
    enter(map) {
      showLayer(map, 'south-crashes');
      setLayerOpacity(map, 'crash-points-heat', 0.1);
      filterLayerByValues(map, 'south-crashes', 'Context Mapping', ['T Junction', 'Intersection', 'Service Road Junction']);
      colorLayerByValues(map, 'south-crashes', 'Context Mapping', Charts.junctionContextColors, 'rgba(255,255,255,0.04)');
      showLegend([
        { shape: 'circle', fill: Charts.junctionContextColors['T Junction'],            stroke: null, label: 'T Junction' },
        { shape: 'circle', fill: Charts.junctionContextColors['Intersection'],          stroke: null, label: 'Intersection' },
        { shape: 'circle', fill: Charts.junctionContextColors['Service Road Junction'], stroke: null, label: 'Service Road Junction' },
      ]);
      Charts.chartJunctionTypes(map);
    },
    exit(map) {
      clearLayerFilter(map, 'south-crashes');
      resetLayerColor(map, 'south-crashes', '#e31010a0');
      hideLayer(map, 'south-crashes');
      setLayerOpacity(map, 'crash-points-heat', 0.6);
      hideLegend();
      Charts.clearChart();
    },
  },

  // High Risk Contexts
  {
    center: [77.69, 12.87], zoom: 11.2,
    enter(map) {
      showLayer(map, 'south-crashes');
      setLayerOpacity(map, 'crash-points-heat', 0.1);
      filterLayerByValues(map, 'south-crashes', 'Context Mapping', Object.keys(Charts.highRiskContextColors));
      colorLayerByValues(map, 'south-crashes', 'Context Mapping', Charts.highRiskContextColors, 'rgba(255,255,255,0.04)');
      showLegend([
        { shape: 'circle', fill: Charts.highRiskContextColors['Along Main Road'],       stroke: null, label: 'Along Main Road (75)' },
        { shape: 'circle', fill: Charts.highRiskContextColors['Access Point'],          stroke: null, label: 'Access Point (43)' },
        { shape: 'circle', fill: Charts.highRiskContextColors['Bus Stop'],              stroke: null, label: 'Bus Stop (39)' },
        { shape: 'circle', fill: Charts.highRiskContextColors['Along Service Road'],    stroke: null, label: 'Along Service Road (24)' },
        { shape: 'circle', fill: Charts.highRiskContextColors['Intersection'],          stroke: null, label: 'Intersection (17)' },
      ]);
      Charts.chartHighRiskContexts(map);
    },
    exit(map) {
      clearLayerFilter(map, 'south-crashes');
      resetLayerColor(map, 'south-crashes', '#e31010a0');
      hideLayer(map, 'south-crashes');
      setLayerOpacity(map, 'crash-points-heat', 0.6);
      hideLegend();
      Charts.clearChart();
    },
  },

];

//#endregion
