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

import {
  DllPlugin, DllReferencePlugin, validate,
} from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import { createDLLConfig } from '../../../lib/webpack/dll';

describe('createDLLConfig', () => {
  test('returns an invalid DLL webpack config by default', () => {
    const config = createDLLConfig();
    expect(() => validate(config)).toThrow();
  });

  test('returns the DLL webpack config of the externals provided', () => {
    const config = createDLLConfig({
      entries: ['react'],
    });
    expect(validate(config)).toBe(undefined);
    expect(config.mode).toEqual('production');
    expect(config.plugins).toEqual([
      new DllPlugin({
        context: process.cwd(),
        path: `${process.cwd()}/static/vendor/.externals.dll.json`,
        name: 'externals',
      }),
      new BundleAnalyzerPlugin({
        openAnalyzer: false,
        generateStatsFile: false,
        logLevel: 'silent',
        analyzerMode: 'static',
        reportFilename: `${process.cwd()}/static/vendor/externals-report.html`,
      }),
    ]);
  });

  test('returns the optimization webpack config for development', () => {
    const config = createDLLConfig({
      isDev: true,
      dllName: 'vendors',
      entries: ['react'],
    });
    expect(validate(config)).toBe(undefined);
    expect(config.mode).toEqual('development');
    expect(config.plugins).toEqual([
      new DllPlugin({
        context: process.cwd(),
        path: `${process.cwd()}/static/vendor/.vendors.dll.json`,
        name: 'vendors',
      }),
      new BundleAnalyzerPlugin({
        openAnalyzer: false,
        generateStatsFile: false,
        logLevel: 'silent',
        analyzerMode: 'static',
        reportFilename: `${process.cwd()}/static/vendor/vendors-report.html`,
      }),
    ]);
  });

  test('returns development config for main externals build', () => {
    const partialConfig = createDLLConfig({
      dllName: 'vendors',
      useAsReference: true,
    });
    expect(partialConfig).toEqual({
      plugins: [
        new DllReferencePlugin({
          context: process.cwd(),
          manifest: `${process.cwd()}/static/vendor/.vendors.dll.json`,
          name: 'vendors',
        }),
      ],
    });
  });
});
