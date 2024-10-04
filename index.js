/**
 * @description The live2donweb generator for hexo
 */
/* global hexo */


const _ = require('lodash');
const fs = require('hexo-fs');
const path = require('path');
const url = require('url');

const buildGeneratorsFromManifest = require('./lib/buildGeneratorsFromManifest');
const getFileMD5 = require('./lib/getFileMD5');
const getNodeModulePath = require('./lib/getNodeModulePath');
const loadModelFrom = require('./lib/loadModelFrom');
const print = require('./lib/print');

const generators = [];

const coreScriptName = 'live2d_bundle.js';
const coreScriptPath = require.resolve('live2dweb/dist/live2d_bundle.js');
const waifuScriptName = 'waifu-tips.js';
const waifuScriptPath = require.resolve('./waifu-tips.js');
const thisPkgInfo = require('./package');
const buildGenerator = require('./lib/buildGenerator');
const widgetVer = thisPkgInfo.dependencies['live2dweb'];
const localWidgetVer = require(path.resolve(require.resolve('live2dweb'), '../../', 'package')).version;

const blogRoot = hexo.config.root || '/';

const defaultConfig = {
  'enable': true,
  'log': false,
  'pluginJsPath': 'lib/',
  'pluginModelPath': 'assets/',
  'pluginRootPath': 'live2dw/',
  'scriptFrom': 'local',
  'tagMode': false,
};

// Apply options with default
let config = _.defaultsDeep({
}, hexo.config.live2d, hexo.theme.config.live2d, defaultConfig);

/**
 * Get entry point script URL according to type of source
 * @param  {String} scriptFrom The type of source
 * @return {String}            URL of entry point
 */
function getScriptURL (scriptFrom) { // eslint-disable-line max-lines-per-function

  if (config.log) {

    print.log(`hexo-helper-live2d-onweb@${thisPkgInfo.version}, using live2dweb@${widgetVer}.`);

  }

  switch (scriptFrom) {

  case 'local': {

    /*
     * Is local(1)
     * Use local
     */
    if (config.log) {

      print.log(`use local live2dweb@${localWidgetVer}`);

    }
    const scriptGenerators = [buildGenerator(coreScriptPath,url.resolve(`${config.pluginRootPath}${config.pluginJsPath}`,coreScriptName))];
    const useHash = getFileMD5(coreScriptPath);
    generators.push(...scriptGenerators);
    return `${blogRoot}${url.resolve(`${config.pluginRootPath}${config.pluginJsPath}`, coreScriptName)}?${useHash}`;

  }
  case 'jsdelivr':

    /*
     * Is jsdelivr online CDN(2)
     * Use jsdelivr
     */
    return `https://cdn.jsdelivr.net/npm/Live2dOnWeb@${widgetVer}/lib/${coreScriptName}`;
  case 'unpkg':

    /*
     * Is unpkg online CDN(3)
     * Use unpkg
     */
    return `https://unpkg.com/Live2dOnWeb@${widgetVer}/lib/${coreScriptName}`;
  default:

    /*
     * Is custom(4)
     * Use custom
     */
    return scriptFrom;

  }

}

