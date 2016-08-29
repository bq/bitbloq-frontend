'use strict';
/*jshint camelcase: false */

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function(grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);
    // Load customs tasks
    grunt.loadTasks('tasks');

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    var pkg = grunt.file.readJSON('package.json');
    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        yeoman: {
            //app: pkg.appPath || 'app',
            //dist: 'dist',
            version: pkg.version || '0.0.0',
            name: pkg.name || 'bitbloqApp',
            contributors: pkg.contributors || '',
            description: pkg.description || '',
            homepage: pkg.homepage || ''
        },

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            options: {
                spawn: false
            },
            bower: {
                files: ['bower.json'],
                tasks: ['wiredep']
            },
            js: {
                files: ['app/scripts/{,*/}*.js', 'Gruntfile.js'],
                tasks: ['newer:jshint:all'],
                options: {
                    livereload: true
                }
            },
            jsTest: {
                files: ['test/unit/{,*/}*.js'],
                tasks: ['newer:jshint:test', 'karma']
            },
            sass: {
                files: ['app/styles/{,**/}*.{scss,sass}'],
                tasks: ['sass']
            },
            livereload: {
                options: {
                    livereload: true
                },
                files: [
                    'app/{,**/}*.html',
                    '.tmp/styles/{,*/}*.css'
                ]
            }
        },

        // The actual grunt server settings
        connect: {
            options: {
                port: 9000,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: '0.0.0.0',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true,
                    middleware: function(connect) {
                        return [
                            connect.static('.tmp'),
                            connect().use(
                                '/bower_components',
                                connect.static('./bower_components')
                            ),
                            connect.static('app')
                        ];
                    }
                }
            },
            test: {
                options: {
                    port: 9001,
                    middleware: function(connect) {
                        return [
                            connect.static('.tmp'),
                            connect.static('test'),
                            connect().use(
                                '/bower_components',
                                connect.static('./bower_components')
                            ),
                            connect.static('app')
                        ];
                    }
                }
            },
            dist: {
                options: {
                    open: false,
                    base: 'dist'
                }
            },
            selenium: {
                options: {
                    open: false,
                    middleware: function(connect) {
                        return [
                            connect.static('.tmp'),
                            connect().use(
                                '/bower_components',
                                connect.static('./bower_components')
                            ),
                            connect.static('app')
                        ];
                    }
                }
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: {
                src: [
                    'Gruntfile.js',
                    'app/scripts/{,*/}*.js',
                    '!app/scripts/vendors/*.js'
                ]
            },
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/spec/{,*/}*.js']
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        'dist/{,*/}*',
                        '!dist/.git{,*/}*'
                    ]
                }]
            },
            server: '.tmp',
            i18n: 'i18n/*'
        },

        // Add vendor prefixed styles

        postcss: {
            options: {
                map: true,
                processors: [
                    require('autoprefixer')({
                        browsers: ['last 2 versions']
                    })
                ]
            },
            dist: {
                src: '.tmp/styles/*.css'
            }
        },
        // Automatically inject Bower components into the app
        wiredep: {
            app: {
                src: ['app/index.html'],
                ignorePath: /\.\.\//,
                exclude: [
                    'bower_components/penguin/lib/js/penguin.min.js',
                    'bower_components/js-beautify/js/lib/beautify-css.js',
                    'bower_components/js-beautify/js/lib/beautify-html.js',
                    'bower_components/ngDialog/css/ngDialog-theme-default.css',
                    'bower_components/textAngular/dist/textAngular.css',
                    'bower_components/ng-tags-input/ng-tags-input.min.css'
                ]
            },
            test: {
                devDependencies: true,
                src: '<%= karma.unit.configFile %>',
                ignorePath: /\.\.\//,
                fileTypes: {
                    js: {
                        block: /(([\s\t]*)\/{2}\s*?bower:\s*?(\S*))(\n|\r|.)*?(\/{2}\s*endbower)/gi,
                        detect: {
                            js: /'(.*\.js)'/gi
                        },
                        replace: {
                            js: '\'{{filePath}}\','
                        }
                    }
                }
            }
            // sass: {
            //     src: ['app/styles/{,*/}*.{scss,sass}'],
            //     ignorePath: /(\.\.\/){1,2}bower_components\//
            // }
        },

        sass: {
            options: {
                sourceMap: true
            },
            all: {
                files: [{
                    '.tmp/styles/main.css': 'app/styles/main.scss'
                }]
            }
        },

        // Renames files for browser caching purposes
        filerev: {
            dist: {
                src: [
                    'dist/scripts/{,*/}*.js',
                    'dist/styles/{,*/}*.css',
                    'dist/styles/fonts/*'
                ]
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: 'app/index.html',
            options: {
                dest: 'dist',
                flow: {
                    html: {
                        steps: {
                            js: ['concat', 'uglifyjs'],
                            css: ['cssmin']
                        },
                        post: {}
                    }
                }
            }
        },

        // Performs rewrites based on filerev and the useminPrepare configuration
        usemin: {
            html: ['dist/**/*.html'],
            css: ['dist/styles/{,*/}*.css'],
            options: {
                assetsDirs: [
                    'dist',
                    'dist/images',
                    'dist/images/icons',
                    'dist/styles'
                ]
            }
        },

        // The following *-min tasks will produce minified files in the dist folder
        // By default, your `index.html`'s <!-- Usemin block --> will take care of
        // minification. These next options are pre-configured if you do not wish
        // to use the Usemin blocks.

        // cssmin: {
        //     dist: {
        //         files: {
        //             'dist/styles/main.css': [
        //                 '.tmp/styles/{,*/}*.css'
        //             ]
        //         }
        //     }
        // },

        // uglify: {
        //     dist: {
        //         files: {
        //             'dist/scripts/scripts.js': ['.tmp/scripts/scripts.js'],
        //             'dist/scripts/vendor.js': ['.tmp/scripts/vendor.js']
        //         }
        //     }
        // },

        // imagemin: {
        //     dist: {
        //         files: [{
        //             expand: true,
        //             cwd: 'app/images',
        //             src: '**/*.{png,jpg,jpeg,gif}',
        //             dest: 'dist/images'
        //         }]
        //     }
        // },
        //
        //

        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    removeComments: true
                        // preserveLineBreaks:true,
                        // conservativeCollapse: true,
                        // collapseBooleanAttributes: true,
                        // removeCommentsFromCDATA: true,
                        // removeOptionalTags: true
                },
                files: [{
                    expand: true,
                    cwd: 'dist',
                    src: ['*.html', 'views/**/*.html', '!google0e0d0e0b7164c58a.html'],
                    dest: 'dist'
                }]
            }
            // testfile: {
            //     options: {
            //         collapseWhitespace: true,
            //         removeComments: true,
            //     },
            //     files: [{
            //         expand: true,
            //         cwd: 'dist',
            //         src: ['views/code.html'],
            //         dest: 'dist2'
            //     }]
            // }
        },

        svgstore: {
            options: {
                svg: {
                    viewBox: '0 0 100 100',
                    xmlns: 'http://www.w3.org/2000/svg',
                    'xmlns:xlink': 'http://www.w3.org/1999/xlink'
                },
                includedemo: true,
                formatting: {
                    indent_size: 2
                },
                cleanup: true
            },
            dev: {
                files: [{
                    src: 'app/images/icons/{,*/}*.svg',
                    dest: '.tmp/images/sprite.svg'
                }]
            }
        },

        // ng-annotate tries to make the code safe for minification automatically
        // by using the Angular long form for dependency injection.
        ngAnnotate: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/concat/scripts',
                    src: '*.js',
                    dest: '.tmp/concat/scripts'
                }]
            }
        },

        // Replace Google CDN references
        // cdnify: {
        //     dist: {
        //         html: ['dist/*.html']
        //     }
        // },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: 'app',
                    dest: 'dist',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        '*.html',
                        'views/{,*/}*.html',
                        'styles/ajax-loader.gif',
                        'styles/fonts/{,*/}*.*',
                        'res/locales/*.*',
                        'res/config/{,*/}*.*',
                        'static/*.json',
                        'images/**/*.{webp,svg,jpg,png,gif,ico}'
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/images',
                    dest: 'dist/images',
                    src: ['*.svg']
                }, {
                    expand: true,
                    cwd: '.tmp/styles',
                    dest: 'dist/styles/',
                    src: '{,*/}*.{css,gif}'
                }, {
                    expand: true,
                    cwd: 'bower_components/jspanel/source/fonts',
                    dest: 'dist/styles/fonts/',
                    src: '*.*'
                }]
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            server: [
                'sass',
                'svgstore:dev'
            ],
            test: [
                'sass'
            ],
            dist: [
                'sass',
                'svgstore:dev'
            ]
        },

        ngconstant: {
            // Options for all targets
            options: {
                space: '  ',
                wrap: '/* jshint ignore:start */\'use strict\';\n\n {%= __ngModule %}/* jshint ignore:end */',
                name: 'config',
                constants: {
                    packageData: '<%= yeoman %>',
                    bowerData: grunt.file.readJSON('bower.json')
                },
                dest: 'app/res/config/config.js'
            }
        },

        release: {
            /* For more options: https://github.com/geddski/grunt-release#options */
            options: {
                additionalFiles: ['bower.json'],
                indentation: '\t', //default: '  ' (two spaces)
                commitMessage: 'Release v<%= version %>', //default: 'release <%= version %>'
                tagMessage: 'v<%= version %>', //default: 'Version <%= version %>',
                tagName: 'v<%= version %>'
            }
        },

        aws_s3: {
            options: {
                region: 'eu-west-1',
                uploadConcurrency: 5,
                gzip: true,
                excludedFromGzip: ['*.png', '*.jpg', '*.jpeg', '*.ico', '*.mp4', '*.avi', '*.mp3', '*.ogg', '*.ogm', '*.webm', '*.webp'],
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            },
            deploy: {
                options: {
                    differential: true
                },
                files: [{
                    action: 'upload',
                    expand: true,
                    cwd: 'dist',
                    src: ['**'],
                    exclude: [
                        '**/*.html',
                        'src/resources/locales/*.json'
                    ],
                    dest: '',
                    params: {
                        CacheControl: '2592000'
                    }
                }, {
                    action: 'upload',
                    expand: true,
                    cwd: 'dist',
                    src: [
                        '**/*.html',
                        'src/resources/locales/*.json'
                    ],
                    dest: ''
                }]
            }
        },

        /* Unit Testing tasks config */
        karma: {
            unit: {
                configFile: 'test/unit/karma.conf.js',
                singleRun: true
            }
        },
        shell: {
            xvfb: {
                command: 'Xvfb :99 -ac -screen 0 1024x768x24',
                options: {
                    async: true
                }
            }
        },
        env: {
            xvfb: {
                DISPLAY: ':99'
            }
        },
        htmlangular: {
            options: {
                tmplext: 'html.tmpl',
                customtags: [
                    'common-dropdown'
                ],
                customattrs: [],
                relaxerror: [
                    //'Start tag seen without seeing a doctype first. Expected e.g. “<!DOCTYPE html>”.'
                ],
                reportpath: 'target/html-angular-validate-report.json',
                reportCheckstylePath: 'target/html-angular-validate-report-checkstyle.xml'
            },
            files: {
                src: ['app/index.html']
                    //src: ['app/**/*.html']
            }
        },
        addTimestampToFiles: {
            dist: {
                htmlFiles: ['dist/**/*.html', '!dist/index.html', '!dist/google0e0d0e0b7164c58a.html'],
                localeFiles: ['dist/res/locales/*.json'],
                configFiles: ['dist/res/config/**/*.json'],
                imageFiles: ['dist/images/**/*.{svg,png,jpg,ico}'],
                staticFiles: ['dist/static/*.json'],
                replaceHtmlNames: ['dist/**/*.{html,js}'],
                replaceLocaleNames: ['dist/**/*.js'],
                replaceConfigNames: ['dist/**/*.js'],
                replaceImageNames: ['dist/**/*.{html,js,scss,css, json}'],
                replaceStaticNames: ['dist/**/*.js'],
                replaceAngularHTMLFiles: ['dist/**/*.html']
            }
        }
    });

    grunt.registerTask('prepareServer', 'Prepare dev web server', [
        'clean:server',
        'generateConstantsFileWithConfig',
        'wiredep:app'
    ]);

    grunt.registerTask('serve', 'Compile then start a connect web server', function(target) {

        if (target === 'dist') {
            return grunt.task.run(['dist', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'prepareServer',
            'concurrent:server',
            'postcss:dist',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function(target) {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve:' + target]);
    });

    grunt.registerTask('generateConfigFiles', 'Configure data files', function(env) {
        var environment = env || 'local';

        grunt.task.run([
            'generateConfig:' + environment,
            'generateGoogle:' + environment,
            'generateFacebook:' + environment
        ]);
    });

    grunt.registerTask('generateConfig', 'Configure data files', function(env) {

        var environment = env || 'qa',
            configJSON;

        switch (environment) {
            case 'production':
                configJSON = process.env.BITBLOQ_PROD_CONFIG;
                break;
            case 'qa':
                configJSON = process.env.BITBLOQ_QA_CONFIG;
                break;
            default:
                configJSON = process.env.BITBLOQ_QA_CONFIG;

        }

        var file = 'app/res/config/config.json';

        grunt.file.write(file, configJSON);
    });

    grunt.registerTask('generateFacebook', 'Configure data files', function(env) {

        var environment = env || 'qa',
            configJSON;

        switch (environment) {
            case 'production':
                configJSON = process.env.BITBLOQ_PROD_FACEBOOK;
                break;
            case 'qa':
                configJSON = process.env.BITBLOQ_QA_FACEBOOK;
                break;
            default:
                configJSON = process.env.BITBLOQ_QA_FACEBOOK;

        }

        var file = 'app/res/config/facebook.json';

        grunt.file.write(file, configJSON);
    });

    grunt.registerTask('generateGoogle', 'Configure data files', function(env) {

        var environment = env || 'qa',
            configJSON;

        switch (environment) {
            case 'production':
                configJSON = process.env.BITBLOQ_PROD_GOOGLE;
                break;
            case 'qa':
                configJSON = process.env.BITBLOQ_QA_GOOGLE;
                break;
            default:
                configJSON = process.env.BITBLOQ_QA_GOOGLE;

        }

        var file = 'app/res/config/google.json';

        grunt.file.write(file, configJSON);
    });

    grunt.registerTask('dist', function() {
        grunt.task.run([
            'clean:dist',
            'wiredep',
            'generateConstantsFileWithConfig',
            'useminPrepare',
            'concurrent:dist',
            'postcss:dist',
            'concat',
            'ngAnnotate:dist',
            'copy:dist',
            // 'cdnify',
            'cssmin',
            'uglify',
            'filerev',
            'usemin',
            'htmlmin',
            'addTimestampToFiles'
        ]);
    });

    grunt.registerTask('distGCS', function() {
        grunt.task.run([
            'clean:dist',
            'wiredep',
            'useminPrepare',
            'concurrent:dist',
            'postcss:dist',
            'concat',
            'ngAnnotate:dist',
            'copy:dist',
            // 'cdnify',
            'cssmin',
            'uglify',
            'filerev',
            'usemin',
            'htmlmin',
            'addTimestampToFiles'
        ]);
    });

    grunt.registerTask('deploy', 'Deploy app to s3', function(env) {

        var configFile = grunt.option('config') || 'app/res/config/config.json';
        var configData = grunt.file.readJSON(configFile);

        grunt.config.set('aws_s3.deploy.options.bucket', configData.bucket);

        grunt.task.run('dist:' + env);

        // Run deploy task
        grunt.task.run(['aws_s3']);
    });

    /* Test tasks */

    // grunt.registerTask('test', [
    //     'clean:server',
    //     'wiredep:test',
    //     'ngconstant:local',
    //     'concurrent:test',
    //     'postcss:dist',
    //     'connect:test',
    //     'karma'
    // ]);

    /**
     * To export to bq translaters:
     * grunt clean:i18n && grunt getpoeditorfiles:38967:xliff:untranslated:bitbloq_ && grunt getpoeditorfiles:42730:xliff:untranslated:bloqs_ && grunt getpoeditorfiles:38968:xliff:untranslated:faqs_ && grunt getpoeditorfiles:39968:xliff:untranslated:changelog_
     */

    grunt.registerTask('i18n', 'get all file of i18n', function() {
        grunt.task.run([
            'clean:i18n',
            'getpoeditorfiles:38967',
            'poeditor2bitbloq'
        ]);
    });

    grunt.registerTask('poeditorbackup', 'backup all poeditor projects', function() {
        var date = new Date();
        var dateFormat = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '_' + date.getHours() + '-' + date.getMinutes();
        grunt.task.run([
            'poeditorprojectbackup:38967:' + dateFormat,
            'poeditorprojectbackup:38968:' + dateFormat,
            'poeditorprojectbackup:39968:' + dateFormat,
            'poeditorprojectbackup:42730:' + dateFormat
        ]);
    });

    grunt.registerTask('getbloqsfrombranch', function(branch) {
        branch = branch || 'master';
        var done = this.async(),
            https = require('https');
        https.get('https://raw.githubusercontent.com/bq/bloqs/' + branch + '/dist/list.json').on('response', function(response) {
            var body = '';
            var i = 0;
            response.on('data', function(chunk) {
                i++;
                body += chunk;
            });
            response.on('end', function() {
                if (body.length) {
                    grunt.log.oklns('get Bloqs done!');
                    grunt.file.write('dataBaseFiles/bloq/bloq.json', body);
                } else {
                    grunt.log.error('No se han conseguido bloques');
                }
                done();
            });
        });
    });

    grunt.registerTask('getbloqs', function() {
        var bloqsFile = grunt.file.readJSON('./bower_components/bloqs/dist/list.json');
        grunt.file.write('dataBaseFiles/bloq/bloq.json', JSON.stringify(bloqsFile));
    });

    grunt.registerTask('prepareversion', function(version) {
        if (version) {
            grunt.task.run([
                'i18n',
                'getbloqs'
            ]);

            var productionConfigFile = grunt.file.readJSON('app/res/config/config.json');
            productionConfigFile.version = version;
            grunt.file.write('app/res/config/config.json', JSON.stringify(productionConfigFile, null, 4));
            console.log('Production version file changed');

            var bowerFile = grunt.file.readJSON('bower.json');
            bowerFile.version = version;
            grunt.file.write('bower.json', JSON.stringify(bowerFile, null, 4));
            console.log('Bower version changed');

            var packageFile = grunt.file.readJSON('package.json');
            packageFile.version = version;
            grunt.file.write('package.json', JSON.stringify(packageFile, null, 4));
            console.log('Package version changed');
        } else {
            grunt.fail.fatal('We need a version! ej: v2.1.5');
        }
    });

    var getAllFiles = function(source) {
        var files = [];
        grunt.file.expand(source).forEach(function(file) {
            if (grunt.file.isDir(file)) {
                grunt.file.recurse(file, function(f) {
                    files = files.concat(getAllFiles(f));
                });
            } else {
                files.push({
                    path: file.substring(0, file.lastIndexOf('/')),
                    name: file.replace(/^.*[©\\/]/, '')
                });
            }
        });
        return files;
    };

    var replaceFileName = function(oldName, newName, sources) {
        var fileContent = '';
        grunt.file.expand(sources).forEach(function(file) {
            if (grunt.file.isDir(file)) {
                grunt.file.recurse(file, function(f) {
                    replaceFileName(oldName, newName, f);
                });
            } else {
                grunt.log.writeln('Replacing ' + oldName + ' to ' + newName + ' in ' + file);
                var regExp = new RegExp('([\'|/|"])' + oldName, 'g');
                fileContent = grunt.file.read(file);
                grunt.file.write(file, fileContent.replace(regExp, '$1' + newName));
            }
        });
    };

    var replaceAngularHTMLFile = function(timestamp, sources) {
        var fileContent = '';
        grunt.file.expand(sources).forEach(function(file) {
            if (grunt.file.isDir(file)) {
                grunt.file.recurse(file, function(f) {
                    replaceFileName(timestamp, f);
                });
            } else {
                grunt.log.writeln('Replacing Force with ' + timestamp + ' in ' + file);
                var regExp = new RegExp('ng-src="[A-Za-z/]*{{[A-Za-z/.]*}}.(svg|png|jpg|ico)', 'g');
                fileContent = grunt.file.read(file);
                grunt.file.write(file, fileContent.replace(regExp, function(stringReplace) {
                    var stringArray = stringReplace.split('{{');
                    return stringArray[0] + timestamp + '.{{' + stringArray[1];
                }));
            }
        });
    };

    var replaceForceComponent = function(timestamp, sources) {
        var fileContent = '';
        grunt.file.expand(sources).forEach(function(file) {
            if (grunt.file.isDir(file)) {
                grunt.file.recurse(file, function(f) {
                    replaceFileName(timestamp, f);
                });
            } else { // /images/components/
                grunt.log.writeln('Replacing Force with ' + timestamp + ' in ' + file);
                var regExp = new RegExp('/images/(components|boards|robots)/[A-Za-z.+\'\" ]*.(svg|png|jpg|ico)', 'g');
                fileContent = grunt.file.read(file);
                grunt.file.write(file, fileContent.replace(regExp, function(stringReplace) {
                    var splitString = stringReplace.split('images/')[1].split('/')[0],
                        stringArray = stringReplace.split(splitString + '/');
                    return stringArray[0] + splitString + '/' + timestamp + '.' + stringArray[1];
                }));
            }
        });
    };

    grunt.task.registerMultiTask('addTimestampToFiles', 'Add timestamps to html, locale, config, image and static files', function() {
        grunt.log.writeln(this.target + ': ' + this.data);
        var timestamp = Date.now(),
            fs = require('fs'),
            htmlFiles = getAllFiles(this.data.htmlFiles),
            localeFiles = getAllFiles(this.data.localeFiles),
            configFiles = getAllFiles(this.data.configFiles),
            imageFiles = getAllFiles(this.data.imageFiles),
            staticFiles = getAllFiles(this.data.staticFiles);
        console.log(htmlFiles);
        console.log(localeFiles);
        console.log(configFiles);
        console.log(imageFiles);
        console.log(staticFiles);
        var newName = '';
        var i;

        for (i = 0; i < htmlFiles.length; i++) {
            newName = timestamp + '.' + htmlFiles[i].name;
            fs.renameSync(htmlFiles[i].path + '/' + htmlFiles[i].name, htmlFiles[i].path + '/' + newName);
            replaceFileName(htmlFiles[i].name, newName, this.data.replaceHtmlNames);
        }
        replaceAngularHTMLFile(timestamp, this.data.replaceAngularHTMLFiles);

        for (i = 0; i < localeFiles.length; i++) {
            newName = timestamp + '.' + localeFiles[i].name;
            fs.renameSync(localeFiles[i].path + '/' + localeFiles[i].name, localeFiles[i].path + '/' + newName);
        }
        replaceFileName('res/locales/', 'res/locales/' + timestamp + '.', this.data.replaceLocaleNames);

        for (i = 0; i < configFiles.length; i++) {
            newName = timestamp + '.' + configFiles[i].name;
            fs.renameSync(configFiles[i].path + '/' + configFiles[i].name, configFiles[i].path + '/' + newName);
            replaceFileName(configFiles[i].name, newName, this.data.replaceConfigNames);
        }

        for (i = 0; i < imageFiles.length; i++) {
            newName = timestamp + '.' + imageFiles[i].name;
            fs.renameSync(imageFiles[i].path + '/' + imageFiles[i].name, imageFiles[i].path + '/' + newName);
            replaceFileName(imageFiles[i].name, newName, this.data.replaceImageNames);
        }

        for (i = 0; i < staticFiles.length; i++) {
            newName = timestamp + '.' + staticFiles[i].name;
            fs.renameSync(staticFiles[i].path + '/' + staticFiles[i].name, staticFiles[i].path + '/' + newName);
            replaceFileName(staticFiles[i].name, newName, this.data.replaceStaticNames);
        }
        replaceForceComponent(timestamp, this.data.replaceStaticNames);
    });

    grunt.registerTask('updateAllCollections', function() {
        grunt.task.run([
            'updateCollection:bloq',
            'updateCollection:property',
            'updateCollection:forumcategory'
        ]);
    });

    grunt.registerTask('generateConstantsFileWithConfig', function() {
        var configFile = grunt.file.readJSON('app/res/config/config.json'),
            facebookFile = grunt.file.readJSON('app/res/config/facebook.json'),
            googleFile = grunt.file.readJSON('app/res/config/google.json');

        grunt.config('ngconstant.local.constants.envData', {
            config: configFile,
            facebook: facebookFile,
            google: googleFile
        });

        grunt.task.run([
            'ngconstant:local'
        ]);
    });
};