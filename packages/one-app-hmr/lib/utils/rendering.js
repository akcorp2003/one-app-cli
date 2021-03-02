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

import fs from 'fs';
import path from 'path';
import { fromJS } from 'immutable';
import transit from 'transit-immutable-js';
import React from 'react';
import ReactDOM from 'react-dom/server';
import importJsx from 'import-jsx';

import { getVendorsPath, getPublicModulesUrl, getPublicExternalsUrl } from './paths';
import { error } from '../logs';

export function renderDocument(props) {
  const { default: Document } = importJsx(path.resolve(__dirname, '../components/Document.jsx'));

  return '<!DOCTYPE html>'.concat(
    ReactDOM.renderToStaticMarkup(React.createElement(Document, props))
  );
}

export function createInitialState({
  rootModuleName,
  errorReportingUrl,
  lang,
}) {
  return transit.toJSON(
    fromJS({
      config: {
        cdnUrl: getPublicModulesUrl(),
        rootModuleName,
        reportingUrl: errorReportingUrl,
      },
      intl: {
        activeLocale: lang,
      },
    })
  );
}

export function getRootModuleScriptUrl(config) {
  const { rootModuleName } = config;
  return getPublicModulesUrl(`${rootModuleName}/${rootModuleName}.js`);
}

export function getExternalsForScripts() {
  const vendorsPath = getVendorsPath();
  return (
    fs.existsSync(vendorsPath)
      ? fs.readdirSync(vendorsPath)
      : []
  )
    .filter((pathname) => pathname.endsWith('.js'))
    .map((filename) => ({
      src: getPublicExternalsUrl(filename),
    }));
}

export function getStatsFromResponse(res) {
  // webpack-dev-middleware 4.x.x
  const { devMiddleware } = res.locals.webpack;
  return devMiddleware.stats.toJson();
}

export function getLocalModulesFromStats(stats, {
  rootModuleName,
  moduleMap,
} = {}) {
  const modules = Object.keys(stats.assetsByChunkName)
    .map((name) => {
      const jsFile = stats.assetsByChunkName[name].find((pathName) => pathName === `${name}/${name}.js`);
      return {
        name,
        src: jsFile && getPublicModulesUrl(jsFile),
      };
    })
    .filter(({ src, css }) => !!src || !!css);

  if (!modules.find(({ name }) => name.includes(rootModuleName))) {
    const rootModule = moduleMap.modules[rootModuleName];

    if (!rootModule) {
      error('Root Module not found');
    } else {
      modules.unshift({
        name: rootModuleName,
        src: rootModule.browser.url,
      });
    }
  }

  modules.sort((a) => {
    if (a.name === 'runtime') {
      return -10;
    }
    if (a.name === rootModuleName) {
      return -1;
    }
    return 0;
  });

  return modules;
}
