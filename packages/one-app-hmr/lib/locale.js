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

import path from 'path';
import chokidar from 'chokidar';

import {
  debug, log, warn, time, palegreen, orange, green, info,
} from './logs';
import {
  addLanguagePacksForModule,
  addModuleLanguagePack,
  removeModuleLanguagePack,
} from './utils';

export function printLocale(message) {
  return `${palegreen('locale')} - ${message}`;
}

export function printLocaleAction({ locale, moduleName, action }) {
  return log(printLocale(`${orange(`"${locale}"`)} for module ${orange(`"${moduleName}"`)} has been ${action}`));
}

export function getModuleInfoFromLocalePath(filePath) {
  const [modulePath, fileBasePath = ''] = filePath.split('/locale/');
  const [moduleName] = modulePath.split('/').reverse();
  const [languagePack] = fileBasePath.split('/');
  const locale = languagePack.toLowerCase().replace('.json', '');
  return [moduleName, modulePath, languagePack, locale];
}

export function loadLanguagePacksForModule(modulePath) {
  const [moduleName] = modulePath.split('/').reverse();
  const langPacksLoaded = addLanguagePacksForModule({ modulePath, moduleName });
  info(printLocale(`Loaded language packs for ${orange(`"${moduleName}"`)}: [ ${langPacksLoaded.map((langPack) => green(langPack)).join(', ')} ]`));
  return [moduleName, langPacksLoaded];
}

export function watchLanguagePackFileEvents(watcher, publish) {
  watcher
    .on('add', (filePath) => {
      const [moduleName, modulePath, locale] = getModuleInfoFromLocalePath(filePath);
      printLocaleAction({ locale, moduleName, action: 'added' });
      addModuleLanguagePack({
        filePath, moduleName, modulePath, locale,
      });
      publish({
        action: 'locale:add', path: filePath, moduleName, locale,
      });
    })
    .on('change', (filePath) => {
      const [moduleName, modulePath, locale] = getModuleInfoFromLocalePath(filePath);
      printLocaleAction({ locale, moduleName, action: 'changed' });
      addModuleLanguagePack({
        filePath, moduleName, modulePath, locale,
      });
      publish({
        action: 'locale:change', path: filePath, moduleName, locale,
      });
    })
    .on('unlink', (filePath) => {
      const [moduleName, modulePath, locale] = getModuleInfoFromLocalePath(filePath);
      printLocaleAction({ locale, moduleName, action: 'removed' });
      removeModuleLanguagePack({
        filePath, moduleName, modulePath, locale,
      });
      publish({
        action: 'locale:remove', path: filePath, moduleName, locale,
      });
    });
}

export function createHotLanguagePacks(modulePaths, publish) {
  const watcherOptions = { awaitWriteFinish: true };
  const watcherPaths = modulePaths.map((modulePath) => path.join(modulePath, 'locale'));
  const watcher = chokidar.watch(watcherPaths, watcherOptions);

  const moduleNames = modulePaths.map(loadLanguagePacksForModule).map(([moduleName]) => moduleName);

  watcher
    .on('error', (error) => warn(printLocale(`Language pack watcher error: ${error}`)))
    .on('ready', () => {
      log(printLocale(`Watching language packs for modules: [ ${moduleNames.map((name) => orange(JSON.stringify(name))).join(', ')} ]`));
      watchLanguagePackFileEvents(watcher, publish);
    });

  return watcher;
}

export async function loadLanguagePacks(app, { languagePacks, useLanguagePacks, publish }) {
  debug(printLocale('"useLanguagePacks" was set to "%s"'), useLanguagePacks);

  if (useLanguagePacks && languagePacks.length > 0) {
    debug(printLocale('Loading language packs %o'), languagePacks);
    await time(printLocale('Language pack setup time'), () => {
      createHotLanguagePacks(languagePacks, publish);
    });
  } else {
    debug(printLocale('Locale folders were not found'));
  }
}
