(function() {
	/**
	 * A private utility class
	 * @class ToolBox
	 * @private
	 * @param {Object} args The arguments
	 * @returns {ToolBox} this
	 */
	var ToolBox = function(args) {
		/**
		 * Storage functions encapsulation object
		 * @public
		 * @type {Object}
		 */
		this.Storage = {
			/**
			 * Tests the browser's compatibility with localStorage
			 * @return {Boolean}
			 */
			isCompatible: function() {
				return typeof Storage !== 'undefined';
			},
			/**
			 * Puts a value in localStorage
			 * @param  {Object} args The arguments
			 * @return {undefined}
			 */
			put: function(args) {
				if (typeof args.key === 'undefined' ||
					typeof args.value === 'undefined') {
					throw new Error('Invalid arguments: ' + args);
				};

				localStorage.setItem(args.key, JSON.stringify(args.value));
			},
			/**
			 * Gets a value from localStorage
			 * @param  {String} key The key
			 * @return {String} The value
			 */
			get: function(key) {
				if (typeof key !== 'string') {
					throw new Error('The storage key must be a string. (Got "' + key + '")');
				};

				return localStorage[key];
			},
			/**
			 * Clears the cache
			 * @return {undefined}
			 */
			clear: function() {
				localStorage.clear();
			}
		};

		return this;
	};

	/**
	 * The translator class
	 * @class Allspeak
	 * @constructor
	 * @public
	 * @param {Object} args The arguments
	 * @returns {Allspeak} this
	 */
	Allspeak = function(args) {
		if (typeof args === 'undefined') {args = {};};

		/**
		 * Private local instance of ToolBox
		 * @private
		 * @type {ToolBox}
		 */
		var _utils = new ToolBox();

		/**
		 * Cached JSON data
		 * @private
		 * @default undefined
		 * @type {JSON Object}
		 */
		var _cachedJsonData = null;

		/**
		 * Should the translator output information in the console
		 * @public
		 * @default false
		 * @type {Boolean}
		 */
		this.debug = args.debug || false;

		/**
		 * The relative path to the translations directory
		 * @public
		 * @default '/translations'
		 * @type {String}
		 */
		this.path = args.path || './translations';

		/**
		 * The default translation domain
		 * @public
		 * @default 'messages'
		 * @type {String}
		 */
		this.defaultDomain = args.defaultDomain || 'messages';

		/**
		 * The HTML attribute that contains the translation key
		 * @public
		 * @default 'data-key'
		 * @type {String}
		 */
		this.keyAttrName = args.keyAttrName || 'data-key';

		/**
		 * The HTML attribute that contains the domain name
		 * @public
		 * @default 'data-domain'
		 * @type {String}
		 */
		this.domainAttrName = args.domainAttrName || 'data-domain';

		/**
		 * Should the translator output raw HTML or escaped text
		 * @public
		 * @default false
		 * @type {Boolean}
		 */
		this.raw = args.raw || false;

		/**
		 * Should the translator cache the translation data to localStorage
		 * This will make the translation process faster since it won't load 
		 * the JSON file over AJAX each time. However, any changes to this 
		 * file won't take effect until cache mode is disabled or cleared. 
		 * Furthermore,this mode will self-disable automatically if 
		 * localStorage isn't supported on the user's browser.
		 * @public
		 * @default true
		 * @type {Boolean}
		 */
		this.useCache = typeof args.useCache === 'boolean' ?
			args.useCache :
			_utils.Storage.isCompatible();

		if (!_utils.Storage.isCompatible()) {
			console.warn('Your browser is\'t compatible with localStorage. The cache mode has been disabled.');
		};

		/**
		 * Gets the JSON data from the translation domain file
		 * @private
		 * @param {String} url The file url
		 * @param {Function} callback The callback function
		 * @return {Boolean} status
		 */
		var getJsonData = function(url, callback, async) {
			async = typeof async === 'boolean' ? async : true;

			var xhr;
			if (window.XMLHttpRequest) {
				xhr = new XMLHttpRequest();
			} else {
				xhr = new ActiveXObject("Microsoft.XMLHTTP");
			};

			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						var json = JSON.parse(xhr.responseText);
						if (callback) {
							callback(json);
						};
						return json;
					} else {
						console.warn('An error occurred while loading the translation data: "' + xhr.responseText + '"');
						return false;
					};
				};
			};

			xhr.open("GET", url, async);
			xhr.send();
		};

		/**
		 * Updates the HTML with the translated value
		 * @private
		 * @param  {jQuery Element} el The element
		 * @param  {String} 		trans The translation
		 * @return {undefined}
		 */
		var updateElement = function(el, trans) {
			if (this.debug) {
				console.info('Updating element:', el);
			};

			if (this.raw) {
				el.innerHTML = trans;
			} else {
				var escapedTrans = document.createElement('div');
				escapedTrans.appendChild(document.createTextNode(trans));
				el.innerHTML = escapedTrans.innerHTML;
			};
		};

		var updateAll = function(_this, args) {
			var _els = args.scope.getElementsByTagName('*');

			for (var i = _els.length - 1; i >= 0; i--) {
				var el = _els[i];

				var _key = el.getAttribute(_this.keyAttrName);

				if (typeof _key === 'undefined') { return; };
				if (typeof args.data[_key] === 'undefined') {
					console.warn('Unknow translation key "' + _key + '", domain "' + args.domain + '"');
					return;
				};

				if (_this.debug) {
					console.info('Translating from loaded JSON: ["' + _key + '", "' + args.locale + '"]');
				};

				var _trans = args.data[_key][args.locale];

				if (typeof _trans === 'undefined') {
					console.warn('Missing translation for ["' + _key + '", "' + args.locale + '"], domain "' + args.domain + '"');
					return;
				};

				updateElement.bind(_this)(el, _trans);
			};

			document.documentElement.lang = args.locale;
		};

		/**
		 * Translate the page or given scope into the given locale
		 * @public
		 * @param  {Object}    args The arguments 
		 * @return {Allspeak} this
		 */
		this.trans = function(args) {
			var locale,
				domain = this.defaultDomain,
				scope = document.getElementsByTagName('body')[0],
				_this = this;

			if (typeof args === 'string') {
				locale = args;
			} else {
				locale = args.locale;
				domain = args.domain || this.defaultDomain;
				scope = args.scope || document.getElementsByTagName('body')[0];
			};

			var _url = this.path + '/' + domain + '.json';

			// Fail silently if the page is already translated
			if ( document.documentElement.lang === locale ) { return this; };

			if (this.useCache) {
				var _els = scope.getElementsByTagName('*');

				for (var i = _els.length - 1; i >= 0; i--) {
					var el = _els[i];
					var _key = el.getAttribute(_this.keyAttrName);

					if (typeof _key === 'undefined' || _key === null) { continue; };

					if (_this.debug) {
						console.info('Translating from storage cache: ["' + _key + '", "' + locale + '"]');
					};

					var _trans = _utils.Storage.get(_key);

					if (!_trans) {

						if (_this.debug) {
							console.info('Key "' + _key + '" missing from storage. Updating from cached JSON');
						};

						if (_cachedJsonData === null) {

							if (_this.debug) {
								console.info('No cached JSON data was found.');
							};

							// This has to be synchronous, or the next iterations won't wait for the completion
							// of this AJAX request and the JSON data will be loaded every time instead of
							// using the cached data
							getJsonData(_url, function(data) {
								if (typeof data[_key] === 'undefined') {
									console.warn('Unknow translation key "' + _key + '", domain "' + domain + '"');
									return;
								};

								_trans = data[_key][locale];

								if (typeof _trans === 'undefined') {
									console.warn('Missing translation for ["' + _key + '", "' + locale + '"], domain "' + domain + '"');
									return;
								};

								if (_this.debug) {
									console.info('Caching the translations for "' + _key + '" into storage');
								};

								_utils.Storage.put({
									key: _key, 
									value: data[_key]
								});

								_cachedJsonData = data;
							}, false);
						} else {
							if (typeof _cachedJsonData[_key] === 'undefined') {
								console.warn('Unknow translation key "' + _key + '"');
								return;
							};

							_trans = _cachedJsonData[_key][locale];

							if (typeof _trans === 'undefined') {
								console.warn('Missing translation for "' + _key + ', ' + locale + '"');
								return;
							};

							if (_this.debug) {
								console.info('Caching the translations for "' + _key + '" into storage');
							};

							_utils.Storage.put({
								key: _key, 
								value: _cachedJsonData[_key]
							});
						}
					} else {
						_trans = JSON.parse(_utils.Storage.get(_key))[locale];
					}

					updateElement.bind(_this)(el, _trans);
				};				
				document.documentElement.lang = locale;
			} else {
				getJsonData(_url, function(data) {
					updateAll(_this,{
						scope: scope,
						locale: locale,
						data: data,
						domain: domain
					});
				});
			};

			return this;
		};

		/**
		 * Clears the translation cache to allow the translator to use 
		 * newly added translations
		 * @public
		 * @return {Allspeak} this
		 */
		this.clearCache = function() {
			if (this.debug) {
				console.info('Clearing translation cache');
			};

			_cachedJsonData = null;
			_utils.Storage.clear();

			return this;
		};

		return this;
	};
}());
