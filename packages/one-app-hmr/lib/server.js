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
  info, warn, yellow, orange,
} from './logs';

export const acceptedMiddleware = (req, res) => {
  res.status(202);
};

export default async function hmrServer({
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
  info('Starting HMR server');
  info(`Root Holocron module: ${orange(rootModuleName)}`);
  info(`Holocron modules loaded: ${modules.map(({ moduleName }) => orange(`"${moduleName}"`)).join(', ')}\n`);

  const {
    moduleMap,
    localModuleMap,
    remoteModuleMap,
  } = await createModuleMap({ modules, remoteModuleMapUrl });

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

  const app = express();

  app
    .use(createModulesProxyRelayMiddleware({ moduleMap, localModuleMap, remoteModuleMap }))
    .use(devMiddleware)
    .use(hotMiddleware)
    .use(getPublicUrl(), express.static(getStaticPath()));

  await loadLanguagePacks(app, { languagePacks, useLanguagePacks, publish });
  await loadParrotMiddleware(app, { scenarios, useParrotMiddleware, publish });

  const renderMiddleware = await createHotModuleRenderingMiddleware({
    rootModuleName,
    moduleMap,
    errorReportingUrl: '/error',
  });

  app
    .get('*', renderMiddleware)
    .post('/error', acceptedMiddleware);

  return [app, app.listen(port, (error) => {
    if (error) throw error;
    info(`server is up on "${serverAddress}" - ${yellow('initializing HMR')}\n`);

    process.on('exit', () => {
      warn('server shutting down\n');
    });
  })];
}
