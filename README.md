Allspeak.js
===========

Allspeak is a front-end JavaScript library that translates your websites and applications quickly and efficiently.

## Installation

Download or clone the Allspeak.js repository

```
git clone https://github.com/Schlipak/Allspeak.js.git
```

In the `dist` folder, you will find the source and minified files. You can either use the jQuery or vanilla version as you like, both have the same functionnalities.

In your HTML document, you should add an attribute to the elements you want to translate. The default attribute is `data-key`, but it can be configured to your liking.

All the translations are defined in a JSON file called the *translation domain*, which follows a specific structure. See [JSON file definition](#json-file-definition).

``` html
<!DOCTYPE html>
<html>
<head>
	<title>Hello world</title>
</head>
<body>
	<p data-key="translation.key">Some default text</p>
	<script type="application/javascript" src="path/to/Allspeak/dist/allspeak.min.js"></script>
	<script type="application/javascript">
		(function() {
			var speak = new Allspeak();
			speak.trans('fr');
		}());
	</script>
</body>
</html>
```

Along with a valid JSON translation file, the previous example will be translated according to it.

*Note*: When using the jQuery version of Allspeak, wrap your code in `$(document).ready()`;

## JSON file definition

The JSON translation file structure is pretty simple and straight-forward. It lists all of your translation keys, and to each, associates one or more translation.

``` json
{
	"some.translation.key": {
		"en": "This is the english traduction",
		"fr": "Ceci est la traduction française"
	},
	"another.translation.key": {
		"en": "Yep, same thing here",
		"fr": "Ouep, même chose"
	}
}
```

If your file does not follow this structure, Allspeak will either throw a *parseError* or warn you of a missing key or translation in the console. It's always good to test your translation file with an JSON validator service such as JSONlint.

## Translation domains

Allspeak uses the concept of translation domains. This allows you to split your translations into multiple files, depending on what part of your website/application it belongs. That way, you can easily maintain your application's translations.

For instance, we can imagine a web application divided in the following trans domains:

* Buttons
* Forms
* Menus
* ... etc

The corresponding JSON files should be named according to their translation domain, ie:

* buttons.json
* forms.json
* menus.json

## Settings

Allspeak comes with settings that let you tune its behaviour to better fit your needs. You can pass an object to the constructor to specify some of these settings.

``` javascript
var speak = new Allspeak({
	setting: value
});
```

#### debug

You can activate the debug mode to make Allspeak verbose and output informations in the console. This should not be used in production.

* Setting name: `debug`
* Possible values: *Boolean* true|false
* Default: false

#### path

This is the (relative or absolute) path to the directory in which your translation files are located.
Note that relative paths are relative to the HTML file location and not to the Allspeak.js location.

* Setting name: `path`
* Possible values: *String* Any valid path
* Default: './translations'

#### defaultDomain

You can specify a default domain name. This will be used if you do not specify a domain name when translating.

* Setting name: `defaultDomain`
* Possible values: *String* A valid file identifier
* Default: 'messages'

#### keyAttrName

You can specify the key attribute name, which will be used to recognize which HTML elements are to be translated.

* Setting name: `keyAttrName`
* Possible values: *String* A valid attribute name
* Default: `data-key`

#### raw

By default, Allspeak will output escaped strings to avoid any problem when outputtig characters such as `< >`. You can choose to disable this, to allow Allspeak to output raw HTML code.

* Setting name: `raw`
* Possible values: *Boolean* true|false
* Default: false

#### useCache

Allspeak uses a built-in cache system, to speed up the translation process.<br>
Typically, the JSON files should be loaded only once, then the application will rely either on the cached JSON data, or even store translations into localStorage. This allows to keep translations cached even if you close the website.<br>
However, any modifications to the translation files will **not** show up in this case (Aside from new yet-to-be-cached translations).<br>
You can then either disable the caching system, which will load translations directly from the JSON files everytime, or [clear the cache](#clearcache) to force Allspeak to refresh it.

* Setting name: `useCache`
* Possible values: *Boolean* true|false
* Default: true

## Methods

#### trans

``` javascript
Allspeak.trans(args);
```

Translates the document to the given locale.

###### Parameters

* args *Object|String* The arguments for this translation
	* Required: The locale/language identifier

The arguments can be:

* *String* The locale identifier
* *Object* The arguments settings
	- locale: *String* The locale identifier
	- domain: *String* The translation domain (Optional, Default `Allspeak.defaultDomain`)
	- scope: *DOM Element|jQuery Element* The scope of the document to translate (Optional, Default `<body>`)

#### clearCache

``` javascript
Allspeak.clearCache();
```

Clear the translation cache, including the cached JSON data. This will force to reload the whole translation data the next time the page is translated.

###### Parameters

*none*
