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
import { NormalModule } from 'webpack';

// TODO: better regexp to match module entry point, maybe concat module names and create regexp
// look at compilation "module" from loader hook to identify if entry point
// (excluding entries from node_modules)
const moduleRegExp = /\/src\/index\.js$/;
export default class HotHolocronModulePlugin {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('HotHolocronModulePlugin', (compilation) => {
      NormalModule.getCompilationHooks(compilation).loader.tap('HotHolocronModulePlugin', (ctx, module) => {
        const { test = moduleRegExp, rootModuleName, externals } = this.options;
        if (test.test(module.userRequest)) {
          module.loaders.unshift({
            loader: path.join(__dirname, 'hot-holocron-loader.js'),
            options: {
              externals,
              rootModuleName,
              moduleName: module.userRequest.replace('/src/index.js', '').split('/').reverse()[0],
            },
          });
        }
      });
    });
  }
}
