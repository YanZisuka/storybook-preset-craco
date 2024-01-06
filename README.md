# CRACO preset for Storybook

One-line [CRACO](https://github.com/gsoft-inc/craco) configuration for Storybook.

This preset is designed to use alongside [`@storybook/react`](https://github.com/storybookjs/storybook/tree/master/app/react).

## Compatibility

The `@yanzisuka/storybook-preset-craco` is compatible with Create React App version 5 and later.

## Basic usage

First, install this preset to your project.

```sh
# Yarn
yarn add -D @yanzisuka/storybook-preset-craco

# npm
npm install -D @yanzisuka/storybook-preset-craco
```

Once installed, add this preset to the appropriate file:

- `./.storybook/main.js`

  ```js
  module.exports = {
    addons: ['@yanzisuka/storybook-preset-craco'],
  }
  ```

  **Note**: Don't forget to comment or remove the `@storybook/preset-create-react-app` from `addons`.

## Advanced usage

### Usage with Docs

When working with Storybook Docs, simply add the following config to your `main.js` file.

```js
module.exports = {
  addons: [
    '@yanzisuka/storybook-preset-craco',
    {
      name: '@storybook/addon-docs',
      options: {
        configureJSX: true,
      },
    },
  ],
}
```

### Custom `craco.config.js`

In most cases, this preset will look for your `craco.config.js` in the current working directory.

If you are using a non standard project layout then you can provide it in `cracoConfigFile`.

```js
module.exports = {
  addons: [
    {
      name: '@yanzisuka/storybook-preset-craco',
      options: {
        cracoConfigFile: '../craco.config.js',
      },
    },
  ],
}
```

## ⚖️ Licence

This project is licensed under the [MIT licence](http://dan.mit-license.org/).

All documentation and images are licenced under the
[Creative Commons Attribution-ShareAlike 4.0 International License][cc_by_sa].

[cc_by_sa]: https://creativecommons.org/licenses/by-sa/4.0/

## 📝 Meta

This project uses [Semantic Versioning](http://semver.org/).
