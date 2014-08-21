/*jshint camelcase: false*/
// Generated on 2013-11-03 using generator-chromeapp 0.2.3
'use strict';

/*
var mountFolder = function(connect, dir) {
  return connect.static(require('path').resolve(dir));
};
*/

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function(grunt) {
  // show elapsed time at the end
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  // configurable paths
  var yeomanConfig = {
    app: 'app',
    dist: 'dist'
  };

  // configurable paths
  var nwConfig = {
    app: 'dist',
    dist: 'distNw',
    tmp: 'tmp',
    resources: 'resources'
  };

  grunt.initConfig({
    yeoman: yeomanConfig,
    nwConfig: nwConfig,
    watch: {
      options: {
        spawn: false
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/scripts/{,*/}*.js',
        'test/spec/{,*/}*.js'
      ]
    },
    ngAnnotate: {
        options: {
          singleQuotes: true,
        },
        generated: {
          files: {
            '.tmp/concat/scripts/julep.js': ['.tmp/concat/scripts/julep.js']
          }
        }
    },
    uglify: {
      options: {
        sourceMap: true
      }
    },
    useminPrepare: {
      options: {
        dest: '<%= yeoman.dist %>',
        flow: {
          steps: {
            jslib: ['concat'],
            js: ['concat', 'uglifyjs'],
            css: ['concat', 'cssmin']
          },
          post: {}
        }
      },
      html: '<%= yeoman.app %>/julep.html'
    },

    usemin: {
      html: '<%= yeoman.dist %>/julep.html',
      options: {
        blockReplacements: {
          jslib: function (block) {
            return '<script src="' + block.dest + '"></script>';
          }
        }
      }
    // css: '<%= yeoman.dist %>/styles/{,*/}*.css'
    },

    // Put files not handled in other tasks here
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            'images/{,*/}*.{webp,gif}',
            '_locales/{,*/}*.json',
            'manifest.json'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/images',
          src: [
            'generated/*'
          ]
        }, {
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: ['package.json','julep.html'],
          dest: '<%= yeoman.dist %>'
        }, {
          expand: true,
          cwd: '<%= yeoman.app %>/partials',
          src: ['*.html'],
          dest: '<%= yeoman.dist %>/partials'
        }]
      }
    },
    nodewebkit: {
      options: {
          platforms: ['win','osx'],
          buildDir: '<%= nwConfig.dist %>', // Where the build version of my node-webkit app is saved
      },
      src: ['<%= yeoman.dist %>/*'] // Your node-webkit app
    }
  });


  grunt.registerTask('build', [
    'clean:dist',
    'useminPrepare',
    'concat:generated',
    'ngAnnotate:generated',
    'uglify:generated',
    'cssmin:generated',
    'copy:dist',
    'usemin'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'build'
  ]);

  grunt.registerTask('nw', [
    'jshint',
    'build',
    'nodewebkit'
  ]);
};
