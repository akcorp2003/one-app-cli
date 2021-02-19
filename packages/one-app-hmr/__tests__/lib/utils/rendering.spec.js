/*
 * Copyright 2021 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations
 * under the License.
 */

import fs from 'fs';
import { fromJS } from 'immutable';
import transit from 'transit-immutable-js';

import {
  renderDocument,
  createInitialState,
  getLocalModulesFromStats,
  getExternalsForScripts,
  getStatsFromResponse,
} from '../../../lib/utils/rendering';
import { getPublicExternalsUrl } from '../../../lib/utils/paths';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
}));
jest.mock('transit-immutable-js', () => ({
  toJSON: jest.fn((obj) => obj),
}));

describe('renderDocument', () => {
  test('renders static html from the props passed', () => {
    const rootModuleName = 'root-module';
    const props = {
      moduleMap: {
        modules: {
          [rootModuleName]: {
            browser: 'root-module.js',
          },
        },
      },
      rootModuleName,
      errorReportingUrl: '/error',
    };
    const document = renderDocument(props);
    expect(document).toMatchSnapshot();
  });
});

describe('createInitialState', () => {
  test('creates the initial state for One App client side', () => {
    const lang = 'en-US';
    const rootModuleName = 'root-module';
    const errorReportingUrl = '/';
    const initialState = createInitialState({
      rootModuleName,
      errorReportingUrl,
      lang,
    });
    expect(initialState).toEqual(fromJS({
      config: {
        cdnUrl: '/static/modules/',
        rootModuleName,
        reportingUrl: errorReportingUrl,
      },
      intl: {
        activeLocale: lang,
      },
    }));
    expect(transit.toJSON).toHaveBeenCalledTimes(1);
  });
});

describe('getExternalsForScripts', () => {
  test('searches for externals and returns', () => {
    const vendorsSrc = 'vendors.js';
    fs.existsSync.mockImplementationOnce(() => true);
    fs.readdirSync.mockImplementationOnce(() => [vendorsSrc]);
    const externals = getExternalsForScripts();
    expect(externals).toEqual([{
      src: getPublicExternalsUrl(vendorsSrc),
    }]);
  });
});

describe('getStatsFromResponse', () => {
  test('gets the stats from the res.locals.webpack for the current stats', () => {
    const currentStats = {};
    const toJson = jest.fn(() => currentStats);
    const res = {
      locals: {
        webpack: {
          devMiddleware: {
            stats: {
              toJson,
            },
          },
        },
      },
    };
    const stats = getStatsFromResponse(res);
    expect(stats).toEqual(currentStats);
    expect(toJson).toHaveBeenCalledTimes(1);
  });
});

describe('getLocalModulesFromStats', () => {
  test('generates modules to be rendered as script tags', () => {
    const stats = {
      assetsByChunkName: {
        'root-module': ['root-module.js'],
      },
    };
    const rootModuleName = 'root-module';
    const srcUrl = '/url-to-module';
    const moduleMap = {
      modules: {
        [rootModuleName]: {
          browser: {
            url: srcUrl,
          },
        },
      },
    };
    const modules = getLocalModulesFromStats(stats, {
      moduleMap,
      rootModuleName,
    });
    expect(modules).toEqual([{
      name: rootModuleName,
      src: srcUrl,
    }]);
  });
});
