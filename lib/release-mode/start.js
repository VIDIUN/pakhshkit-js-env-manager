#! /usr/bin/env node
const shell = require("shelljs");
const chalk = require("chalk");
const fs = require("fs");
const constants = require("../common/constants");
const PkgJsonParser = require("../common/pkg-json-parser");
const PakhshkitRepoController = require("../controllers/pakhshkit-repo-controller");
const VidiunPlayerRepoController = require("../controllers/vidiun-player-repo-controller");
const Utils = require("../common/utils");
const pkReposData = require("../repo-data.json");
const GitHubConnector = require("../common/github-api");

class ReleaseStart {
  constructor() {
    shell.config.silent = true;
    Utils.clearConsole();
    shell.cd(constants.VIDIUN_PLAYER_RELATIVE_PATH);
    GitHubConnector.authenticate();
    const envManagerConfiguration = PkgJsonParser.parse(constants.ENV_MANAGER);
    const configuredRepos = envManagerConfiguration[constants.RELEASE_MODE];
    this.pakhshkits = initPakhshkitRepos.call(this, configuredRepos);
    this.kp = new VidiunPlayerRepoController(this.pakhshkits);
    printInfo.call(this, configuredRepos);
  }

  start() {
    try {
      runReleaseOnPakhshkitRepos.call(this)
        .then(() => {
          runReleaseOnVidiunPlayerRepo.call(this);
        });
    } catch (e) {
      Utils.printError(e.message);
    }
  }
}

function initPakhshkitRepos(configuredRepos) {
  const pakhshkits = {};
  Object.keys(pkReposData).forEach((repoAlias) => {
    const options = {
      mode: constants.RELEASE_MODE,
      alias: repoAlias,
      name: pkReposData[repoAlias].name,
      url: pkReposData[repoAlias].url,
      peerDependencies: pkReposData[repoAlias].peerDependencies,
      devDependencies: pkReposData[repoAlias].devDependencies,
      usingBundleBuilder: pkReposData[repoAlias].usingBundleBuilder,
      include: configuredRepos.includes(repoAlias)
    };
    pakhshkits[repoAlias] = new PakhshkitRepoController(options);
  });
  return pakhshkits;
}

function printInfo(configuredRepos) {
  Utils.print(chalk.bold.bgGreen(constants.START_REL_MODE));
  Utils.printSeparator();
  Utils.print(chalk.bold(constants.BUILDING_FOR_CONFIGURATION));
  Utils.print(chalk.italic(JSON.stringify(configuredRepos, null, 2)));
}

function runReleaseOnPakhshkitRepos() {
  return Object.keys(pkReposData).reduce((previousPromise, repoAlias) => {
    return previousPromise.then(() => {
      const pakhshkit = this.pakhshkits[repoAlias];
      if (pakhshkit.include) {
        Utils.printSeparator();
        Utils.print(chalk.bold(constants.WORKING_ON) + chalk.underline.cyan.italic(pakhshkit.name));
        Utils.moveDirectory(pakhshkit.name);
        return pakhshkit.runReleaseMode();
      } else {
        return Promise.resolve();
      }
    });
  }, Promise.resolve());
}

function runReleaseOnVidiunPlayerRepo() {
  Utils.printSeparator();
  Utils.print(chalk.bold(constants.WORKING_ON) + chalk.underline.cyan.italic(constants.VIDIUN_PLAYER_JS));
  Utils.moveDirectory(constants.VIDIUN_PLAYER_JS);
  this.kp.runReleaseMode();
}

module.exports = ReleaseStart;
