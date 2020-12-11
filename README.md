## Manic Miners web-based map generator

Randomly generate maps for Manic Miners.
## How to use the map generator

It's a website, and it lives here:

https://manicminers.github.io/map-generator

## How to develop the map generator

Open a terminal in this directory.  Run this once to setup:

```
yarn
```

*All scripts run with `yarn`, which requires `node`.  Both are included in this repository, so you shouldn't need to install anything if you're on Windows.
If you have problems, try installing node from here: https://nodejs.org/en/*

Then start a webserver:
```
yarn start
```

This will start the map generator on [`http://localhost:8080`](http://localhost:8080).  When you change code,
the browser should reload automatically.

For editing code, I recommend [VSCode](https://code.visualstudio.com/).
I've preconfigured this project for VSCode, so you should have a good
experience out of the box.

The code lives in `packages/map-generator/`.  For example, `packages/map-generator/browser.tsx` is the browser user interface.
`packages/map-generator/map-generator.ts` has the generation algorithm which was converted from python.

To build the map generator:

```
yarn build
```

The map generator compiles into only 2 files: `index.html` and `browser.js`
