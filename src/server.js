#!/usr/bin/env node
'use strict';

process.env.UV_THREADPOOL_SIZE =
    Math.ceil(Math.max(4, require('os').cpus().length * 1.5));

const fs = require('fs');
const path = require('path');

const clone = require('clone');
const cors = require('cors');
const enableShutdown = require('http-shutdown');
const express = require('express');
const morgan = require('morgan');

const serve_rendered = require('./serve_rendered');

function start(opts) {
  console.log('Starting server');

  const app = express().disable('x-powered-by'),
    serving = {
      styles: {},
      rendered: {},
      data: {},
      fonts: {}
    };

  app.enable('trust proxy');

  if (process.env.NODE_ENV !== 'test') {
    const defaultLogFormat = process.env.NODE_ENV === 'production' ? 'tiny' : 'dev';
    const logFormat = opts.logFormat || defaultLogFormat;
    app.use(morgan(logFormat, {
      stream: opts.logFile ? fs.createWriteStream(opts.logFile, { flags: 'a' }) : process.stdout,
      skip: (req, res) => opts.silent && (res.statusCode === 200 || res.statusCode === 304)
    }));
  }

  let config = opts.config || null;
  let configPath = null;
  if (opts.configPath) {
    configPath = path.resolve(opts.configPath);
    try {
      config = clone(require(configPath));
    } catch (e) {
      console.log('ERROR: Config file not found or invalid!');
      console.log('       See README.md for instructions and sample data.');
      process.exit(1);
    }
  }
  if (!config) {
    console.log('ERROR: No config file not specified!');
    process.exit(1);
  }

  const options = config.options || {};
  const paths = options.paths || {};
  options.paths = paths;
  paths.root = path.resolve(
    configPath ? path.dirname(configPath) : process.cwd(),
    paths.root || '');
  paths.styles = path.resolve(paths.root, paths.styles || '');
  paths.fonts = path.resolve(paths.root, paths.fonts || '');
  paths.sprites = path.resolve(paths.root, paths.sprites || '');
  paths.mbtiles = path.resolve(paths.root, paths.mbtiles || '');

  const startupPromises = [];

  const checkPath = type => {
    if (!fs.existsSync(paths[type])) {
      console.error(`The specified path for "${type}" does not exist (${paths[type]}).`);
      process.exit(1);
    }
  };
  checkPath('styles');
  checkPath('fonts');
  checkPath('sprites');

  if (opts.cors) {
    app.use(cors());
  }

  startupPromises.push(
    serve_rendered.init(options, serving.rendered)
      .then(sub => {
        app.use('/styles/', sub);
      })
  );

  let addStyle = (id, item, allowMoreData, reportFonts) => {
    if (item.serve_rendered !== false) {
      if (serve_rendered) {
        startupPromises.push(serve_rendered.add(options, serving.rendered, item, id, opts.publicUrl));
      }
    }
  };

  for (const id of Object.keys(config.styles || {})) {
    const item = config.styles[id];
    if (!item.style || item.style.length === 0) {
      console.log(`Missing "style" property for ${id}`);
      continue;
    }

    addStyle(id, item, true, true);
  }

  let startupComplete = false;
  const startupPromise = Promise.all(startupPromises).then(() => {
    console.log('Startup complete');
    startupComplete = true;
  });
  app.get('/health', (req, res, next) => {
    if (startupComplete) {
      return res.status(200).send('OK');
    } else {
      return res.status(503).send('Starting');
    }
  });

  const server = app.listen(process.env.PORT || opts.port, process.env.BIND || opts.bind, function () {
    console.log(`Listening at http://${this.address()}:${this.address().port}/`);
  });

  // add server.shutdown() to gracefully stop serving
  enableShutdown(server);

  return {
    app: app,
    server: server,
    startupPromise: startupPromise
  };
}

module.exports = opts => {
  const running = start(opts);

  running.startupPromise.catch(err => {
    console.error(err.message);
    process.exit(1);
  });

  process.on('SIGINT', () => {
    process.exit();
  });

  process.on('SIGHUP', () => {
    console.log('Stopping server and reloading config');

    running.server.shutdown(() => {
      for (const key in require.cache) {
        delete require.cache[key];
      }

      const restarted = start(opts);
      running.server = restarted.server;
      running.app = restarted.app;
    });
  });

  return running;
};
