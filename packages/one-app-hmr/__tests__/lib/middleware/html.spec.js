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

import { createHotModuleRenderingMiddleware } from '../../../lib/middleware/html';

describe('createHotModuleRenderingMiddleware', () => {
  test('returns configured middleware handler function', () => {
    const config = {
      moduleMap: {},
      rootModuleName: 'root-module',
      errorReportingUrl: '/error',
    };
    const middleware = createHotModuleRenderingMiddleware(config);
    expect(middleware).toBeInstanceOf(Function);
  });

  test('responds to request for static html', () => {
    const config = {
      moduleMap: {
        modules: {
          'root-module': {
            browser: 'root-module.js',
          },
        },
      },
      rootModuleName: 'root-module',
      errorReportingUrl: '/error',
    };
    const middleware = createHotModuleRenderingMiddleware(config);
    const toJson = jest.fn(() => ({
      assetsByChunkName: {
        'root-module': ['root-module.js'],
      },
    }));
    const res = {
      status: jest.fn(() => res),
      type: jest.fn(() => res),
      send: jest.fn(() => res),
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
    expect(middleware({}, res)).toEqual(undefined);
  });
});
