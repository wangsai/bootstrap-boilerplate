module.exports = function(grunt) {

	/**
	 * Load required Grunt tasks. These are installed based on the versions listed
	 * in `package.json` when you do `npm install` in this directory.
	 */
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-conventional-changelog');
	grunt.loadNpmTasks('grunt-bump');
	grunt.loadNpmTasks('grunt-recess');
	grunt.loadNpmTasks('grunt-ngmin');
	grunt.loadNpmTasks('grunt-devserver');
	grunt.loadNpmTasks('grunt-open');
	grunt.loadNpmTasks('assemble');

	/**
	 * Load in our build configuration file.
	 */
	var userConfig = require('./build.config.js');

	/**
	 * This is the configuration object Grunt uses to give each plugin its
	 * instructions.
	 */
	var taskConfig = {
		/**
		 * We read in our `package.json` file so we can access the package name and
		 * version. It's already there, so we don't repeat ourselves here.
		 */
		pkg: grunt.file.readJSON("package.json"),

		/**
		 * The banner is the comment that is placed at the top of our compiled
		 * source files. It is first processed as a Grunt template, where the `<%=`
		 * pairs are evaluated based on this very configuration object.
		 */
		meta: {
			banner: '/**\n' + ' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' + ' * <%= pkg.homepage %>\n' + ' *\n' + ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' + ' * Licensed <%= pkg.licenses.type %> <<%= pkg.licenses.url %>>\n' + ' */\n'
		},

		/**
		 * Invoke the browser
		 */
		open: {
			dev: {
				path: 'http://127.0.0.1:8080/pages',
				app: 'Google Chrome'
			},
			google: {
				path: 'http://google.com/',
				app: 'Google Chrome'
			},
			file: {
				path: '/etc/hosts'
			}
		},

		/**
		 * Dev Server Configuration
		 */
		devserver: {
			options: {
				'type': 'http', // <string> (http|https defaults to http)
				'port': 8080, // <port number> (defaults to 8888)
				'base': './build', // <directory> (defaults to .)
				'cache': 'no-cache', // <string> (defaults to 'no-cache')
				'httpsOptions': [], // <object> https.createServer options
				'file': '', // <filename>
				'async': false // <boolean> (defaults to true)
			}
		},

		assemble: {
			options: {
				flatten: 'true',
				assets: 'src/assets',
				partials: 'src/templates/partials/*.hbs',
				layout: 'default.hbs',
				layoutdir: 'src/templates/layouts/',
				data: ['src/data/**/*.{json,yml}']
			},
			pages: {
				src: ['src/pages/*.hbs'],
				dest: '<%= build_dir %>/pages/'
			}
		},

		/**
		 * Creates a changelog on a new version.
		 */
		changelog: {
			options: {
				dest: 'CHANGELOG.md',
				template: 'changelog.tpl'
			}
		},

		/**
		 * Increments the version number, etc.
		 */
		bump: {
			options: {
				files: [
					"package.json",
					"bower.json"
				],
				commit: false,
				commitMessage: 'chore(release): v%VERSION%',
				commitFiles: [
					"package.json",
					"client/bower.json"
				],
				createTag: false,
				tagName: 'v%VERSION%',
				tagMessage: 'Version %VERSION%',
				push: false,
				pushTo: 'origin'
			}
		},

		/**
		 * The directories to delete when `grunt clean` is executed.
		 */
		clean: [
			'<%= build_dir %>',
			'<%= compile_dir %>'
		],

		/**
		 * The `copy` task just copies files from A to B. We use it here to copy
		 * our project assets (images, fonts, etc.) and javascripts into
		 * `build_dir`, and then to copy the assets to `compile_dir`.
		 */
		copy: {
			build_assets: {
				files: [{
					src: ['**'],
					dest: '<%= build_dir %>/assets/',
					cwd: 'src/assets',
					expand: true
				}]
			},
			build_appjs: {
				files: [{
					src: ['<%= app_files.js %>'],
					dest: '<%= build_dir %>/',
					cwd: 'src/assets',
					expand: true
				}]
			},
			build_vendor: {
				files: [{
					src: ['<%= vendor_files.js %>', '<%= vendor_files.css %>', '<%= vendor_files.img %>'],
					dest: '<%= build_dir %>/',
					cwd: '.',
					expand: true
				}]
			},
			compile_assets: {
				files: [{
					src: ['**'],
					dest: '<%= compile_dir %>/assets',
					cwd: '<%= build_dir %>/assets',
					expand: true
				}]
			}
		},

		/**
		 * `grunt concat` concatenates multiple source files into a single file.
		 */
		concat: {
			/**
			 * The `compile_js` target is the concatenation of our application source
			 * code and all specified vendor source code into a single file.
			 */
			compile_js: {
				options: {
					banner: '<%= meta.banner %>'
				},
				src: [
					'<%= vendor_files.js %>',
					'module.prefix',
					'<%= build_dir %>/src/**/*.js',
					'<%= vendor_files.js %>',
					'module.suffix'
				],
				dest: '<%= compile_dir %>/assets/<%= pkg.name %>.js'
			}
		},

		/**
		 * `ng-min` annotates the sources before minifying. That is, it allows us
		 * to code without the array syntax.
		 */
		ngmin: {
			compile: {
				files: [{
					src: ['<%= app_files.js %>', '<%= vendor_files.js %>'],
					cwd: '<%= build_dir %>',
					dest: '<%= build_dir %>',
					expand: true
				}]
			}
		},

		/**
		 * Minify the sources!
		 */
		uglify: {
			compile: {
				options: {
					banner: '<%= meta.banner %>'
				},
				files: {
					'<%= concat.compile_js.dest %>': '<%= concat.compile_js.dest %>'
				}
			}
		},

		/**
		 * `recess` handles our LESS compilation and uglification automatically.
		 * Only our `main.less` file is included in compilation; all other files
		 * must be imported from this file.
		 */
		recess: {
			build: {
				src: ['<%= app_files.less %>'],
				dest: '<%= build_dir %>/assets/css/core.css',
				options: {
					compile: true,
					compress: false,
					noUnderscores: false,
					noIDs: false,
					zeroUnits: false
				}
			},
			compile: {
				src: ['<%= recess.build.dest %>'],
				dest: '<%= recess.build.dest %>',
				options: {
					compile: true,
					compress: true,
					noUnderscores: false,
					noIDs: false,
					zeroUnits: false
				}
			}
		},

		/**
		 * `jshint` defines the rules of our linter as well as which files we
		 * should check. This file, all javascript sources, and all our unit tests
		 * are linted based on the policies listed in `options`. But we can also
		 * specify exclusionary patterns by prefixing them with an exclamation
		 * point (!); this is useful when code comes from a third party but is
		 * nonetheless inside `src/`.
		 */
		jshint: {
			src: [
				'<%= app_files.js %>'
			],
			test: [
				'<%= app_files.jsunit %>'
			],
			gruntfile: [
				'Gruntfile.js'
			],
			options: {
				curly: true,
				immed: true,
				newcap: true,
				noarg: true,
				sub: true,
				boss: true,
				eqnull: true
			},
			globals: {}
		},

		/**
		 * `coffeelint` does the same as `jshint`, but for CoffeeScript.
		 * CoffeeScript is not the default in ngBoilerplate, so we're just using
		 * the defaults here.
		 */
		coffeelint: {
			src: {
				files: {
					src: ['<%= app_files.coffee %>']
				}
			},
			test: {
				files: {
					src: ['<%= app_files.coffeeunit %>']
				}
			}
		},

		/**
		 * And for rapid development, we have a watch set up that checks to see if
		 * any of the files listed below change, and then to execute the listed
		 * tasks when they do. This just saves us from having to type "grunt" into
		 * the command-line every time we want to see what we're working on; we can
		 * instead just leave "grunt watch" running in a background terminal. Set it
		 * and forget it, as Ron Popeil used to tell us.
		 *
		 * But we don't need the same thing to happen for all the files.
		 */
		delta: {
			/**
			 * By default, we want the Live Reload to work for all tasks; this is
			 * overridden in some tasks (like this file) where browser resources are
			 * unaffected. It runs by default on port 35729, which your browser
			 * plugin should auto-detect.
			 */
			options: {
				livereload: true
			},

			/**
			 * When the Gruntfile changes, we just want to lint it. In fact, when
			 * your Gruntfile changes, it will automatically be reloaded!
			 */
			gruntfile: {
				files: 'Gruntfile.js',
				tasks: ['jshint:gruntfile'],
				options: {
					livereload: false
				}
			},

			/**
			 * When our JavaScript source files change, we want to run lint them and
			 * run our unit tests.
			 */
			jssrc: {
				files: [
					'<%= app_files.js %>'
				],
				tasks: ['jshint:src', 'copy:build_appjs']
			},

			/**
			 * When assets are changed, copy them. Note that this will *not* copy new
			 * files, so this is probably not very useful.
			 */
			assets: {
				files: [
					'src/assets/**/*'
				],
				tasks: ['copy:build_assets']
			},

			/**
			 * When the CSS files change, we need to compile and minify them.
			 */
			less: {
				files: ['src/**/*.less'],
				tasks: ['recess:build']
			},

			/**
			 * When a JavaScript unit test file changes, we only want to lint it and
			 * run the unit tests. We don't want to do any live reloading.
			 */
			jsunit: {
				files: [
					'<%= app_files.jsunit %>'
				],
				tasks: ['jshint:test'],
				options: {
					livereload: false
				}
			},

			/**
			 * When a JavaScript unit test file changes, we only want to lint it and
			 * run the unit tests. We don't want to do any live reloading.
			 */
			assemble: {
				files: [
					'src/**/*.hbs'
				],
				tasks: ['assemble'],
				options: {
					livereload: true
				}
			}
		}
	};

	grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));

	/**
	 * In order to make it safe to just compile or copy *only* what was changed,
	 * we need to ensure we are starting from a clean, fresh build. So we rename
	 * the `watch` task to `delta` (that's why the configuration var above is
	 * `delta`) and then add a new task called `watch` that does a clean build
	 * before watching for changes.
	 */
	grunt.renameTask('watch', 'delta');
	grunt.registerTask('watch', ['build', 'devserver', 'open:dev', 'delta']);

	/**
	 * The default task is to build and compile.
	 */
	grunt.registerTask('default', ['build', 'compile']);

	/**
	 * The `build` task gets your app ready to run for development and testing.
	 */
	grunt.registerTask('build', [
		'clean', 'assemble', 'jshint', 'recess:build', 'copy:build_assets', 'copy:build_appjs', 'copy:build_vendor'
	]);

	/**
	 * The `compile` task gets your app ready for deployment by concatenating and
	 * minifying your code.
	 */
	grunt.registerTask('compile', [
		'recess:compile', 'copy:compile_assets', 'ngmin', 'concat', 'uglify'
	]);
};