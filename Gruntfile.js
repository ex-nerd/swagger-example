var path = require('path');

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    watch: {
      livereload: {
        options: {
          base: 'swagger',
          livereload: true,
        },
        files: [
          'swagger-ui/dist/**',
          'swagger/**'
        ],
        tasks: ['copy', 'buildSwagger']
      },
    },

    gitclone: {
      swaggerui: {
        options: {
          repository: 'https://github.com/swagger-api/swagger-ui.git',
          directory: 'swagger-ui'
        }
      }
    },

    gitpull: {
      swaggerui: {
        options: {
          cwd: 'swagger-ui'
        }
      }
    },

    connect: {
      options: {
        hostname: 'localhost',
        port: grunt.option('port') || 1337
      },

      livereload: {
        options: {
          middleware: function(connect) {
            return [
              require('connect-livereload')(),
              connect()
              .use('/', connect.static('site'))
            ];
          }
        }
      }
    },

    open: {
      server: {
        url: 'http://localhost:<%= connect.options.port %>/'
      }
    },

    copy: {
      default: {
        files: [{
            expand: true,
            cwd: 'swagger-ui/dist/',
            src: ['**'],
            dest: 'site/'
          }, {
            expand: true,
            src: ['index.html'],
            dest: 'site/'
          },
          //{expand: true, cwd: 'swagger/', src: ['**'], dest: 'site/swagger/'}
        ]
      }
    },

    buildSwagger: {
      default: {
        options: {
          dir: 'swagger',
          input: 'index.yaml',
          output: 'site/next.yaml',
        }
      },
    },

    verifySwagger: {
      default: {
        options: {
          dir: 'swagger',
          input: 'index.yaml',
        }
      },
    },

  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-git');

  // Clone will fail if the target already exists, so create a separate
  // workflow for the first-run scenario
  if (grunt.file.exists('swagger-ui')) {
    grunt.registerTask('setup', [
      'gitpull:swaggerui',
      'copy',
      'buildSwagger',
    ]);
  } else {
    grunt.registerTask('setup', [
      'gitclone:swaggerui',
      'gitpull:swaggerui',
      'copy',
      'buildSwagger',
    ]);
  }

  grunt.registerTask('server', [
    'copy',
    'buildSwagger',
    'connect:livereload',
    'open',
    'watch'
  ]);
  grunt.registerTask('swag', [
    'buildSwagger'
  ]);
  grunt.registerTask('test', [
    'verifySwagger'
  ]);
  grunt.registerTask('build', [
    'test',
    'setup',
  ]);

  function flattenSwagger(dir, input) {
    var fs = require('fs'); // load the process variable
    var cwd = process.cwd();
    process.chdir(dir);

    var YAML = require('js-yaml');
    var resolveRefs = require('json-refs').resolveRefs;

    var root = YAML.load(fs.readFileSync(input).toString());

    var options = {
      processContent: function(content) {
        grunt.log.debug(JSON.stringify(content));
        return YAML.load(content);
      }
    };
    return resolveRefs(root, options).then(function(results) {
      process.chdir(cwd);
      var errors = [];
      Object.keys(results.metadata).forEach(function(key){
        var meta = results.metadata[key];
        if (meta.err) {
          errors.push('[' + key + '] ' + JSON.stringify(meta));
        }
      });
      if (errors.length === 0) {
        return Promise.resolve(YAML.dump(results.resolved));
      } else {
        return Promise.reject(new Error(errors.join('\n')));
      }
    }, function(err) {
      process.chdir(cwd);
      return Promise.reject(err);
    });
  }

  // http://azimi.me/2015/07/16/split-swagger-into-smaller-files.html
  grunt.registerMultiTask('buildSwagger', 'Build swagger docs into a single file', function() {
    var o = this.options();

    var done = this.async();
    flattenSwagger(o.dir, o.input).then(function(flattened_yaml) {
      grunt.file.write(o.output, flattened_yaml);
      return done();
    }, function(err) {
      return done(err);
    });

  });

  grunt.registerMultiTask('verifySwagger', 'Build swagger docs into a single file', function() {
    var o = this.options();

    var Sway = require('sway');
    var done = this.async();
    Sway.create({
        definition: path.join(__dirname, o.dir, o.input)
      })
      .then(function(swaggerApi) {
        var cwd = process.cwd();
        grunt.fail.warn(JSON.stringify(swaggerApi.references));
        done();
      }, function(err) {
        done(err);
      });

  });

};
