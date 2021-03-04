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

import { orange } from '../../lib/logs';
import sandboxServer from '../../lib/server';

jest.mock('../../lib/logs');
jest.mock('../../lib/utils/module-map', () => ({
  createModuleMap: async () => ({
    moduleMap: 'module-map.json',
    localModuleMap: '../sample-module/module-map.json',
    remoteModuleMap: 'https://one-app-statics.surge.sh/module-map.json',
  }),
}));
jest.mock('../../lib/middleware', () => ({
  loadWebpackMiddleware() {
    return {
      publish: jest.fn(),
      devMiddleware: {
        waitUntilValid: jest.fn(),
      },
      hotMiddleware: jest.fn(),
    };
  },
  createModulesProxyRelayMiddleware: jest.fn(),
  loadParrotMiddleware: jest.fn(),
  createHotModuleRenderingMiddleware: jest.fn(),
}));
jest.mock('../../lib/webpack');

jest.mock('express', () => {
  const mockedExpress = () => ({
    get: jest.fn(() => ({
      post: jest.fn(),
    })),
    use: jest.fn(() => ({
      use: jest.fn(() => ({
        use: jest.fn(() => ({
          use: jest.fn(),
        })),
      })),
    })),
    listen: jest.fn((listenArgs, callback) => {
      Promise.resolve().then(callback);
    }),
    static: jest.fn(),
  });
  Object.defineProperty(mockedExpress, 'static', { value: jest.fn() });
  return mockedExpress;
});

beforeAll(() => {
  orange.bold = jest.fn();
  jest.spyOn(console, 'info');
});

afterEach(() => {
  console.info.mockClear();
});

describe('sandboxServer', () => {
  const config = {
    port: 4000,
    context: jest.fn(),
    publicPath: '/publicPath/',
    staticPath: '/staticPath/',
    rootModuleName: 'root-module',
    remoteModuleMap: 'https://one-app-statics.surge.sh/module-map.json',
    modules: ['root-module', 'child-module'],
    externals: [],
    scenarios: [],
    languagePacks: [],
    useParrotMiddleware: true,
    useLanguagePacks: true,
  };
  it('hmr server starts up', async () => {
    const server = await sandboxServer(config);
    expect(server[0].listen).toHaveBeenCalled();
  });
});
