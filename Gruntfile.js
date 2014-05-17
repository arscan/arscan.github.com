module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            options: {
                livereload: true
            },
            files: ['index.html']
        },
        copy: {
            main : {
                files: [
                { 
                    expand: true,
                    cwd: 'node_modules/hexasphere.js/',
                    src: '**',
                    dest: 'hexasphere/'
                },
                { 
                    expand: true,
                    cwd: 'node_modules/encom-globe/',
                    src: '**',
                    dest: 'encom-globe/'
                },
                { 
                    expand: true,
                    cwd: 'node_modules/encom-boardroom/',
                    src: '**',
                    dest: 'encom-boardroom/'
                }
                ]
            }
        },
        htmlrefs: {
            dist: {
                files: [
                    {
                    src: "./hexasphere/index.html",
                    dest: "./hexasphere/index.html"
                },
                {
                    src: "./encom-globe/index.html",
                    dest: "./encom-globe/index.html"
                },
                {
                    src: "./encom-boardroom/index.html",
                    dest: "./encom-boardroom/index.html"
                }],
                options: {
                    includes: {
                        analytics: './ga.inc.html'
                    }
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-htmlrefs');

    grunt.registerTask('build', ['copy', 'htmlrefs']);

};
