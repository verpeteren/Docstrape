/**
 * Docstrape template logic is mainly based on jsdocs's default template, but I also took some inpiration from codeview (http://www.thebrightlines.com/2010/05/06/new-template-for-jsdoctoolkit-codeview/)
 *
 */


/*Override Link object*/
Link.symbolNameToLinkName = function(symbol) {
	var linker = '', ns = '';
	if (symbol.isStatic) linker = 'static_';
	else if (symbol.isInner) linker = 'inner-';

	if (symbol.isEvent && !/^event:/.test(symbol.name)) {
		ns = 'event_';
	}
	return Link.hashPrefix + linker + ns + symbol.name;
};

BLink = Link;
BLink.attributes = null;
BLink.prototype.toAttributes = function(attributes) {
	if (defined(attributes)) this.attributes = attributes;
	return this;
};
BLink.prototype._makeSymbolLink = function(alias) {
	var linkBase = Link.base + publish.conf.symbolsDir;
	var linkTo = Link.getSymbol(alias);
	var linkPath;
	var target = (this.targetName) ? ' target="' + this.targetName + '"' : '';
	// if there is no symbol by that name just return the name unaltered
	if (!linkTo)
		return this.text || alias;
	// it's a symbol in another file
	else {
		if (!linkTo.is('CONSTRUCTOR') && !linkTo.isNamespace) { // it's a method or property
			linkPath = (Link.filemap) ? Link.filemap[linkTo.memberOf] : escape(linkTo.memberOf) || '_global_';
				linkPath += publish.conf.ext + '#' + Link.symbolNameToLinkName(linkTo);
		}
		else {
			linkPath = (Link.filemap) ? Link.filemap[linkTo.alias] : escape(linkTo.alias);
			linkPath += publish.conf.ext;// + (this.classLink? '':'#' + Link.hashPrefix + 'constructor');
		}
		linkPath = linkBase + linkPath;
	}
	var linkText = this.text || alias;
	var link = {linkPath: linkPath, linkText: linkText, linkInner: (this.innerName ? '#' + this.innerName : '')};
	if (typeof JSDOC.PluginManager != 'undefined') {
		JSDOC.PluginManager.run('onSymbolLink', link);
	}
	if (this.attributes) {
		return '<a href="' + link.linkPath + link.linkInner + '"' + target + ' ' + this.attributes + '>' + link.linkText + '</a>';
	}
	return '<a href="' + link.linkPath + link.linkInner + '"' + target + '>' + link.linkText + '</a>';
};
Link.prototype._makeSrcLink = function(srcFilePath) {
	var target = (this.targetName) ? ' target="' + this.targetName + '"' : '';
	// transform filepath into a filename
	var srcFile = srcFilePath.replace(/\.\.?[\\\/]/g, '').replace(/[:\\\/]/g, '_');
	var outFilePath = Link.base + publish.conf.srcDir + srcFile + publish.conf.ext;
	if (!this.text) this.text = FilePath.fileName(srcFilePath);
	if (this.attributes) {
		return '<a href="' + outFilePath + '"' + target + ' ' + this.attributes + '>' + this.text + '</a>';
	}
	return '<a href="' + outFilePath + '"' + target + '>' + this.text + '</a>';
};
Link.prototype._makeFileLink = function(filePath) {
	var target = (this.targetName) ? ' target="' + this.targetName + '"' : '';
	var outFilePath = Link.base + filePath;
	if (!this.text) this.text = filePath;
	if (this.attributes) {
		return '<a href="' + outFilePath + '"' + target + ' ' + this.attributes + '>' + this.text + '</a>';
	}
	return '<a href="' + outFilePath + '"' + target + '>' + this.text + '</a>';
};
function includeTemplate(loadedTemplate, param) {
	return loadedTemplate.process(param);
}

