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

/* eslint-disable no-console */

import createDebug from 'debug';
import chalk from 'chalk';
import { libraryName } from './constants';

export const debug = createDebug(libraryName);

let logLevel = 2;
export function setLogLevel(level = 2) {
  logLevel = level;
}

export const {
  red, green, blue, yellow,
} = chalk;
export const pink = chalk.keyword('pink');
export const bisque = chalk.keyword('bisque');
export const deeppink = chalk.keyword('deeppink');
export const dodgerblue = chalk.keyword('dodgerblue');
export const blueviolet = chalk.keyword('blueviolet');
export const palegreen = chalk.keyword('palegreen');
export const magenta = chalk.keyword('magenta');
export const purple = chalk.keyword('purple');
export const orange = chalk.keyword('orange');
export const cyan = chalk.keyword('cyan');
export const printLibName = () => `  ${libraryName} ::`;
export const log = (message, ...args) => logLevel > 1 && console.log(`${green.bold(printLibName())} ${message}`, ...args);
export const warn = (message, ...args) => logLevel > 0 && console.warn(`\n${orange.bold(printLibName())} ${yellow('(Warning)')} ${orange(message)}\n`, ...args);
export const error = (message, ...args) => console.error(`\n${red.bold(printLibName())} ${orange('(Error)')} ${red(message)}\n`, ...args);
export const info = (message, ...args) => console.info(`\n${green.bold(printLibName())} ${green(message)}`, ...args);
export const time = async (label, callback) => {
  const timeLabel = `${bisque.bold(printLibName())} ${label}`;
  console.time(timeLabel);
  await callback();
  console.timeEnd(timeLabel);
};

export function setDebugMode() {
  process.env.DEBUG = [process.env.DEBUG || '', libraryName].join(' ').trim();
}

setDebugMode();
