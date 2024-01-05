import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'
import type { Configuration } from 'webpack'

type WebpackConfigPlugins = Exclude<Configuration['plugins'], undefined>

export function mergePlugins(
  ...args: WebpackConfigPlugins
): WebpackConfigPlugins {
  return args.reduce((plugins, plugin) => {
    if (
      plugins.some(
        (includedPlugin) =>
          includedPlugin?.constructor.name === plugin?.constructor.name,
      ) ||
      plugin?.constructor.name === 'WebpackManifestPlugin'
    ) {
      return plugins
    }
    let updatedPlugin = plugin
    if (plugin?.constructor.name === 'ReactRefreshPlugin') {
      // Storybook uses webpack-hot-middleware
      // https://github.com/storybookjs/presets/issues/177

      updatedPlugin = new ReactRefreshWebpackPlugin({
        overlay: {
          sockIntegration: 'whm',
        },
      })
    }
    return [...plugins, updatedPlugin]
  }, [] as WebpackConfigPlugins)
}
