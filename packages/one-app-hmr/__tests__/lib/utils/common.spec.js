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

import { isDevelopment } from '../../../lib/utils/common';

const { NODE_ENV } = process.env;

describe('isDevelopment', () => {
  beforeEach(() => {
    process.env.NODE_ENV = NODE_ENV;
  });

  test('returns true when NODE_ENV is set to "development"', () => {
    process.env.NODE_ENV = 'development';
    expect(isDevelopment()).toBe(true);
  });

  test('returns false when NODE_ENV is set to "production"', () => {
    process.env.NODE_ENV = 'production';
    expect(isDevelopment()).toBe(false);
  });
});
