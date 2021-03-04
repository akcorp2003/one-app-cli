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

import express from 'express';
import chokidar from 'chokidar';
import parrot from 'parrot-middleware';

import {
  debug, log, warn, time, deeppink, orange, yellow, info,
} from '../logs';
import { joinUrlFragments } from '../utils';

export function printParrot(message = '') {
  return `${deeppink('parrot')} - ${message}`;
}

export function loadScenarios(scenarioPaths) {
  scenarioPaths.forEach((scenarioPath) => {
    // TODO: imported/required js from the source scenario are not deleted from require.cache
    // and will not be updated if changed
    delete require.cache[scenarioPath];
  });
  // TODO: safely source scenarios
  // TODO: warn when scenarios are overwritten between other module scenarios
  // eslint-disable-next-line global-require, import/no-dynamic-require
  return scenarioPaths.reduce((map, nextPath) => ({ ...map, ...require(nextPath) }), {});
}

export function getModuleNameFromFilePath(filePath) {
  const [moduleBasePath] = filePath.split('/mock/scenarios.js');
  const [moduleName] = moduleBasePath.split('/').reverse();
  return moduleName;
}

export function createWatcherEventsOnScenariosChange(watcher, { importScenarios, publish }) {
  watcher
    .on('add', (fileName) => {
      const moduleName = getModuleNameFromFilePath(fileName);
      log(printParrot(`Scenarios for ${orange(`"${moduleName}"`)} has been added`));
      importScenarios();
      publish({ action: 'parrot:add', path: fileName, moduleName });
    })
    .on('change', (fileName) => {
      const moduleName = getModuleNameFromFilePath(fileName);
      log(printParrot(`Scenarios for ${orange(`"${moduleName}"`)} has been changed`));
      importScenarios();
      publish({ action: 'parrot:change', path: fileName, moduleName });
    })
    .on('unlink', (fileName) => {
      const moduleName = getModuleNameFromFilePath(fileName);
      log(printParrot(`Scenarios for ${orange(`"${moduleName}"`)} has been removed`));
      importScenarios();
      publish({ action: 'parrot:remove', path: fileName, moduleName });
    });
}

export function createHotParrotMiddleware(scenarios, publish, serverAddress = '/') {
  const parrotRouter = express.Router();

  const importScenarios = () => {
    if (parrotRouter.stack.length > 0) parrotRouter.stack = [];
    const scenarioDefinitions = loadScenarios(scenarios);
    // use parrot middleware with loaded scenarios
    parrotRouter.use(parrot(scenarioDefinitions));
    // print scenarios registered
    info(printParrot(`Scenario routes registered: [\n${Object
      .keys(scenarioDefinitions)
      .map((key) => `\t"${key}" - ${yellow(
        `"${joinUrlFragments(serverAddress, (scenarioDefinitions[key][0] || scenarioDefinitions[key]).request)}"`
      )}`).join(',\n')
    }\n  ]`));
    return scenarioDefinitions;
  };

  const watcher = chokidar.watch(scenarios, { awaitWriteFinish: true })
    .on('error', (error) => warn(printParrot(`Watch error: ${error}`)))
    .on('ready', () => {
      log(printParrot('Watching scenarios'));
      importScenarios();
      createWatcherEventsOnScenariosChange(watcher, { importScenarios, publish });
    });

  return parrotRouter;
}

export async function loadParrotMiddleware(app, {
  scenarios, useParrotMiddleware, publish, serverAddress,
}) {
  debug('"useParrotMiddleware" was set to "%s"', useParrotMiddleware);

  if (useParrotMiddleware && scenarios.length > 0) {
    debug(printParrot('Loading scenarios %o'), scenarios);
    await time(printParrot('Initializing Parrot scenarios'), () => {
      const parrotMiddleware = createHotParrotMiddleware(scenarios, publish, serverAddress);
      app.use(parrotMiddleware);
    });
  } else {
    debug(printParrot('Scenarios were not found'));
  }
}
