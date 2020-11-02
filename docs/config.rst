==================
Configuration file
==================

The configuration file defines the behavior of the application. It's a regular JSON file.

Example::

  {
    "options": {
      "paths": {
        "root": "",
        "fonts": "fonts",
        "sprites": "sprites",
        "styles": "styles",
      },
      "formatQuality": {
        "jpeg": 80,
        "webp": 90
      },
      "maxScaleFactor": 3,
      "maxSize": 2048,
      "pbfAlias": "pbf",
      "serveStaticMaps": true,
      "tileMargin": 0
    },
    "styles": {
      "basic": {
        "style": "basic.json",
        "tilejson": {
          "type": "overlay",
          "bounds": [8.44806, 47.32023, 8.62537, 47.43468]
        }
      }
  }

``options``
===========

``paths``
---------

Defines where to look for the different types of input data.

The value of ``root`` is used as prefix for all data types.

``formatQuality``
-----------------

Quality of the compression of individual image formats. [0-100]

``maxScaleFactor``
-----------

Maximum scale factor to allow in raster tile and static maps requests (e.g. ``@3x`` suffix).
Also see ``maxSize`` below.
Default value is ``3``, maximum ``9``.

``maxSize``
-----------

Maximum image side length to be allowed to be rendered (including scale factor).
Be careful when changing this value since there are hardware limits that need to be considered.
Default is ``2048``.

``tileMargin``
--------------

Additional image side length added during tile rendering that is cropped from the delivered tile. This is useful for resolving the issue with cropped labels,
but it does come with a performance degradation, because additional, adjacent vector tiles need to be loaded to genenrate a single tile.
Default is ``0`` to disable this processing.

``minRendererPoolSizes``
------------------------

Minimum amount of raster tile renderers per scale factor.
The value is an array: the first element is the minimum amount of renderers for scale factor one, the second for scale factor two and so on.
If the array has less elements than ``maxScaleFactor``, then the last element is used for all remaining scale factors as well.
Selecting renderer pool sizes is a trade-off between memory use and speed.
A reasonable value will depend on your hardware and your amount of styles and scale factors.
If you have plenty of memory, you'll want to set this equal to ``maxRendererPoolSizes`` to avoid increased latency due to renderer destruction and recreation.
If you need to conserve memory, you'll want something lower than ``maxRendererPoolSizes``, possibly allocating more renderers to scale factors that are more common.
Default is ``[8, 4, 2]``.

``maxRendererPoolSizes``
------------------------

Maximum amount of raster tile renderers per scale factor.
The value and considerations are similar to ``minRendererPoolSizes`` above.
If you have plenty of memory, try setting these equal to or slightly above your processor count, e.g. if you have four processors, try a value of ``[6]``.
If you need to conserve memory, try lower values for scale factors that are less common.
Default is ``[16, 8, 4]``.

``watermark``
-----------

Optional string to be rendered into the raster tiles (and static maps) as watermark (bottom-left corner).
Can be used for hard-coding attributions etc. (can also be specified per-style).
Not used by default.

``styles``
==========

Each item in this object defines one style (map). It can have the following options:

* ``style`` -- name of the style json file [required]
* ``serve_rendered`` -- whether to render the raster tiles for this style or not
  * ``format`` and ``bounds`` can be especially useful

Sprites
-------

If your style requires any sprites, make sure the style JSON contains proper path in the ``sprite`` property.

It can be a local path (e.g. ``my-style/sprite``) or remote http(s) location (e.g. ``https://mycdn.com/my-style/sprite``). Several possible extension are added to this path, so the following files should be present:

* ``sprite.json``
* ``sprite.png``
* ``sprite@2x.json``
* ``sprite@2x.png``

You can also use the following placeholders in the sprite path for easier use:

* ``{style}`` -- gets replaced with the name of the style file (``xxx.json``)
* ``{styleJsonFolder}`` -- gets replaced with the path to the style file

Fonts (glyphs)
--------------

Similarly to the sprites, the style JSON also needs to contain proper paths to the font glyphs (in the ``glyphs`` property) and can be both local and remote.

It should contain the following placeholders:

* ``{fontstack}`` -- name of the font and variant
* ``{range}`` -- range of the glyphs

For example ``"glyphs": "{fontstack}/{range}.pbf"`` will instruct TileServer-GL to look for the files such as ``fonts/Open Sans/0-255.pbf`` (``fonts`` come from the ``paths`` property of the ``config.json`` example above).