/** Called automatically by JsDoc Toolkit. */
function publish(symbolSet) {
	publish.conf = {  // trailing slash expected for dirs
		ext: '.html',
		outDir: JSDOC.opt.d || SYS.pwd + '../out/jsdoc/',
		templatesDir: JSDOC.opt.t || SYS.pwd + '../templates/docstrape_tmpl/',
		symbolsDir: 'symbols/',
		srcDir: 'symbols/src/',
		staticDir: 'static/',
		cssDir: 'css/',
		imgDir: 'img/',
		fontDir: 'font/',
		jsDir: 'js/',
		templateName: 'docstrape',
		templateVersion: '0.1',
		templateLink: 'https://github.com/verpeteren/docstrape/'
	};
	// is source output is suppressed, just display the links to the source file
	if (JSDOC.opt.s && defined(Link) && Link.prototype._makeSrcLink) {
		Link.prototype._makeSrcLink = function(srcFilePath) {
			return '&lt;' + srcFilePath + '&gt;';
		};
	}
	// create the folders and subfolders to hold the output
	IO.mkPath((publish.conf.outDir + 'symbols/src').split('/'));
	IO.mkPath((publish.conf.outDir + publish.conf['staticDir'] + publish.conf.cssDir));
	IO.mkPath((publish.conf.outDir + '/' + publish.conf['staticDir'] + publish.conf.jsDir));
	IO.mkPath((publish.conf.outDir + '/' + publish.conf['staticDir'] + publish.conf.imgDir));
	IO.mkPath((publish.conf.outDir + '/' + publish.conf['staticDir'] + 'symbols/src').split('/'));
	if (! JSDOC.opt.D.prefix) {
		IO.mkPath((publish.conf.outDir + '/' + publish.conf['staticDir'] + publish.conf.fontDir));
	}
	// used to allow Link to check the details of things being linked to
	Link.symbolSet = symbolSet;
	// create the required templates
	try {
		var classTemplate = new JSDOC.JsPlate(publish.conf.templatesDir + 'class.tmpl');
		var classesTemplate = new JSDOC.JsPlate(publish.conf.templatesDir + '/snippet/allclasses.tmpl');
		//load the raw templates once
		if (JSDOC.opt.D.prefix) {
			publish.headerTemplate = new JSDOC.JsPlate(publish.conf.templatesDir + '/snippet/' + JSDOC.opt.D.prefix + '_header.tmpl');
			publish.footerTemplate = new JSDOC.JsPlate(publish.conf.templatesDir + '/snippet/' + JSDOC.opt.D.prefix + '_footer.tmpl');
		} else {
			publish.headerTemplate = new JSDOC.JsPlate(publish.conf.templatesDir + '/snippet/header.tmpl');
			publish.footerTemplate = new JSDOC.JsPlate(publish.conf.templatesDir + '/snippet/footer.tmpl');
		}
	} catch (e) {
		print('Couldn\'t create the required templates: ' + e);
		quit();
	}
	// some ustility filters
	function hasNoParent($) {return ($.memberOf == '')}
	function isaFile($) {return ($.is('FILE'))}
	function isaClass($) {return ($.is('CONSTRUCTOR') || $.isNamespace)}
	// get an array version of the symbolset, useful for filtering
	var symbols = symbolSet.toArray();
	// create the hilited source code files
	var files = JSDOC.opt.srcFiles;
	for (var i = 0, l = files.length; i < l; i++) {
		var file = files[i];
		var srcDir = publish.conf.outDir + 'symbols/src/';
		makeSrcFile(file, srcDir);
	}
	// get a list of all the classes in the symbolset
	var classes = symbols.filter(isaClass).sort(makeSortby('alias'));
	// create a filemap in which outfiles must be to be named uniquely, ignoring case
	if (JSDOC.opt.u) {
		var filemapCounts = {};
		Link.filemap = {};
		for (var i = 0, l = classes.length; i < l; i++) {
			var lcAlias = classes[i].alias.toLowerCase();
			if (!filemapCounts[lcAlias]) filemapCounts[lcAlias] = 1;
			else filemapCounts[lcAlias]++;
			Link.filemap[classes[i].alias] =
				(filemapCounts[lcAlias] > 1) ? lcAlias + '_' + filemapCounts[lcAlias] : lcAlias;
		}
	}
	// create a class index, displayed in the left-hand column of every class page
	Link.base = '../';
	publish.classesIndex = classesTemplate.process(classes); // kept in memory
	// create each of the class pages
	for (var i = 0, l = classes.length; i < l; i++) {
		var symbol = classes[i];
		symbol.events = symbol.getEvents();   // 1 order matters
		symbol.methods = symbol.getMethods(); // 2
		Link.currentSymbol = symbol;
		var output = '';
		output = classTemplate.process(symbol);
		IO.saveFile(publish.conf.outDir + 'symbols/', ((JSDOC.opt.u) ? Link.filemap[symbol.alias] : symbol.alias) + publish.conf.ext, output);
	}
	// regenerate the index with different relative links, used in the index pages
	Link.base = '';
	publish.classesIndex = classesTemplate.process(classes);
	// create the class index page
	try {
		var classesindexTemplate = new JSDOC.JsPlate(publish.conf.templatesDir + 'index.tmpl');
	} catch (e) {
		print(e.message); quit();
	}
	var classesIndex = classesindexTemplate.process(classes);
	IO.saveFile(publish.conf.outDir, 'index' + publish.conf.ext, classesIndex);
	classesindexTemplate = classesIndex = classes = null;
	// create the file index page
	try {
		var fileindexTemplate = new JSDOC.JsPlate(publish.conf.templatesDir + 'allfiles.tmpl');
	} catch (e) {
		print(e.message); quit();
	}
	var documentedFiles = symbols.filter(isaFile); // files that have file-level docs
	var allFiles = []; // not all files have file-level docs, but we need to list every one
	for (var i = 0; i < files.length; i++) {
		allFiles.push(new JSDOC.Symbol(files[i], [], 'FILE', new JSDOC.DocComment('/** */')));
	}
	for (var i = 0; i < documentedFiles.length; i++) {
		var offset = files.indexOf(documentedFiles[i].alias);
		allFiles[offset] = documentedFiles[i];
	}
	allFiles = allFiles.sort(makeSortby('name'));
	// output the file index page
	var filesIndex = fileindexTemplate.process(allFiles);
	IO.saveFile(publish.conf.outDir, 'files' + publish.conf.ext, filesIndex);
	fileindexTemplate = filesIndex = files = null;
	var staticFiles = {'css': ['docstrape.css'], 'js': ['docstrape.js'], 'fonts': [], 'img': ['promotejsh.gif']};
	copyFiles(staticFiles);
	if (! JSDOC.opt.D.prefix) {
		staticFiles = {	'css': ['bootstrap.min.css', 'custom.css', 'font-awesome-ie7.min.css', 'font-awesome.min.css', 'prettify.css'],
						'js': ['html5.js', 'bootstrap.min.js', 'jquery.min.js', 'prettify.js'],
						'font': ['FontAwesome.otf', 'fontawesome-webfont.ttf', 'fontawesome-webfont.eot', 'fontawesome-webfont.woff', 'fontawesome-webfont.svg']};
		copyFiles(staticFiles);
	}
}

