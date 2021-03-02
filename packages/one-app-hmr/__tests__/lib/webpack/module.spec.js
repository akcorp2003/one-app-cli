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

import { validate } from 'webpack';
import { createHotModuleWebpackConfig } from '../../../lib/webpack/module';

describe('createHotModuleWebpackConfig', () => {
  test('creates the webpack config for hot reloadable modules', () => {
    const modules = [{
      moduleName: 'hot-module',
      modulePath: 'hot-module/src/index.js',
    }];
    const config = createHotModuleWebpackConfig({
      modules,
    });
    expect(validate(config)).toBe(undefined);
  });

  test('uses DLL config when externals are provided', () => {
    const externals = ['react-package'];
    const config = createHotModuleWebpackConfig({
      externals,
    });
    expect(validate(config)).toBe(undefined);
    expect(config.externals).toEqual([
      '@americanexpress/one-app-ducks',
      '@americanexpress/one-app-router',
      'create-shared-react-context',
      'holocron',
      'holocron-module-route',
      'immutable',
      'prop-types',
      'react',
      'react-dom',
      'react-helmet',
      'react-redux',
      'redux',
      'reselect',
      // ensure provided/required externals are added to the main set of one app externals
      'react-package',
    ]);
  });
});
