module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    browsers: ['ChromeHeadless'],
    reporters: ['progress'],
    restartOnFileChange: true,
    singleRun: true,
    browserNoActivityTimeout: 120000,
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 2,
    captureTimeout: 120000,
    client: {
      clearContext: false,
      jasmine: {
        random: false,
      },
    },
  });
};
