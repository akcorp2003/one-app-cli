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
import {
  addLanguagePacksForModule,
  addModuleLanguagePack,
  extractLanguageDataFromLocale,
  loadModuleLanguagePacks, removeModuleLanguagePack,
  vol,

} from '../../../lib/utils';

jest.mock('../../../lib/utils/virtual-file-system', () => ({
  vol: {
    fromJSON: jest.fn(),
    unlinkSync: jest.fn().mockImplementationOnce(() => 'test'),
    rmdirSync: jest.fn(() => 'test'),
  },
}));
jest.mock('../../../lib/utils/paths', () => ({
  getModulesPath: jest.fn(() => '/sample-module'),
}));
jest.mock('path');
jest.mock('fs');

jest.mock('json-parse-context', () => jest.fn().mockImplementationOnce(() => ({ title: 'this is the US market' })));
describe('extract language packs', () => {
  beforeEach(() => {
    fs.readFileSync.mockReturnValue(JSON.stringify({ value: 'test' }));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('extracts language pack from locale', () => {
    jest.spyOn(fs, 'statSync').mockImplementationOnce(() => ({
      isDirectory: () => false,
      isFile: () => true,
    }));
    expect(extractLanguageDataFromLocale('sample-module/locale')).toMatchObject({ title: 'this is the US market' });
  });
  test('returns null if extracting locale is not directory or file', () => {
    jest.spyOn(fs, 'statSync').mockImplementationOnce(() => ({
      isDirectory: () => false,
      isFile: () => false,
    }));
    expect(extractLanguageDataFromLocale('sample-module/locale')).toBeNull();
  });
  test('extracts language pack from locale in a Directory', () => {
    jest.spyOn(fs, 'statSync').mockImplementationOnce(() => ({
      isDirectory: () => true,
      isFile: () => false,
    })).mockImplementationOnce(() => ({
      isDirectory: () => false,
      isFile: () => true,
    })).mockImplementationOnce(() => ({
      isDirectory: () => false,
      isFile: () => true,
    }));

    expect(extractLanguageDataFromLocale('sample-module/locale')).toMatchObject({ links: {} });
  });
  test('return null if language pack doesnt exists', () => {
    expect(loadModuleLanguagePacks('sample-module')).toBeNull();
  });
  test('add LanguagePacks For Module', () => {
    fs.existsSync = jest.fn(() => true);
    fs.readdirSync = jest.fn(() => ['en-US']);
    jest.spyOn(fs, 'statSync').mockImplementationOnce(() => ({
      isDirectory: () => true,
      isFile: () => false,
    })).mockImplementationOnce(() => ({
      isDirectory: () => false,
      isFile: () => true,
    })).mockImplementationOnce(() => ({
      isDirectory: () => false,
      isFile: () => true,
    }));
    expect(addLanguagePacksForModule(
      { modulePath: 'sample-module', moduleName: 'sample-module', localePath: '/locale' }
    )).toMatchObject(['en-us']);
  });
  test('add module language pack', () => {
    jest.spyOn(fs, 'statSync').mockImplementationOnce(() => ({
      isDirectory: () => true,
      isFile: () => false,
    })).mockImplementationOnce(() => ({
      isDirectory: () => false,
      isFile: () => true,
    })).mockImplementationOnce(() => ({
      isDirectory: () => false,
      isFile: () => true,
    }));
    addModuleLanguagePack(
      {
        moduleName: 'sample-module',
        modulePath: '/sample-module',
        locale: 'en-US',
      });
    expect(vol.fromJSON).toHaveBeenCalledTimes(1);
  });
});
describe('remove module Language Pack', () => {
  removeModuleLanguagePack(
    {
      moduleName: 'sample-module',
      locale: 'en-US',
    });
  expect(vol.unlinkSync).toHaveBeenCalledTimes(1);
  expect(vol.rmdirSync).toHaveBeenCalledTimes(1);
});
