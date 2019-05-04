#! /usr/bin/env node
const shell = require("shelljs");
const chalk = require("chalk");
const constants = require("../common/constants");
const PakhshkitRepoController = require("../controllers/pakhshkit-repo-controller");
const VidiunPlayerRepoController = require("../controllers/vidiun-player-repo-controller");
const Utils = require("../common/utils");
const PkgJsonParser = require("../common/pkg-json-parser");
const pkReposData = require("../repo-data.json");

class DevStart {
  constructor() {
    shell.config.silent = true;
    Utils.clearConsole();
    shell.cd(constants.VIDIUN_PLAYER_RELATIVE_PATH);
    const envManagerConfiguration = PkgJsonParser.parse(constants.ENV_MANAGER);
    const reposConfiguration = envManagerConfiguration[constants.DEV_MODE];
    const configuredRepos = Object.keys(reposConfiguration);
    this.pakhshkits = initPakhshkitRepos.call(this, reposConfiguration, configuredRepos);
    this.kp = new VidiunPlayerRepoController(this.pakhshkits);
    printInfo.call(this, reposConfiguration);
  }

  start(type) {
    handlePakhshkitRepos.call(this);
    handleVidiunPlayerRepo.call(this, type);
  }
}

function initPakhshkitRepos(reposConfiguration, configuredRepos) {
  const pakhshkits = {};
  Object.keys(pkReposData).forEach((repoAlias) => {
    const options = {
      mode: constants.DEV_MODE,
      alias: repoAlias,
      name: pkReposData[repoAlias].name,
      url: pkReposData[repoAlias].url,
      peerDependencies: pkReposData[repoAlias].peerDependencies,
      devDependencies: pkReposData[repoAlias].devDependencies,
      include: configuredRepos.includes(repoAlias),
      version: reposConfiguration[repoAlias]
    };
    pakhshkits[repoAlias] = new PakhshkitRepoController(options);
  });
  return pakhshkits;
}

function printInfo(reposConfiguration) {
  Utils.print(chalk.bold.bgGreen(constants.START_DEV_MODE));
  Utils.printSeparator();
  Utils.print(chalk.bold(constants.BUILDING_FOR_CONFIGURATION));
  Utils.print(chalk.italic(JSON.stringify(reposConfiguration, null, 2)));
}

function handlePakhshkitRepos() {
  Object.keys(pkReposData).forEach((repoAlias) => {
    const pakhshkit = this.pakhshkits[repoAlias];
    if (pakhshkit.include) {
      Utils.printSeparator();
      Utils.print(chalk.bold(constants.WORKING_ON) + chalk.underline.cyan.italic(pakhshkit.name));
      Utils.moveDirectory(pakhshkit.name);
      pakhshkit.startDevMode();
    }
  });
}

function handleVidiunPlayerRepo(type) {
  Utils.printSeparator();
  Utils.print(chalk.bold(constants.WORKING_ON) + chalk.underline.cyan.italic(constants.VIDIUN_PLAYER_JS));
  Utils.moveDirectory(constants.VIDIUN_PLAYER_JS);
  this.kp.startDevMode(type);
}

module.exports = DevStart;
