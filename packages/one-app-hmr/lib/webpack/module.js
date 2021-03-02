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

import path from 'path';
import webpack from 'webpack';
import merge from 'webpack-merge';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';

import HotHolocronModulePlugin from './plugins/hot-holocron';

import {
  createOneAppExternals,
  createHotModuleEntries,
} from './utility';
import {
  jsxLoader,
  cssLoader,
  fileLoader,
} from './loaders';
import { createDLLConfig } from './dll';
import { getContextPath, getModulesPath, getPublicModulesUrl } from '../utils';
import { libraryVarName } from '../constants';

// eslint-disable-next-line import/prefer-default-export
export function createHotModuleWebpackConfig({
  context = getContextPath(),
  publicPath = getPublicModulesUrl(),
  staticPath = getModulesPath(),
  modules = [],
  externals = [],
  rootModuleName,
}) {
  return merge(
    externals.length > 0 ? createDLLConfig({
      externals: createOneAppExternals(externals),
      useAsReference: true,
    }) : {},
    {
      entry: createHotModuleEntries(modules),
      externals: Object.keys(createOneAppExternals(externals)),
      target: 'web',
      mode: 'development',
      devtool: 'source-map',
      context,
      output: {
        publicPath,
        path: staticPath,
        filename: '[name]/[name].js',
        hotUpdateChunkFilename: '[name]/[id].[fullhash].hot-update.js',
        uniqueName: libraryVarName,
      },
      module: {
        rules: [
          jsxLoader({ plugins: [require.resolve('react-refresh/babel')] }),
          cssLoader(),
          fileLoader(),
        ],
      },
      optimization: {
        runtimeChunk: 'single',
      },
      resolve: {
        mainFields: ['module', 'browser', 'main'],
        modules: [
          'node_modules',
          path.relative(context, path.resolve(__dirname, '..', '..', 'node_modules')),
        ].concat(modules.map(({ modulePath }) => path.join(modulePath, 'node_modules'))),
        extensions: ['.js', '.jsx'],
      },
      resolveLoader: {
        modules: [
          'node_modules',
          path.relative(context, path.resolve(__dirname, '..', '..', 'node_modules')),
        ].concat(modules.map(({ modulePath }) => path.join(modulePath, 'node_modules'))),
      },
      plugins: [
        new webpack.EnvironmentPlugin({
          // TODO: include environment variables being passed in from config
          NODE_ENV: 'development',
        }),
        new webpack.DefinePlugin({
          'global.BROWSER': JSON.stringify(true),
        }),
        new webpack.HotModuleReplacementPlugin(),
        // source injection
        new HotHolocronModulePlugin({
          rootModuleName,
          modules,
          externals,
        }),
        new ReactRefreshWebpackPlugin({
          library: libraryVarName,
          overlay: {
            sockIntegration: 'whm',
          },
        }),
      ],
    }
  );
}
