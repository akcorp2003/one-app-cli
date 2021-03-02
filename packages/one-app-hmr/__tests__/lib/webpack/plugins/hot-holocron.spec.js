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

import { NormalModule } from 'webpack';

import HotHolocronModulePlugin from '../../../../lib/webpack/plugins/hot-holocron';

jest.mock('webpack', () => ({
  NormalModule: {
    getCompilationHooks: jest.fn(() => ({
      loader: {
        tap: jest.fn(),
      },
    })),
  },
}));

describe('HotHolocronModulePlugin', () => {
  test('instantiates without error', () => {
    expect(() => new HotHolocronModulePlugin()).not.toThrow();
  });

  test('plugin is applied to compilation and taps into loader webpack hook', () => {
    const instance = new HotHolocronModulePlugin();
    const tap = jest.fn();
    const compiler = {
      hooks: {
        compilation: {
          tap,
        },
      },
    };
    expect(instance.apply(compiler)).toBe(undefined);
    const [[, hookHandle]] = tap.mock.calls;
    const compilation = {};
    expect(() => hookHandle(compilation)).not.toThrow();
    expect(NormalModule.getCompilationHooks).toHaveBeenCalledWith(compilation);
  });

  test('plugin loader hook registers a loader before other loaders', () => {
    const options = {
      rootModuleName: 'root-module',
      externals: ['supplied-external'],
    };
    const module = {
      userRequest: 'hot-module/src/index.js',
      loaders: [
        {
          loader: 'random-loader',
        },
      ],
    };
    module.loaders.unshift = jest.fn();
    const instance = new HotHolocronModulePlugin(options);
    expect(instance.loaderHook(null, module)).toBe(undefined);
    expect(module.loaders.unshift).toHaveBeenCalledTimes(1);
  });

  test('plugin loader is not added if not an expected entry', () => {
    const options = {
      rootModuleName: 'root-module',
      externals: ['supplied-external'],
    };
    const module = {
      userRequest: 'hot-module/src/another-file.js',
      loaders: [
        {
          loader: 'random-loader',
        },
      ],
    };
    module.loaders.unshift = jest.fn();
    const instance = new HotHolocronModulePlugin(options);
    expect(instance.loaderHook(null, module)).toBe(undefined);
    expect(module.loaders.unshift).not.toHaveBeenCalled();
  });
});