/** Just a function to copy static files */
function copyFiles(staticFiles) {
	var fileList;
	for (var key in staticFiles) {
		if (staticFiles.hasOwnProperty(key)) {
			fileList = staticFiles[key];
			for (var i = 0; i < fileList.length; i++) {
				var dir = key + 'Dir';
				IO.copyFile(publish.conf.templatesDir + '/' + publish.conf['staticDir'] + publish.conf[dir] + fileList[i], publish.conf.outDir + '/' + publish.conf['staticDir'] + publish.conf[dir]);
			}
		}
	}
}

/** Just the first sentence (up to a full stop). Should not break on dotted variable names. */
function summarize(desc) {
	if (typeof desc != 'undefined')
		return desc.match(/([\w\W]+?\.)[^a-z0-9_$]/i) ? RegExp.$1 : desc;
}

/** Make a symbol sorter by some attribute. */
function makeSortby(attribute) {
	return function(a, b) {
		if (a[attribute] != undefined && b[attribute] != undefined) {
			a = a[attribute].toLowerCase();
			b = b[attribute].toLowerCase();
			if (a < b) return -1;
			if (a > b) return 1;
			return 0;
		}
	}
}

/** Pull in the contents of an external file at the given path. */
function include(path) {
	var path = publish.conf.templatesDir + path;
	return IO.readFile(path);
}

/** Turn a raw source file into a code-hilited page in the docs. */
function makeSrcFile(path, srcDir, name) {
	if (JSDOC.opt.s) return;

	if (!name) {
		name = path.replace(/\.\.?[\\\/]/g, '').replace(/[\\\/]/g, '_');
		name = name.replace(/\:/g, '_');
	}

	var src = {path: path, name: name, charset: IO.encoding, hilited: ''};

	if (defined(JSDOC.PluginManager)) {
		JSDOC.PluginManager.run('onPublishSrc', src);
	}

	if (src.hilited) {
		IO.saveFile(srcDir, name + publish.conf.ext, src.hilited);
	}
}

/** Build output for displaying function parameters. */
function makeSignature(params) {
	if (!params) return '()';
	var signature = '(' + params.filter(
		function($) {
			return $.name.indexOf('.') == -1; // don't show config params in signature
		}
	).map(
		function($) {
			return $.name;
		}
	).join(', ') + ')';
	return signature;
}

/** Find symbol {@link ...} strings in text and turn into html links */
function resolveLinks(str, from) {
	str = str.replace(/\{@link ([^} ]+) ?\}/gi,
		function(match, symbolName) {
			return new Link().toSymbol(symbolName);
		}
	);
	return str;
}
/** generate a url for the wiki **/
function wikiurl(topic, classalias, name) {
	if (JSDOC.opt.D.wikitext && JSDOC.opt.D.wikiurl) {
		topic = (topic) ? topic + ':' : '';
		var icon = (JSDOC.opt.D.wikiicon) ? '<img src="' + JSDOC.opt.D.wikiicon + '"/>' : '';
		return '<div class="wikilink"><a href="' + JSDOC.opt.D.wikiurl + '_' + topic + classalias + '.' + name + '" target="_blank">' + icon + JSDOC.opt.D.wikitext + '</a></div>';
	}
	return '';
}
