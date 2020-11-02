===================
Available endpoints
===================

Rendered tiles
==============
* Rendered tiles are served at ``/styles/{id}/{z}/{x}/{y}[@2x].{format}``

  * The optional ``@2x`` (or ``@3x``, ``@4x``) part can be used to render HiDPI (retina) tiles
  * Available formats: ``png``, ``jpg`` (``jpeg``), ``webp``

Static images
=============
* Several endpoints:

  * ``/styles/{id}/static/{lon},{lat},{zoom}[@{bearing}[,{pitch}]]/{width}x{height}[@2x].{format}`` (center-based)
  * ``/styles/{id}/static/{minx},{miny},{maxx},{maxy}/{width}x{height}[@2x].{format}`` (area-based)
  * ``/styles/{id}/static/auto/{width}x{height}[@2x].{format}`` (autofit path -- see below)

* All the static image endpoints additionally support following query parameters:

  * ``path`` - comma-separated ``lng,lat``, pipe-separated pairs

    * e.g. ``5.9,45.8|5.9,47.8|10.5,47.8|10.5,45.8|5.9,45.8``

  * ``latlng`` - indicates the ``path`` coordinates are in ``lat,lng`` order rather than the usual ``lng,lat``
  * ``fill`` - color to use as the fill (e.g. ``red``, ``rgba(255,255,255,0.5)``, ``#0000ff``)
  * ``stroke`` - color of the path stroke
  * ``width`` - width of the stroke
  * ``padding`` - "percentage" padding for fitted endpoints (area-based and path autofit)

    * value of ``0.1`` means "add 10% size to each side to make sure the area of interest is nicely visible"

* You can also use (experimental) ``/styles/{id}/static/raw/...`` endpoints with raw spherical mercator coordinates (EPSG:3857) instead of WGS84.

* The static images are not available in the ``tileserver-gl-light`` version.

Health check
============
Endpoint reporting health status is at ``/health`` and currently returns:

  * ``503`` Starting - for a short period before everything is initialized
  * ``200`` OK - when the server is running
