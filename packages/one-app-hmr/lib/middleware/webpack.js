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

import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import { createHotModuleWebpackConfig, buildExternalsDLL } from '../webpack';
import {
  info, error, warn, time, log, yellow, orange, green, magenta,
} from '../logs';
import {
  getContextPath,
  getModulesPath,
  getPublicModulesUrl,
  getPublicUrl,
  getPublicVendorsUrl,
  joinUrlFragments,
  vfs,
} from '../utils';

export const printWebpack = (message) => `${magenta('webpack')} - ${message}`;

export function printStatsWhenDone(stats) {
  const { errors, warnings } = stats.compilation;
  errors.forEach((message) => error(message));
  warnings.forEach((message) => warn(message));
  log(printWebpack(`webpack built in ${orange(`${stats.endTime - stats.startTime}`)} ms`));
}

export function printWhenInvalid() {
  log(printWebpack(orange('webpack building...')));
}

export async function loadWebpackMiddleware({
  context = getContextPath(),
  staticPath = getModulesPath(),
  publicPath = getPublicModulesUrl(),
  modules = [],
  externals = [],
  rootModuleName = '',
  serverAddress = '',
} = {}) {
  log(printWebpack('initializing webpack'));

  if (externals.length > 0) {
    await time(printWebpack(`Building DLL bundle for local externals: [ ${externals.map((external) => green(external)).join(', ')} ] `), async () => {
      await buildExternalsDLL({ externals });
    });

    const externalsReportUrl = joinUrlFragments(serverAddress, getPublicVendorsUrl('externals-report.html'));
    log(
      printWebpack(
        `Bundle Analyzer for DLL externals can be found at ${yellow.bold(`"${externalsReportUrl}"`)}`
      )
    );
  }

  const webpackConfig = createHotModuleWebpackConfig({
    context,
    publicPath,
    staticPath,
    modules,
    externals,
    rootModuleName,
  });
  const compiler = webpack(webpackConfig);
  // compiler.outputFileSystem = vfs;
  compiler.hooks.done.tap('OneAppHMR', printStatsWhenDone);
  compiler.hooks.invalid.tap('OneAppHMR', printWhenInvalid);
  // removing all logs
  // https://webpack.js.org/configuration/other-options/#infrastructurelogging
  const devMiddleware = webpackDevMiddleware(compiler, {
    stats: false,
    index: false,
    serverSideRender: true,
    writeToDisk: true,
    outputFileSystem: vfs,
    publicPath: webpackConfig.output.publicPath,
  });
  const hotMiddleware = webpackHotMiddleware(compiler, {
    log: false,
    dynamicPublicPath: false,
  });

  devMiddleware.waitUntilValid(() => {
    info(printWebpack(`${orange('🔥 Holocron module reload is ready')} - visit ${yellow.bold(`"${serverAddress}"`)} to start!\n`));
    const analyzerHtml = joinUrlFragments(serverAddress, getPublicUrl('sandbox-report.html'));
    log(printWebpack(orange('Bundle Analyzer for loaded Holocron modules is available at %s')), yellow.bold(`"${analyzerHtml}"`));
  });

  return {
    devMiddleware,
    hotMiddleware,
    publish: (...args) => hotMiddleware.publish(...args),
  };
}
