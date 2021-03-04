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

import path from 'path';

import {
  STATIC_DIR,
  MODULES_DIR,
  EXTERNAL_DIR,
  ONE_APP_DIR,
  TEMP_DIR,
  getContextPath,
  getStaticPath,
  getModulesPath,
  getOneAppPath,
  getVendorsPath,
  getTempPath,
  combineUrlFragments,
  joinUrlFragments,
  getPublicUrl,
  getPublicModulesUrl,
  getPublicAppUrl,
  getPublicVendorsUrl,
} from '../../../lib/utils/paths';

const cwd = process.cwd();

describe('getContextPath', () => {
  test('gets context path', () => {
    expect(getContextPath()).toEqual(cwd);
  });
});

describe('getStaticPath', () => {
  test('gets static path', () => {
    expect(getStaticPath()).toEqual(path.join(cwd, STATIC_DIR));
  });
});

describe('getModulesPath', () => {
  test('gets modules path', () => {
    expect(getModulesPath()).toEqual(path.join(getStaticPath(), MODULES_DIR));
  });
});

describe('getOneAppPath', () => {
  test('gets One App path', () => {
    expect(getOneAppPath()).toEqual(path.join(getStaticPath(), ONE_APP_DIR));
  });
});

describe('getVendorsPath', () => {
  test('gets vendors path', () => {
    expect(getVendorsPath()).toEqual(path.join(getStaticPath(), EXTERNAL_DIR));
  });
});

describe('getTempPath', () => {
  test('gets temp path', () => {
    expect(getTempPath()).toEqual(path.join(getStaticPath(), TEMP_DIR));
  });
});

describe('combineUrlFragments', () => {
  test('gets public url for bundle', () => {
    expect(combineUrlFragments('static')).toEqual('static');
  });
});

describe('joinUrlFragments', () => {
  test('gets public url for bundle', () => {
    expect(joinUrlFragments('/static', '/app')).toEqual('static/app');
  });
});

describe('getPublicUrl', () => {
  test('gets public url for bundle', () => {
    expect(getPublicUrl()).toEqual(`/${combineUrlFragments(STATIC_DIR)}`);
  });
});

describe('getPublicModulesUrl', () => {
  test('gets public url for modules bundle', () => {
    expect(getPublicModulesUrl()).toEqual(`/${combineUrlFragments(STATIC_DIR, MODULES_DIR, [])}`);
  });
});

describe('getPublicAppUrl', () => {
  test('gets public url for One App bundle', () => {
    expect(getPublicAppUrl()).toEqual(`/${combineUrlFragments(STATIC_DIR, ONE_APP_DIR, [])}`);
  });
});

describe('getPublicVendorsUrl', () => {
  test('gets public url for vendors bundle', () => {
    expect(getPublicVendorsUrl()).toEqual(`/${combineUrlFragments(STATIC_DIR, EXTERNAL_DIR, [])}`);
  });
});
