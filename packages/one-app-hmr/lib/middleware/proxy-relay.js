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

import fetch from 'cross-fetch';
import ProxyAgent from 'proxy-agent';

import { getContextPath, vol } from '../utils';

// eslint-disable-next-line import/prefer-default-export
export function createModulesProxyRelayMiddleware({ moduleMap, localModuleMap, remoteModuleMap }) {
  const moduleMapDictionary = Object.keys(remoteModuleMap.modules)
    .filter((moduleName) => !localModuleMap.modules[moduleName])
    .map((moduleName) => [
      moduleMap.modules[moduleName].baseUrl,
      remoteModuleMap.modules[moduleName].baseUrl
      || remoteModuleMap.modules[moduleName].browser.url.replace(`${moduleName}.browser.js`, ''),
    ]);

  return async function proxyRelayMiddleware(req, res, next) {
    const localFilePath = getContextPath(req.path);
    const remoteModuleMatch = moduleMapDictionary
      .find(([localBasePath]) => req.path.startsWith(localBasePath));

    if (remoteModuleMatch && !vol.existsSync(localFilePath)) {
      const [localBasePath, remoteBasePath] = remoteModuleMatch;
      const remoteUrl = req.path.replace(localBasePath, remoteBasePath);
      const response = await fetch(remoteUrl, {
        headers: { connection: 'keep-alive' },
        agent: new ProxyAgent(),
      });
      const text = await response.text();
      vol.fromJSON({
        [localFilePath]: text,
      });
    }

    // once added to the virtual file system, webpack dev middleware will handle the request
    return next();
  };
}
