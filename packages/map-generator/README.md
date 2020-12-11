## How to write code for the map generator

All scripts are run with `yarn`.  `yarn` requires `node`.  Both are included in this repository, so you shouldn't need to install anything if you're on Windows.

Start a webserver:
```
yarn start
```

This will start the map generator on `localhost:8080`.  When you change code in your editor,
the browser should reload automatically.

To build the map generator:

```
yarn build
```

The map generator compiles into only 2 files: `index.html` and `browser.js`