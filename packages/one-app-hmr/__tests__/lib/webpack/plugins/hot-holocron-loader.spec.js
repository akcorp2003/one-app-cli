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

import { getOptions } from 'loader-utils';

import HotHolocronModuleLoader from '../../../../lib/webpack/plugins/hot-holocron-loader';
import { libraryName } from '../../../../lib/constants';

jest.mock('loader-utils', () => ({
  getOptions: jest.fn(() => ({
    rootModuleName: 'root-module',
    moduleName: 'root-module',
    externals: [],
  })),
}));

describe('HotHolocronModuleLoader', () => {
  const source = [
    'import Module from "./components/Module";',
    'export default Module;',
  ].join('\n');

  const expectedModifiedSource = `
/* Holocron Hot Module */
import Module from "./components/Module";
import wrapper from '@americanexpress/${libraryName}/lib/components/HolocronHmrWrapper.jsx';
Module.moduleName = "root-module";
const HotHolocronModule = wrapper(Module);
export default HotHolocronModule;
    `.trim();

  const externalLibName = 'an-external-library';
  const expectedModifiedSourceWithExternals = `
${expectedModifiedSource}
if ('appConfig' in HotHolocronModule === false) HotHolocronModule.appConfig = {};
HotHolocronModule.appConfig.providedExternals = { '${externalLibName}': { module: require('${externalLibName}') }, };
window.getTenantRootModule = () => HotHolocronModule;
    `.trim();

  test('modifies the source of an incoming Holocron module entry file', () => {
    const modifiedSource = HotHolocronModuleLoader(source);
    expect(modifiedSource).toEqual(expectedModifiedSource);
  });

  test('does not modify the source of an incoming Holocron module entry if previously modified', () => {
    const modifiedSource = HotHolocronModuleLoader(expectedModifiedSource);
    expect(modifiedSource).toEqual(expectedModifiedSource);
  });

  test('includes externals if root Holocron module is being used and provides externals', () => {
    getOptions.mockImplementationOnce(() => ({
      rootModuleName: 'root-module',
      moduleName: 'root-module',
      externals: [externalLibName],
    }));
    const modifiedSource = HotHolocronModuleLoader(source);
    expect(modifiedSource).toEqual(expectedModifiedSourceWithExternals);
  });
});
