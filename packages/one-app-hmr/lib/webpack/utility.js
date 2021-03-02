/*
 * Copyright 2020 American Express Travel Related Services Company, Inc.
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

import TerserPlugin from 'terser-webpack-plugin';

import { isDevelopment } from '../utils';

// eslint-disable-next-line camelcase, import/prefer-default-export
export function createMinifyConfig({ isDev = isDevelopment(), keep_fnames = true } = {}) {
  return {
    devtool: isDev && 'eval-cheap-source-map',
    optimization: {
      minimize: !isDev,
      minimizer: [
        new TerserPlugin({
          test: /\.jsx?$/i,
          terserOptions: {
            keep_fnames,
          },
        }),
      ],
    },
  };
}

export function createExternalEntry([packageName, varName]) {
  return {
    [packageName]: {
      commonjs2: packageName,
      ...varName ? {
        var: varName,
        root: varName,
      } : {},
    },
  };
}

export function createOneAppExternals(providedExternals = []) {
  return [
    ['@americanexpress/one-app-ducks', 'OneAppDucks'],
    ['@americanexpress/one-app-router', 'OneAppRouter'],
    ['create-shared-react-context', 'CreateSharedReactContext'],
    ['holocron', 'Holocron'],
    ['holocron-module-route', 'HolocronModuleRoute'],
    ['immutable', 'Immutable'],
    ['prop-types', 'PropTypes'],
    ['react', 'React'],
    ['react-dom', 'ReactDOM'],
    ['react-helmet', 'ReactHelmet'],
    ['react-redux', 'ReactRedux'],
    ['redux', 'Redux'],
    ['reselect', 'Reselect'],
    ...providedExternals.map((external) => (Array.isArray(external) ? external : [external])),
  ]
    .map(createExternalEntry)
    .reduce((map, next) => ({ ...map, ...next }), {});
}

export function createHotModuleEntry({ moduleName, modulePath }) {
  return {
    [moduleName]: [
      require.resolve('webpack-hot-middleware/client'),
      require.resolve('react-refresh/runtime'),
      `${modulePath}/src/index.js`,
    ],
  };
}

export function createHotModuleEntries(modules = []) {
  return modules
    .map(createHotModuleEntry)
    .reduce((map, next) => ({ ...map, ...next }), {});
}
