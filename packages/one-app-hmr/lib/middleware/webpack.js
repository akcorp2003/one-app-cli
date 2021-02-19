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
  info, error, warn, time, log, yellow, orange, dodgerblue,
} from '../logs';
import { vfs } from '../utils';

export const printWebpack = (message) => `${dodgerblue('webpack')} - ${message}`;

export function printStatsWhenDone(stats) {
  const { errors, warnings } = stats.compilation;
  errors.forEach((message) => error(message));
  warnings.forEach((message) => warn(message));
  log(printWebpack(`webpack built in ${orange(`${stats.endTime - stats.startTime}`)} ms`));
}

export function printWhenInvalid() {
  warn(printWebpack('webpack building...'));
}

export async function loadWebpackMiddleware({
  context,
  publicPath,
  staticPath,
  modules,
  externals,
  rootModuleName,
  serverAddress,
} = {}) {
  log(printWebpack('initializing webpack'));

  // TODO: only run if externals present
  await time(printWebpack(orange('pre-building dll externals for Holocron modules')), async () => {
    await buildExternalsDLL({ externals });
  });

  const webpackConfig = createHotModuleWebpackConfig({
    context,
    publicPath,
    staticPath,
    modules,
    externals,
    rootModuleName,
  });
  const compiler = webpack(webpackConfig);
  compiler.hooks.done.tap('OneAppHMR', printStatsWhenDone);
  compiler.hooks.invalid.tap('OneAppHMR', printWhenInvalid);
  // removing all logs
  // https://webpack.js.org/configuration/other-options/#infrastructurelogging
  const devMiddleware = webpackDevMiddleware(compiler, {
    stats: false,
    index: false,
    serverSideRender: true,
    writeToDisk: !true,
    outputFileSystem: vfs,
    publicPath: webpackConfig.output.publicPath,
  });
  const hotMiddleware = webpackHotMiddleware(compiler, {
    reload: true,
    log: false,
    dynamicPublicPath: false,
  });

  devMiddleware.waitUntilValid(() => {
    info(`${orange('🔥 HMR server is ready')} - visit "${yellow(serverAddress)}" to start!\n`);
  });

  return {
    devMiddleware,
    hotMiddleware,
    publish: (...args) => hotMiddleware.publish(...args),
  };
}