if (config.enable) {

  _.unset(config, 'enable');
  if (_.hasIn(config, 'model.use')) {

    let modelJsonUrl = null;
    let tryPath = path.resolve(hexo.base_dir, './live2d_models/', config.model.use);
    if (fs.existsSync(tryPath)) { // eslint-disable-line no-sync

      /*
       * Is in live2d_models(2)
       * LoadModelFrom
       */
      const {
        modelGenerators,
        'modelJsonUrl': pkgModelJsonUrl,
      } = loadModelFrom(tryPath, `${config.pluginRootPath}${config.pluginModelPath}`);
      modelJsonUrl = `${blogRoot}${pkgModelJsonUrl}`;
      generators.push(...modelGenerators);
      if (config.log) {

        print.log(`Loaded model from live2d_models folder(2), '${url.parse(modelJsonUrl).pathname}' from '${tryPath}'`);

      }

    } else {

      tryPath = path.resolve(hexo.base_dir, config.model.use);
      if (fs.existsSync(tryPath)) { // eslint-disable-line no-sync

        /*
         * Is in hexo base releated path(3)
         * LoadModelFrom
         */
        const {
          modelGenerators,
          'modelJsonUrl': pkgModelJsonUrl,
        } = loadModelFrom(tryPath, `${config.pluginRootPath}${config.pluginModelPath}`);
        modelJsonUrl = `${blogRoot}${pkgModelJsonUrl}`;
        generators.push(...modelGenerators);
        if (config.log) { // eslint-disable-line max-depth

          print.log(`Loaded model from hexo base releated path(3), '${url.parse(modelJsonUrl).pathname}' from '${tryPath}'`);

        }

      } else if (getNodeModulePath(config.model.use) === null) {

        /*
         * Is custom(4)
         * Use custom
         */
        modelJsonUrl = config.model.use;
        if (config.log) { // eslint-disable-line max-depth

          print.log(`Loaded Model from custom(4), at '${modelJsonUrl}'`);

        }

      } else {

        /*
         * Is npm-module(1)
         * Convert path to assets folder
         * LoadModelFrom
         */
        const packageJsonPath = path.resolve(getNodeModulePath(config.model.use), 'package.json');
        const packageJsonObj = require(packageJsonPath); // eslint-disable-line global-require
        const assetsDir = path.resolve(getNodeModulePath(config.model.use), config.pluginModelPath);
        const {
          modelGenerators,
          'modelJsonUrl': pkgModelJsonUrl,
        } = loadModelFrom(assetsDir, `${config.pluginRootPath}${config.pluginModelPath}`);
        modelJsonUrl = `${blogRoot}${pkgModelJsonUrl}`;
        generators.push(...modelGenerators);
        if (config.log) { // eslint-disable-line max-depth

          print.log(`Loaded model from npm-module(1), ${packageJsonObj.name}@${packageJsonObj.version} from '${assetsDir}'`);

        }

      }

    }
    if (modelJsonUrl === null) {

      print.error('Did not found model json');

    }
    _.unset(config, 'model.use');

    var modelVersion = modelJsonUrl.endsWith('.model3.json') ? 3 : 2;

    config = _.set(config, 'live2d_models', [{
      name: config.live2d_settings.modelName,                                     // 模型名称要与文件夹名相同
      message: '',  // 切换时的提示信息
      version: modelVersion,                                         // 模型版本，model3.json 结尾的都填3，model.json 结尾的填2
      // position: 'left'                                 // 此模型的显示位置，会覆盖上面的全局设置，只对此模型生效
    }],);

    config = _.set(config, 'live2d_settings.modelUrl', modelJsonUrl.replace(/\/[^\/]*\/[^\/]+\.model(3)?\.json$/, '/'));

  }

  var scriptGenerators = [buildGenerator(waifuScriptPath,url.resolve(`${config.pluginRootPath}${config.pluginJsPath}`,waifuScriptName))];
  generators.push(...scriptGenerators);

  const scriptUrlToInject = getScriptURL(config.scriptFrom);
  _.unset(config, 'scriptFrom');
  const waifuUrlToInject = `${blogRoot}${url.resolve(`${config.pluginRootPath}${config.pluginJsPath}`,waifuScriptName)}`;

  if (config.tagMode) {

    hexo.extend.helper.register('live2d', () => {

      if (config.log) {

        print.log('live2d tag detected, use tagMode.');

      }
      const scriptToInject = `live2d_settings=${JSON.stringify(config.live2d_settings)};live2d_models=${JSON.stringify(config.live2d_models)};`
      const contentToInject = `\
        <div id="waifu">\
            <div id="waifu-message"></div>\
            <div class="waifu-tool">\
                <span class="icon-next"></span>\
                <span class="icon-home"></span>\
                <span class="icon-message"></span>\
                <span class="icon-camera"></span>\
                <span class="icon-volumeup"></span>\
                <span class="icon-volumedown"></span>\
                <span class="icon-about"></span>\
                <span class="icon-cross"></span>\
            </div>\
            <canvas id="live2d2"></canvas>\
            <canvas id="live2d4"></canvas>\
        </div>\\
        <script>${scriptToInject}</script>\
        <script src="${scriptUrlToInject}"></script>\
        <script async type="module" src="${waifuUrlToInject}"></script>\
        `;
      return contentToInject;

    });

  } else {

    hexo.extend.helper.register('live2d', () => {

      print.warn('live2d tag detected, but won\'t be use. Make sure \'tagMode\' config is expected. See #36, #122.');

    });

  }

  /*
   * Injector borrowed form here:
   * https://github.com/Troy-Yang/hexo-lazyload-image/blob/master/lib/addscripts.js
   */
  if (!config.tagMode) {
    hexo.extend.filter.register('after_render:html', (htmlContent) => {

      const scriptToInject = `live2d_settings=${JSON.stringify(config.live2d_settings)};live2d_models=${JSON.stringify(config.live2d_models)};`;
      const contentToInject = `\
        <div id="waifu">\
            <div id="waifu-message"></div>\
            <div class="waifu-tool">\
                <span class="icon-next"></span>\
                <span class="icon-home"></span>\
                <span class="icon-message"></span>\
                <span class="icon-camera"></span>\
                <span class="icon-volumeup"></span>\
                <span class="icon-volumedown"></span>\
                <span class="icon-about"></span>\
                <span class="icon-cross"></span>\
            </div>\
            <canvas id="live2d2"></canvas>\
            <canvas id="live2d4"></canvas>\
        </div>\
        <script>${scriptToInject}</script>\
        <script src="${scriptUrlToInject}"></script>\
        <script async type="module" src="${waifuUrlToInject}"></script>\
        `;
      let newHtmlContent = htmlContent;
      if ((/([\n\r\s\t]*<\/body>)/i).test(htmlContent)) {

        const lastIndex = htmlContent.lastIndexOf('</body>');
        newHtmlContent = `${htmlContent.substring(0, lastIndex)}${contentToInject}${htmlContent.substring(lastIndex, htmlContent.length)}`; // eslint-disable-line no-magic-numbers

      }
      return newHtmlContent;

    });

  }

  hexo.extend.generator.register('live2d', () => generators);

}
