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
import { createTimeoutFetch } from '@americanexpress/fetch-enhancers';

import { combineUrlFragments, getPublicModulesUrl } from './paths';
import {
  debug, error, log, orange, red, magenta,
} from '../logs';

export function printModuleMap(message) {
  return `${red('module-map')} - ${message}`;
}

export const fetcher = createTimeoutFetch(6e3)(fetch);

export async function loadRemoteModuleMap(remoteModuleMapUrl) {
  if (typeof remoteModuleMapUrl === 'string') {
    try {
      const response = await fetcher(remoteModuleMapUrl);
      if (response.ok) {
        return response.json();
      }
      error(printModuleMap('fetching the remote module map has failed'));
    } catch (e) {
      error(printModuleMap(e));
    }
  }

  return {
    modules: {},
  };
}

export function createLocalModuleMap(modules = [], addBundleType) {
  return {
    modules: modules.reduce(
      (map, { moduleName }) => {
        const baseUrl = getPublicModulesUrl(moduleName);
        return {
          ...map,
          [moduleName]: {
            baseUrl: `${baseUrl}/`,
            browser: {
              url: combineUrlFragments(baseUrl, `${
                addBundleType ? [moduleName, addBundleType].join('.') : moduleName
              }.js`),
            },
          },
        };
      },
      {}
    ),
  };
}

export function createUnifiedModuleMap({ localModuleMap, remoteModuleMap }) {
  const localModuleKeys = Object.keys(localModuleMap.modules);
  const remoteModules = Object.keys(remoteModuleMap.modules)
    .filter((moduleName) => !localModuleKeys.includes(moduleName))
    .map((moduleName) => ({ moduleName }));
  const localizedRemoteModuleMap = createLocalModuleMap(remoteModules, 'browser');
  return {
    modules: {
      ...localizedRemoteModuleMap.modules,
      ...localModuleMap.modules,
    },
  };
}

export async function createModuleMap({ modules, remoteModuleMapUrl }) {
  const remoteModuleMap = await loadRemoteModuleMap(remoteModuleMapUrl);
  const localModuleMap = createLocalModuleMap(modules);
  const moduleMap = createUnifiedModuleMap({ localModuleMap, remoteModuleMap });

  const localModuleNames = modules.map(({ moduleName }) => moduleName);
  log(
    printModuleMap(
      `Local Holocron modules loaded: [ ${modules.map(({ moduleName }) => orange(`"${moduleName}"`)).join(', ')} ]`
    )
  );
  log(
    printModuleMap(
      `Remote Holocron modules in module map: [ ${Object.keys(remoteModuleMap.modules)
        .map((moduleName) => (localModuleNames.includes(moduleName)
          ? magenta(`"${moduleName}"`)
          : orange(`"${moduleName}"`))
        ).join(', ')} ]`
    )
  );

  debug(moduleMap);

  return {
    remoteModuleMap,
    localModuleMap,
    moduleMap,
  };
}
