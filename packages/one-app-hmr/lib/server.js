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

import { createModuleMap, getPublicUrl, getStaticPath } from './utils';
import {
  loadWebpackMiddleware,
  createHotModuleRenderingMiddleware,
  createModulesProxyRelayMiddleware,
  loadParrotMiddleware,
} from './middleware';
import { loadLanguagePacks } from './locale';
import {
  info, log, debug, magenta, orange, yellow,
} from './logs';

export const acceptedMiddleware = (req, res) => {
  res.status(202);
};

export default async function sandboxServer({
  port = 4000,
  context,
  publicPath,
  staticPath,
  rootModuleName,
  remoteModuleMap: remoteModuleMapUrl,
  modules,
  externals,
  scenarios,
  languagePacks,
  useParrotMiddleware,
  useLanguagePacks,
} = {}) {
  info(orange.bold('Starting One App Sandbox server'));
  log(`Root Holocron module: ${orange.bold(JSON.stringify(rootModuleName))}`);

  const {
    moduleMap,
    localModuleMap,
    remoteModuleMap,
  } = await createModuleMap({ modules, remoteModuleMapUrl });

  debug(moduleMap);

  const proxyRelayMiddleware = createModulesProxyRelayMiddleware({
    moduleMap,
    localModuleMap,
    remoteModuleMap,
  });

  const serverAddress = `http://localhost:${port}/`;
  const {
    publish,
    devMiddleware,
    hotMiddleware,
  } = await loadWebpackMiddleware({
    context,
    publicPath,
    staticPath,
    modules,
    externals,
    rootModuleName,
    serverAddress,
  });

  const renderMiddleware = await createHotModuleRenderingMiddleware({
    rootModuleName,
    moduleMap,
    errorReportingUrl: '/error',
  });

  const app = express();

  app
    .use(proxyRelayMiddleware)
    .use(devMiddleware)
    .use(hotMiddleware)
  // TODO: remove once all files are virtualized (one app statics / externals build)
    .use(getPublicUrl(), express.static(getStaticPath()));

  await loadLanguagePacks(app, { languagePacks, useLanguagePacks, publish });
  await loadParrotMiddleware(app, {
    scenarios, useParrotMiddleware, publish, serverAddress,
  });

  app
  // TODO: remove render in favor of static index.html to be served
    .get('*', renderMiddleware)
    .post('/error', acceptedMiddleware);

  const server = app.listen(port, (error) => {
    if (error) throw error;
    log(`Server is listening to ${yellow(`"${serverAddress}"`)} - ${magenta('Initializing Sandbox')}`);
  });

  return [app, server];
}
