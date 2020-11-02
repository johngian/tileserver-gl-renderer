============
Installation
============

Native dependencies
-------------------

There are some native dependencies that you need to make sure are installed if you plan to run the TileServer GL natively without docker.
The precise package names you need to install may differ on various platforms.

These are required on Debian 9:
  * ``build-essential``
  * ``libcairo2-dev``
  * ``libprotobuf-dev``


From source
===========

Make sure you have Node v10 (nvm install 10) and run::

  npm install
  node .


On OSX
======

Make sure to have dependencies of canvas_ package installed::

  brew install pkg-config cairo libpng jpeg giflib


.. _canvas: https://www.npmjs.com/package/canvas
