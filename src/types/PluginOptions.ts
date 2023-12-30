import type { PluginOptions as RDTSPluginOptions } from '@storybook/react-docgen-typescript-plugin';
import type { Options } from '@storybook/types';

export interface PluginOptions extends Options {
  /**
   * Optionally set the package name of a react-scripts fork.
   * In most cases, the package is located automatically by this preset.
   */
  scriptsPackageName?: string;

  /**
   * Overrides for Create React App's Webpack configuration.
   */
  craOverrides?: {
    fileLoaderExcludes?: string[];
  };

  cracoConfigFile?: string;

  typescriptOptions?: {
    reactDocgen: 'react-docgen-typescript' | 'react-docgen' | false;
    reactDocgenTypescriptOptions: RDTSPluginOptions;
  };
}
