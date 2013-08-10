/**
 * This file/module contains all configuration for the build process.
 */
module.exports = {
  /**
   * The `build_dir` folder is where our projects are compiled during
   * development and the `compile_dir` folder is where our app resides once it's
   * completely built.
   */
  build_dir: 'build',
  compile_dir: 'bin',

  /**
   * This is a collection of file patterns that refer to our app code (the
   * stuff in `src/`). These file paths are used in the configuration of
   * build tasks.
   */
  app_files: {
    js: 'src/js/core.js',
    jsunit: 'src/js/core.js.unit',
    less: 'src/less/core.less'
  },

  /**
   * This is the same as `app_files`, except it contains patterns that
   * reference vendor code (`vendor/`) that we need to place into the build
   * process somewhere.
   */
  vendor_files: {
    js: [
      'vendor/bootstrap/js/*.js',
      'vendor/bootstrap/assets/js/*.js',
      'vendor/bootstrap/dist/js/*.js'
    ],
    css: [
      'vendor/bootstrap/assets/css/*.css',
      'vendor/bootstrap/dist/css/*.css'
    ],
    img:[
      'vendor/bootstrap/assets/ico/*.png'
    ]
  },
};
