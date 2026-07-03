import { drawPieChart, drawBarChart, clearChart } from '../_shared/chapter.js';

//#region Chart: Victim Vehicle

export const victimVehicleColors = {
  'Pedestrian':  '#fe0000c5',
  '2W':          '#ff8800cc',
  'LMV':         '#4f8efb75',
  '3W':          '#639af978',
  'Lorry':       '#76a5f679',
  'Self':        '#4489ff6c',
  'Unknown':     '#b1ccfa60',
  'Bicycle':     '#4489ff65',
  // add more values / colours as needed
};

export const victimVehicleLabels = {
  '2W':   'Two Wheelers',
  'LMV':  'Light Motor Vehicle',
  '3W':   'Three Wheelers',
  'Self': 'Self',
  // add more display name overrides as needed
};

export function chartVictimVehicle(map, 
  { title = 'Victim Vehicle', subtitle = '' } = {}) {
  drawPieChart(map, 'south-crashes', 'Victim Vehicle', {
    title,
    subtitle,
    colors: victimVehicleColors,
    labels: victimVehicleLabels,
  });
}

//#endregion

//#region Chart: Combinations

export const combinationColors = {
  'Hit Pedestrian,Bus Stop':          '#F15C61',
  'Hit Pedestrian,Along Main Road':   '#F47C80',
  'Hit from Back,Along Main Road':    '#F89CA0',
  'Hit Pedestrian,Access Point':      '#D94B50',
  'Hit from Back,Access Point':       '#E86A6E',
  'Hit Pedestrian,T Junction':        '#FBBCBF',
  'Hit fixed object,Along Main Road': '#C13A3F',
  'Hit from Back,Intersection':       '#F5A0A3',
  'Skidding,Along Main Road':         '#A32930',
  'Hit from Side,Access Point':       '#FDD5D6',
};

export const combinationLabels = {
  'Hit Pedestrian,Bus Stop':          'Pedestrian · Bus Stop',
  'Hit Pedestrian,Along Main Road':   'Pedestrian · Main Road',
  'Hit from Back,Along Main Road':    'Hit from Rear · Main Road',
  'Hit Pedestrian,Access Point':      'Pedestrian · Access Point',
  'Hit from Back,Access Point':       'Hit from Rear · Access Point',
  'Hit Pedestrian,T Junction':        'Pedestrian · T Junction',
  'Hit fixed object,Along Main Road': 'Fixed Object · Main Road',
  'Hit from Back,Intersection':       'Hit from Rear · Intersection',
  'Skidding,Along Main Road':         'Skidding · Main Road',
  'Hit from Side,Access Point':       'Hit from Side · Access Point',
};

export function chartCombination(map,
  { title = 'Top 10 Crash Patterns', subtitle = '' } = {}) {
  drawBarChart(map, 'south-crashes', 'Combinations', {
    title,
    subtitle,
    colors: combinationColors,
    labels: combinationLabels,
    topN: 10,
  });
}

//#endregion

//#region Chart: Hit Pedestrian — Context Mapping

export const hitPedContextColors = {
  'Bus Stop':              '#F15C61',
  'Along Main Road':       '#3ec8f0',
  'Access Point':          '#60d8f5',
  'T Junction':            '#0090be',
  'Intersection':          '#006f94',
  'Up/Down Ramps':         '#85e4fa',
  'U Turn':                '#004f6e',
  'Along Service Road':    '#aaeeff',
  'Petrol Pump':           '#00354d',
  'Toll Booth':            '#cdf5ff',
  'Service Road Junction': '#002840',
};

export const hitPedContextLabels = {};

export function chartHitPedContext(map,
  { title = 'Hit Pedestrian — Where?', subtitle = '99 crashes · 2019–2022' } = {}) {
  drawBarChart(map, 'south-crashes', 'Context Mapping', {
    title,
    subtitle,
    colors: hitPedContextColors,
    labels: hitPedContextLabels,
    filter: { attribute: 'Type of Collision', value: 'Hit Pedestrian' },
  });
}

//#endregion

//#region Chart: Hit Pedestrian — Context Mapping

export const timeofdayColors = {
  'Morning Rush Hour (7-12)': '#F5C842',
  'Midday 2 (3-6)':          '#D4A017',
  'Midday 1 (12-3)':          '#B8860B',
  'Evening Rush Hour (6-9)': '#5c5d69',
  'Late Night (9-12)':        '#4A4A5A',
  'Mid Night(12-4)':         '#1C1C2E',
  'Early Morning (4-7)':     '#C8C8C8'
};

export const timeofdayLabels = {};

export function chartTimeOfDay(map,
  { title = 'Time of Crash', subtitle = '' } = {}) {
  drawPieChart(map, 'south-crashes', 'Time of Day', {
    title,
    subtitle,
    colors: timeofdayColors,
    labels: timeofdayLabels,
    filter: { attribute: 'Combinations', value: 'Hit from Back,Along Main Road' },
  });
}

//#endregion

//#region Chart: Hit Pedestrian — Context Mapping

export const accessPointColors = {
  'Hit Pedestrian': '#F15C61'
};

export const accessPointLabels = {};

export function chartaccessPoint(map,
  { title = 'Time of Crash', subtitle = '' } = {}) {
  drawBarChart(map, 'south-crashes', 'Type of Collision Cleaned', {
    title,
    subtitle,
    colors: accessPointColors,
    labels: accessPointLabels,
    filter: { attribute: 'Context Mapping', value: 'Access Point' },
  });
}

//#endregion

//#region Chart: Head On

export const headOnColors = {

};

export const headOnLabels = {};

export function chartheadOn(map,
  { title = 'Where? - Head on Crashes', subtitle = '' } = {}) {
  drawBarChart(map, 'south-crashes', 'Context Mapping', {
    title,
    subtitle,
    colors: headOnColors,
    labels: headOnLabels,
    filter: { attribute: 'Type of Collision Cleaned', value: 'Head On' },
  });
}

//#endregion

//#region Chart: By Lane Intersections — Type of Collision

export const junctionContextColors = {
  'T Junction':            '#f59e0b',
  'Intersection':          '#22d3ee',
  'Service Road Junction': '#a78bfa',
};

export const junctionTypesColors = {};

export const junctionTypesLabels = {};

export function chartJunctionTypes(map,
  { title = 'Type of Collision — By Lane Intersections', subtitle = '' } = {}) {
  drawBarChart(map, 'south-crashes', 'Type of Collision Cleaned', {
    title,
    subtitle,
    colors: junctionTypesColors,
    labels: junctionTypesLabels,
    filter: { attribute: 'Context Mapping', values: ['T Junction', 'Intersection', 'Service Road Junction'] },
    exclude: ['Hit Pedestrian'],
  });
}

//#endregion

export { clearChart };
