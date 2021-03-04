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
import jsonParse from 'json-parse-context';

import { vol } from './virtual-file-system';
import { getModulesPath } from './paths';

export const copyFileName = 'copy.json';
export const linksFileName = 'integration.json';
export const linksPathName = `links/${linksFileName}`;
export const localePathName = 'locale';

export function extractLanguageDataFromLocale(languageDataPath) {
  const fileStats = fs.statSync(languageDataPath);
  if (fileStats.isDirectory()) {
    const copy = extractLanguageDataFromLocale(`${languageDataPath}/${copyFileName}`);
    const links = extractLanguageDataFromLocale(`${languageDataPath}/${linksPathName}`) || {};
    return {
      ...copy,
      links,
    };
  }
  if (fileStats.isFile()) {
    const json = fs.readFileSync(languageDataPath).toString();
    return jsonParse(json);
  }
  return null;
}

export function loadModuleLanguagePacks({ modulePath, localePath = localePathName }) {
  const languagePacksPath = path.join(modulePath, localePath);
  if (fs.existsSync(languagePacksPath)) {
    return fs.readdirSync(languagePacksPath)
      .map((locale) => [
        locale.replace(/(\..*)$/, '').toLowerCase(),
        extractLanguageDataFromLocale(path.join(languagePacksPath, locale)),
      ]);
  }
  return null;
}

export function addLanguagePacksForModule({ modulePath, moduleName, localePath = localePathName }) {
  const languagePacks = loadModuleLanguagePacks({ modulePath, localePath });
  const locales = languagePacks.reduce((map, [locale, langPack]) => ({
    ...map,
    [[locale, `${moduleName}.json`].join('/')]: JSON.stringify(langPack),
  }), {});
  vol.fromJSON(locales, getModulesPath(moduleName));
  return languagePacks.map(([locale]) => locale);
}

export function addModuleLanguagePack({
  filePath, moduleName, locale,
}) {
  const localeSymbol = locale.replace(/(\..*)$/, '').toLowerCase();
  const langPack = extractLanguageDataFromLocale(filePath);
  const bundlePath = getModulesPath([
    [moduleName, localeSymbol, `${moduleName}.json`].join('/'),
  ]);
  vol.writeFileSync(bundlePath, JSON.stringify(langPack));
}

export function removeModuleLanguagePack({
  moduleName, locale,
}) {
  const localeFilePath = getModulesPath([moduleName, locale.replace(/(\..*)$/, '').toLowerCase(), `${moduleName}.json`].join('/'));
  vol.unlinkSync(localeFilePath);
  vol.rmdirSync(localeFilePath.replace(`/${moduleName}.json`, ''));
}
