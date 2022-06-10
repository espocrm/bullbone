var Bull = Bull || {};

(function (Bull, _) {

    var root = this;

    /**
     * A view factory.
     *
     * @class Bull.Factory
     * @param {Object} options Configuration options.
     * <ul>
     *  <li>defaultViewName: {String} Default name for views when it is not defined.</li>
     *  <li>viewLoader: {Function} Function that loads view class ({Function} in javascript)
     *  by the given view name and callback function as parameters. Here you can load js code using sync XHR request.
     *  If not defined it will lookup classes in window object.</li>
     *  <li>helper: {Object} View Helper that will be injected into all views.</li>
     *  <li>resources: {Object} Resources loading options: paths, exts, loaders. Example: <br>
     *    <i>{
     *      paths: { // Custom paths for resource files.
     *        layout: 'resources/layouts',
     *        templates: 'resources/templates',
     *        layoutTemplate: 'resources/templates/layouts',
     *      },
     *      exts: { // Custom extensions of resource files.
     *        layout: 'json',
     *        templates: 'tpl',
     *      },
     *      loaders: { // Custom resources loading functions. Define it if some type of resources needs to be loaded
     *                 // via REST rather than from file.
     *        layout: function (layoutName, callback) {
     *          callback(layoutManager.getLayout(layoutName));
     *        }
     *      },
     *      path: function (type, name) {} // Custom path function. Should return path to the needed resource.
     *    }</i>
     *  </li>
     *  <li>rendering: {Object} Rendering options: method (Method is the custom function for a rendering.
     *  Define it if you want to use another templating engine. <i>Function (template, data)</i>).</li>
     *  <li>templating: {Object} Templating options: {bool} compilable (If templates are compilable (like Handlebars).
     *  True by default.)</li>
     * </ul>
     */
    Bull.Factory = function (options) {
        var options = options || {};

        this.defaultViewName = options.defaultViewName || this.defaultViewName;

        this._loader = options.customLoader || new Bull.Loader(options.resources || {});
        this._renderer = options.customRenderer || new Bull.Renderer(options.rendering || {});
        this._layouter = options.customLayouter || new Bull.Layouter(_.extend(options.layouting || {}, {
            loader: this._loader,
        }));
        this._templator = options.customTemplator || new Bull.Templator(_.extend(options.templating || {}, {
            loader: this._loader,
            layouter: this._layouter,
        }));

        this._helper = options.helper || null;

        this._viewClassHash = {};
        this._getViewClassFunction = options.viewLoader || this._getViewClassFunction;
        this._viewLoader = this._getViewClassFunction;
    };

    _.extend(Bull.Factory.prototype, {

        defaultViewName: 'View',

        _layouter: null,

        _templator: null,

        _renderer: null,

        _loader: null,

        _helper: null,

        _viewClassHash: null,

        _viewLoader: null,

        _getViewClassFunction: function (viewName, callback) {
            var viewClass = root[viewName];

            if (typeof viewClass !== "function") {
                throw new Error("function \"" + viewClass + "\" not found.");
            }

            callback(viewClass);
        },

        _getViewClass: function (viewName, callback) {
            if (viewName in this._viewClassHash) {
                callback(this._viewClassHash[viewName]);

                return;
            }

            this._getViewClassFunction(viewName, (viewClass) => {
                this._viewClassHash[viewName] = viewClass;

                callback(viewClass);
            });
        },

        /**
         * Create a view.
         *
         * @param {string} viewName A view name/path.
         * @param {Bull.ViewOptions} [options] Options.
         * @param {Function<Bull.View>} [callback] Invoked once the view is ready.
         */
        create: function (viewName, options, callback) {
            this._getViewClass(viewName, viewClass => {
                if (typeof viewClass === 'undefined') {
                    throw new Error(`A view class '${viewName}' not found.`);
                }

                options = _.extend(options || {}, {
                    _factory: this,
                    _layouter: this._layouter,
                    _templator: this._templator,
                    _renderer: this._renderer,
                    _helper: this._helper,
                    _onReady: callback,
                });

                new viewClass(options);
            });
        },
    });

}).call(this, Bull, _);
