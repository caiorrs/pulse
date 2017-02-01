import { storage } from 'sdk/simple-storage';
import { getMostRecentBrowserWindow } from 'sdk/window/utils';
import Logger from '../lib/log';

import AdBlocker from './ad-blocker';
import Addons from './addons';
import Channel from './channel';
import Hostname from './hostname';
import OpenTabs from './open-tabs';
import OpenWindows from './open-windows';
import Platform from './platform';
import Protocol from './protocol';
import TelemetryId from './telemetry-id';
import Version from './version';

const MEASUREMENTS = [
  AdBlocker,
  Addons,
  Channel,
  Hostname,
  OpenTabs,
  OpenWindows,
  Platform,
  Protocol,
  TelemetryId,
  Version
];
const logger = new Logger(
  'sdk.measurements',
  getMostRecentBrowserWindow().console
);

// Passed the output from the survey, augments that data with each measurment
// in MEASUREMENTS and returns a promise resolving to a Map containing the full
// payload, ready for submission to telemetry.
export default data => {
  const survey = new Map(Object.entries(data));
  logger.log(`Collecting data for ${survey.get('id')}`);
  const tab = storage.id[survey.get('id')];
  survey.delete('id');
  return new Promise((resolve, reject) => {
    Promise
      .all(MEASUREMENTS.map(Measure => new Measure(tab, survey).getValue()))
      .then(data => resolve(new Map([ ...survey, ...data ])))
      .catch(err => reject(err));
  });
};
