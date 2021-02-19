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
import { combineUrlFragments, getPublicModulesUrl } from './paths';
import { error } from '../logs';

export async function loadRemoteModuleMap(remoteModuleMapUrl) {
  if (typeof remoteModuleMapUrl === 'string') {
    const response = await fetch(remoteModuleMapUrl);
    if (response.ok) {
      return response.json();
    }
    error('fetching the remote module map has failed');
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
  return {
    remoteModuleMap,
    localModuleMap,
    moduleMap,
  };
}
