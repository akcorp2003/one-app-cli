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

import {
  getLocalModulesFromStats,
  getExternalsForScripts,
  getStatsFromResponse,
  renderDocument,
} from '../utils';
import { debug, yellow, green } from '../logs';

// eslint-disable-next-line import/prefer-default-export
export function createHotModuleRenderingMiddleware({
  rootModuleName,
  moduleMap,
  errorReportingUrl,
}) {
  // cache html in buffer, instead of re-rendering.
  let html = '';
  const externals = getExternalsForScripts();
  return (req, res) => {
    const stats = getStatsFromResponse(res);
    const modules = getLocalModulesFromStats(stats, {
      rootModuleName,
      moduleMap,
    });

    // TODO: check stats for invalidation and update, html will go stale otherwise
    if (!html) {
      html = Buffer.from(renderDocument({
        rootModuleName,
        modules,
        externals,
        moduleMap,
        errorReportingUrl,
      }));
    }

    debug(yellow(`Rendered HTML with local modules: [${green(modules.map(({ name }) => name).join(', '))}]`));

    res
      .status(200)
      .type('html')
      .send(html);
  };
}
