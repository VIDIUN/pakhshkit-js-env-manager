#! /usr/bin/env node
const fs = require("fs");
const shell = require("shelljs");
const chalk = require("chalk");
const constants = require("../common/constants");
const PakhshkitRepoController = require("../controllers/pakhshkit-repo-controller");
const VidiunPlayerRepoController = require("../controllers/vidiun-player-repo-controller");
const PkgJsonParser = require("../common/pkg-json-parser");
const Utils = require("../common/utils");
const pkReposData = require("../repo-data.json");

class DevStop {
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

  stop() {
    handleVidiunPlayerRepo.call(this);
    handlePakhshkitRepos.call(this);
    Utils.print(chalk.bold.red(constants.KILLING_NODES));
    shell.exec("killall node");
  }
}

function initPakhshkitRepos(reposConfiguration, configuredRepos) {
  const pakhshkits = {};
  Object.keys(pkReposData).forEach((repoAlias) => {
    const options = {
      mode: constants.DEV_MODE,
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

function printInfo() {
  Utils.print(chalk.bold.bgRed(constants.STOP_DEV_MODE));
}

function handlePakhshkitRepos() {
  Object.keys(pkReposData).forEach((repoAlias) => {
    const pakhshkit = this.pakhshkits[repoAlias];
    if (pakhshkit.include) {
      Utils.printSeparator();
      Utils.print(chalk.bold(constants.WORKING_ON) + chalk.underline.cyan.italic(pakhshkit.name));
      Utils.moveDirectory(pakhshkit.name);
      pakhshkit.stopDevMode();
    }
  });
}

function handleVidiunPlayerRepo() {
  Utils.printSeparator();
  Utils.print(chalk.bold(constants.WORKING_ON) + chalk.underline.cyan.italic(constants.VIDIUN_PLAYER_JS));
  Utils.moveDirectory(constants.VIDIUN_PLAYER_JS);
  this.kp.stopDevMode();
}

module.exports = DevStop;
