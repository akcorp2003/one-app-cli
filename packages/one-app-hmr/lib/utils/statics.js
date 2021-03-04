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

import fs from 'fs';
import path from 'path';
import { execSync, spawnSync } from 'child_process';

import {
  getOneAppPath, getStaticPath, getTempPath,
} from './paths';
import {
  error, log, info, orange, time,
} from '../logs';
import { libraryName } from '../constants';

export function printStatics(message) {
  return `${orange('statics')} - ${message}`;
}

export function addStaticsDirToGitIgnore() {
  // adds static/ to .gitignore only once
  const gitIgnorePath = path.resolve('.gitignore');
  if (fs.existsSync(gitIgnorePath)) {
    const gitIgnoreAddition = [
      `# added by ${libraryName}`,
      'static/',
    ].join('\n');
    if (!fs.readFileSync(gitIgnorePath).toString().includes(gitIgnoreAddition)) {
      log(printStatics('Adding "statics/" directory to .gitignore'));
      execSync(`echo "\n${gitIgnoreAddition}" >> ${gitIgnorePath}`);
    }
  }
}

export function loadOneAppStaticsFromDocker({
  tempDir = getTempPath(),
  appDir = getOneAppPath(),
  dockerImage = 'oneamex/one-app-dev:latest',
} = {}) {
  try {
    log(printStatics('Pulling Docker image to extract One App statics'));

    execSync(`docker pull ${dockerImage}`, { stdio: 'inherit' });
    execSync(
      `docker cp $(docker create ${dockerImage}):opt/one-app/build/ ${tempDir}`,
      { stdio: 'inherit' }
    );

    const [appVersion] = fs.readdirSync(path.join(tempDir, 'app'));

    log(printStatics('Using One App version v%s'), appVersion);

    spawnSync('mv', [path.join(tempDir, 'app', appVersion), appDir], {
      stdio: 'inherit',
    });
    spawnSync('rm', ['-R', tempDir], { stdio: 'inherit' });
  } catch (e) { error(e); }
}

export function preloadOneAppStatics(config = {}) {
  const outputDir = getStaticPath();

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const { oneAppSource = 'docker', dockerImage } = config;

  if (!fs.existsSync(getOneAppPath())) {
    if (oneAppSource === 'docker') {
      loadOneAppStaticsFromDocker({
        dockerImage,
      });
    }
  }

  addStaticsDirToGitIgnore();
}

export function loadStatics(config) {
  info(printStatics('Loading up One App statics'));
  return time('Setup time', () => preloadOneAppStatics(config));
}
