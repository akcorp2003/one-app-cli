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

import webpack from 'webpack';
import merge from 'webpack-merge';

import {
  isDevelopment,
  getContextPath,
  getStaticPath,
} from '../utils';
import { createOneAppExternals, createMinifyConfig } from './utility';
import { jsxLoader } from './loaders';

// eslint-disable-next-line import/prefer-default-export
export function createDLLConfig({
  isDev = isDevelopment(),
  useAsReference = false,
  dllName = 'externals',
  manifestPathName = getStaticPath(`.${dllName}.dll.json`),
  entries = createOneAppExternals(),
  externals = [],
} = {}) {
  return {
    ...useAsReference
      ? {}
      : merge(
        createMinifyConfig({ isDev }),
        {
          mode: isDev ? 'development' : 'production',
          entry: { [dllName]: entries },
          externals,
          output: {
            path: getStaticPath(),
            filename: 'vendor/[name].js',
            library: dllName,
          },
          module: {
            rules: [jsxLoader()],
          },
        }
      ),
    plugins: useAsReference
      ? [
        new webpack.DllReferencePlugin({
          context: getContextPath(),
          name: dllName,
          manifest: manifestPathName,
        }),
      ]
      : [
        new webpack.DllPlugin({
          context: getContextPath(),
          name: dllName,
          path: manifestPathName,
        }),
      ],
  };
}
