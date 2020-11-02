#!/usr/bin/env node

'use strict';

require = require('esm')(module);

const fs = require('fs');
const path = require('path');
const request = require('request');

const packageJson = require('../package');

const args = process.argv;
const opts = require('commander')
  .description('tileserver-gl startup options')
  .usage('tileserver-gl [mbtiles] [options]')
  .option(
    '-c, --config <file>',
    'Configuration file [config.json]',
    'config.json'
  )
  .option(
    '-b, --bind <address>',
    'Bind address'
  )
  .option(
    '-p, --port <port>',
    'Port [8080]',
    8080,
    parseInt
  )
  .option(
    '-C|--no-cors',
    'Disable Cross-origin resource sharing headers'
  )
  .option(
    '-u|--public_url <url>',
    'Enable exposing the server on subpaths, not necessarily the root of the domain'
  )
  .option(
    '-V, --verbose',
    'More verbose output'
  )
  .option(
    '-s, --silent',
    'Less verbose output'
  )
  .option(
    '-l|--log_file <file>',
    'output log file (defaults to standard out)'
  )
  .option(
    '-f|--log_format <format>',
    'define the log format:  https://github.com/expressjs/morgan#morganformat-options'
  )
  .version(
    packageJson.version,
    '-v, --version'
  )
  .parse(args);

console.log(`Starting ${packageJson.name} v${packageJson.version}`);

const startServer = (configPath, config) => {
  let publicUrl = opts.public_url;
  if (publicUrl && publicUrl.lastIndexOf('/') !== publicUrl.length - 1) {
    publicUrl += '/';
  }
  return require('./server')({
    configPath: configPath,
    config: config,
    bind: opts.bind,
    port: opts.port,
    cors: opts.cors,
    verbose: opts.verbose,
    silent: opts.silent,
    logFile: opts.log_file,
    logFormat: opts.log_format,
    publicUrl: publicUrl
  });
};

fs.stat(path.resolve(opts.config), (err, stats) => {
  if (err || !stats.isFile() || stats.size === 0) {
    console.log(`Failed to load config: ${opts.config}`);
  } else {
    console.log(`Using specified config file from ${opts.config}`);
    return startServer(opts.config, null);
  }
});
