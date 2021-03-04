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
  test('creates the webpack config for Holocron re-loadable modules', () => {
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
    expect(config.externals).toEqual({
      '@americanexpress/one-app-ducks': { commonjs2: '@americanexpress/one-app-ducks', root: 'OneAppDucks', var: 'OneAppDucks' },
      '@americanexpress/one-app-router': { commonjs2: '@americanexpress/one-app-router', root: 'OneAppRouter', var: 'OneAppRouter' },
      'create-shared-react-context': { commonjs2: 'create-shared-react-context', root: 'CreateSharedReactContext', var: 'CreateSharedReactContext' },
      holocron: { commonjs2: 'holocron', root: 'Holocron', var: 'Holocron' },
      'holocron-module-route': { commonjs2: 'holocron-module-route', root: 'HolocronModuleRoute', var: 'HolocronModuleRoute' },
      immutable: { commonjs2: 'immutable', root: 'Immutable', var: 'Immutable' },
      'prop-types': { commonjs2: 'prop-types', root: 'PropTypes', var: 'PropTypes' },
      react: { commonjs2: 'react', root: 'React', var: 'React' },
      'react-dom': { commonjs2: 'react-dom', root: 'ReactDOM', var: 'ReactDOM' },
      'react-helmet': { commonjs2: 'react-helmet', root: 'ReactHelmet', var: 'ReactHelmet' },
      'react-redux': { commonjs2: 'react-redux', root: 'ReactRedux', var: 'ReactRedux' },
      redux: { commonjs2: 'redux', root: 'Redux', var: 'Redux' },
      reselect: { commonjs2: 'reselect', root: 'Reselect', var: 'Reselect' },
    });
  });
});
