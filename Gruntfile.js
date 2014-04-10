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
                }]
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');


};
