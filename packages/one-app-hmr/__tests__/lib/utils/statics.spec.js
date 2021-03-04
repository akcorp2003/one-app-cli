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
  addStaticsDirToGitIgnore,
  loadOneAppStaticsFromDocker,
  preloadOneAppStatics,
  loadStatics,
} from '../../../lib/utils/statics';

jest.mock('child_process', () => ({
  execSync: jest.fn(() => 'en-US'),
  spawnSync: jest.fn(),
}));

const readFileSyncToString = jest.fn(() => 'node_modules');

describe('addStaticsDirToGitIgnore', () => {
  beforeAll(() => {
    fs.existsSync = jest.fn(() => true);
    fs.readFileSync = jest.fn(() => ({ toString: readFileSyncToString }));
  });

  it('adds static directory to .gitignore', () => {
    expect(() => addStaticsDirToGitIgnore()).not.toThrow();
  });
});

describe('loadOneAppStaticsFromDocker', () => {
  beforeAll(() => {
    fs.existsSync = jest.fn(() => true);
    fs.readFileSync = jest.fn(() => ({ toString: () => 'node_modules' }));
  });

  it('adds One App statics from docker image', () => {
    expect(() => loadOneAppStaticsFromDocker()).not.toThrow();
  });
});

describe('preloadOneAppStatics', () => {
  const config = {
    oneAppSource: 'docker',
    dockerImage: 'oneamex/one-app-dev:latest',
  };

  beforeAll(() => {
    fs.readdirSync = jest.fn(() => 'latest');
    fs.readFileSync = jest.fn(() => 'script with removed eval');
    fs.writeFileSync = jest.fn(() => 'sample-module/static/app/app.js');
  });

  it('preload statics', async () => {
    await expect(preloadOneAppStatics(config)).resolves.toBeUndefined();
  });
});

describe('loadStatics', () => {
  const config = {
    oneAppSource: 'docker',
    dockerImage: 'oneamex/one-app-dev:latest',
  };

  beforeAll(() => {
    fs.readdirSync = jest.fn(() => 'latest');
    fs.readFileSync = jest.fn(() => 'script with removed eval');
    fs.writeFileSync = jest.fn(() => 'sample-module/static/app/app.js');
  });

  it(' setups statics', async () => {
    await expect(loadStatics(config)).resolves.toBeUndefined();
  });
});
