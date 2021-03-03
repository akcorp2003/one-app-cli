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

import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import { createHotModuleWebpackConfig, buildExternalsDLL } from '../../../lib/webpack';
import {
  printStatsWhenDone,
  printWhenInvalid,
  loadWebpackMiddleware,
} from '../../../lib/middleware/webpack';
import {
  error, info, log, warn, time,
} from '../../../lib/logs';

jest.mock('webpack');
jest.mock('webpack-dev-middleware');
jest.mock('webpack-hot-middleware');
jest.mock('../../../lib/logs');
jest.mock('../../../lib/utils');
jest.mock('../../../lib/webpack');

const tap = jest.fn();
const publish = jest.fn();
const waitUntilValid = jest.fn();

beforeAll(() => {
  webpackHotMiddleware.mockImplementation(() => ({ publish }));
  webpackDevMiddleware.mockImplementation(() => ({ waitUntilValid }));
  webpack.mockImplementation(() => ({
    hooks: {
      done: {
        tap,
      },
      invalid: {
        tap,
      },
    },
  }));
  createHotModuleWebpackConfig.mockImplementation(() => ({
    output: {
      publicPath: 'publicPath',
    },
  }));
  buildExternalsDLL.mockImplementation(() => Promise.resolve());
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('printStatsWhenDone', () => {
  test('printStatsWhenDone', () => {
    const stats = {
      startTime: 3124235,
      endTime: 3124235,
      compilation: {
        errors: ['error'],
        warnings: ['warning'],
      },
    };
    printStatsWhenDone(stats);
    expect(log).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

describe('printWhenInvalid', () => {
  test('printWhenInvalid', () => {
    printWhenInvalid();
    expect(log).toHaveBeenCalledTimes(1);
  });
});

describe('loadWebpackMiddleware', () => {
  test('returns dev and hot middleware handles along with publish fn', async () => {
    expect(await loadWebpackMiddleware()).toEqual({
      devMiddleware: webpackDevMiddleware(),
      hotMiddleware: webpackHotMiddleware(),
      publish: expect.any(Function),
    });
    expect(tap).toHaveBeenCalledTimes(2);
    expect(waitUntilValid).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledTimes(0);
    expect(log).toHaveBeenCalledTimes(1);
  });

  test('publish fn calls hotMiddleware.publish', async () => {
    const middleware = await loadWebpackMiddleware();
    expect(middleware.publish()).toBe(undefined);
    expect(publish).toHaveBeenCalledTimes(1);
  });

  test('waitUntilValid logs when webpack is ready to serve the bundle', async () => {
    await loadWebpackMiddleware();
    expect(waitUntilValid).toHaveBeenCalledTimes(1);
    expect(waitUntilValid.mock.calls[0][0]()).toBe(undefined);
    expect(info).toHaveBeenCalledTimes(1);
  });

  test('builds externals when they are present', async () => {
    await loadWebpackMiddleware({ externals: ['some-external'] });
    expect(time).toHaveBeenCalledTimes(1);
    expect(await time.mock.calls[0][1]()).toBe(undefined);
    expect(buildExternalsDLL).toHaveBeenCalledTimes(1);
  });
});
