import { createWebpackDevConfig, createWebpackProdConfig } from "@craco/craco";
import { logger } from "@storybook/node-logger";
import { resolve, relative, dirname, join } from "path";
import type { Configuration } from "webpack";

import { processCraConfig } from "./utils/processCraConfig";
import { mergePlugins } from "./utils/mergePlugins";
import { getModulePath } from "./utils/getModulePath";
import { PluginOptions } from "./types/PluginOptions";

const CWD = process.cwd();

function babelDefault() {
  return {
    presets: [],
    plugins: [],
  };
}

const incompatiblePresets = [
  "@storybook/preset-scss",
  "@storybook/preset-typescript",
  "@storybook/preset-create-react-app",
];

function checkPresets(options: PluginOptions) {
  let presetsList = options.presetsList || [];

  presetsList.forEach((preset) => {
    const presetName = typeof preset === "string" ? preset : preset.name;
    if (incompatiblePresets.includes(presetName)) {
      logger.warn(
        `\`${presetName}\` may not be compatible with \`storybook-preset-craco\``
      );
    }
  });
}

function webpack(webpackConfig: Configuration = {}, options: PluginOptions) {
  const createWebpackConfig =
    webpackConfig.mode === "production"
      ? createWebpackProdConfig
      : createWebpackDevConfig;

  checkPresets(options);

  const cracoConfigFile =
    options.cracoConfigFile || resolve(CWD, "craco.config.js");

  const cracoConfig = require(cracoConfigFile);

  logger.info(
    `=> Loading Craco configuration from \`${relative(CWD, cracoConfigFile)}\``
  );

  const scriptsPackageName = cracoConfig.reactScriptsVersion || "react-scripts";

  const scriptsPath = dirname(
    require.resolve(`${scriptsPackageName}/package.json`)
  );

  logger.info(`=> Using react-scripts from \`${relative(CWD, scriptsPath)}\``);

  const cracoWebpackConfig = createWebpackConfig(cracoConfig);

  const resolveLoader = {
    modules: ["node_modules", join(scriptsPath, "node_modules")],
  };

  // Remove existing rules related to JavaScript and TypeScript.
  logger.info(`=> Removing existing JavaScript and TypeScript rules.`);
  const filteredRules =
    webpackConfig.module &&
    webpackConfig.module.rules?.filter(
      (rule) =>
        !(
          rule &&
          rule !== "..." &&
          rule.test instanceof RegExp &&
          ((rule.test && rule.test.test(".js")) || rule.test.test(".ts"))
        )
    );

  // Select the relevant craco rules and add the Storybook config directory.
  logger.info(`=> Modifying craco rules.`);

  const craRules = processCraConfig(cracoWebpackConfig, options);

  // CRA uses the `ModuleScopePlugin` to limit support to the `src` directory.
  // Here, we select the plugin and modify its configuration to include Storybook config directory.
  const plugins = cracoWebpackConfig.resolve?.plugins?.map((plugin) => {
    if (plugin && plugin !== "..." && plugin.appSrcs) {
      // Mutate the plugin directly as opposed to recreating it.
      // eslint-disable-next-line no-param-reassign
      plugin.appSrcs = [...plugin.appSrcs, resolve(options.configDir)];
    }
    return plugin;
  });

  // Return the new config.
  return {
    ...webpackConfig,
    module: {
      ...webpackConfig.module,
      rules: [...(filteredRules || []), ...craRules],
    },
    plugins: mergePlugins(
      ...(webpackConfig.plugins || []),
      ...(Array.isArray(cracoWebpackConfig.plugins)
        ? cracoWebpackConfig.plugins
        : [])
    ),
    resolve: {
      ...webpackConfig.resolve,
      alias: {
        ...webpackConfig.resolve?.alias,
        ...cracoWebpackConfig.resolve?.alias,
      },
      extensions: cracoWebpackConfig.resolve?.extensions,
      modules: [
        ...((webpackConfig.resolve && webpackConfig.resolve.modules) || []),
        ...((cracoWebpackConfig.resolve &&
          cracoWebpackConfig.resolve.modules) ||
          []),
        join(scriptsPath, "node_modules"),
        ...getModulePath(CWD),
      ],
      plugins: plugins,
    },
    resolveLoader,
  };
}

function webpackFinal(
  webpackConfig: Configuration = {},
  _options: PluginOptions
) {
  logger.info(`=> Removing storybook default rules.`);

  // these are suppressed by storybook when @storybook/preset-create-react-app is present.
  const rules = webpackConfig.module?.rules?.filter(
    (rule) =>
      !(
        rule &&
        rule !== "..." &&
        rule.test instanceof RegExp &&
        (rule.test.test(".css") ||
          rule.test.test(".svg") ||
          rule.test.test(".mp4"))
      )
  );

  return {
    ...webpackConfig,
    module: {
      ...webpackConfig.module,
      rules: rules,
    },
  };
}

function managerWebpack(
  webpackConfig: Configuration = {},
  options: PluginOptions
) {
  const cracoConfigFile =
    options.cracoConfigFile || resolve(CWD, "craco.config.js");

  const cracoConfig = require(cracoConfigFile);

  const scriptsPackageName = cracoConfig.reactScriptsVersion || "react-scripts";

  const scriptsPath = dirname(
    require.resolve(`${scriptsPackageName}/package.json`)
  );

  const resolveLoader = {
    modules: ["node_modules", join(scriptsPath, "node_modules")],
  };

  return {
    ...webpackConfig,
    resolveLoader,
  };
}

export { babelDefault, webpack, webpackFinal, managerWebpack };
