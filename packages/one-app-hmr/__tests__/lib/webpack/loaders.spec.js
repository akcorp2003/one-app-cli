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
  fileLoader,
  cssLoader,
  jsxLoader,
} from '../../../lib/webpack/loaders';

jest.mock('path', () => ({
  resolve: jest.fn(() => '/'),
}));

describe('fileLoader', () => {
  test('returns loader config for file types', () => {
    expect(fileLoader()).toMatchSnapshot();
  });
});

describe('cssLoader', () => {
  test('returns loader config for CSS files', () => {
    expect(cssLoader()).toMatchSnapshot();
  });
});

describe('jsxLoader', () => {
  test('returns loader config for JavaScript files', () => {
    expect(jsxLoader()).toEqual({
      exclude: /node_modules/,
      test: /\.jsx?$/,
      use: [
        {
          loader: require.resolve('babel-loader'),
          options: {
            babelrc: false,
            cacheDirectory: true,
            cwd: '/',
            plugins: [],
            presets: [
              [
                'amex',
                {
                  modern: true,
                  'preset-env': {
                    modules: false,
                  },
                },
              ],
            ],
          },
        },
      ],
    });
  });
});
