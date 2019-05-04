#! /usr/bin/env node
const fs = require("fs");
const chalk = require("chalk");
const shell = require("shelljs");
const constants = require("../common/constants");
const Utils = require("../common/utils");
const PkgJsonParser = require("../common/pkg-json-parser");
const NpmYarnHandler = require("../common/npm-yarn-handler");
const GitHandler = require("../common/git-handler");
const ReleaseDataHandler = require("../common/release-data-handler");
const pkReposData = require("../repo-data.json");
const GitHubConnector = require("../common/github-api");

class VidiunPlayerController {
  constructor(pakhshkits) {
    this.pakhshkits = pakhshkits;
  }

  startDevMode(type) {
    try {
      const dependencies = PkgJsonParser.parse(constants.DEPENDENCIES);
      const pkReposList = Object.keys(pkReposData);
      const excluded = pkReposList.filter(pk => this.pakhshkits[pk].include === false);
      const included = pkReposList.filter(pk => this.pakhshkits[pk].include === true);
      excluded.forEach((repoAlias) => {
        const pakhshkit = this.pakhshkits[repoAlias];
        NpmYarnHandler.unlinkRepo(pakhshkit.name);
        NpmYarnHandler.add(pakhshkit.name, dependencies[pakhshkit.name]);
      });
      included.forEach((repoAlias) => {
        const pakhshkit = this.pakhshkits[repoAlias];
        NpmYarnHandler.linkRepo(pakhshkit.name);
      });
      NpmYarnHandler.dev(constants.VIDIUN_PLAYER_JS, type);
    } catch (e) {
      Utils.print(chalk.bold.red("✘ " + e.message + " ✘"));
    }
  }

  stopDevMode() {
    try {
      const dependencies = PkgJsonParser.parse(constants.DEPENDENCIES);
      Object.keys(pkReposData).forEach((repoAlias) => {
        const pakhshkit = this.pakhshkits[repoAlias];
        if (pakhshkit.include) {
          NpmYarnHandler.unlinkRepo(pakhshkit.name);
          NpmYarnHandler.add(pakhshkit.name, dependencies[pakhshkit.name]);
        }
      });
      NpmYarnHandler.build();
    } catch (e) {
      Utils.print(chalk.bold.red("✘ " + e.message + " ✘"));
    }
  }

  runReleaseMode() {
    NpmYarnHandler.install();
    GitHandler.stashChanges();
    GitHandler.checkoutMaster();
    NpmYarnHandler.clean();
    shell.config.silent = false;
    NpmYarnHandler.releaseDry();
    shell.config.silent = true;
    Utils.showPrompt('Observe upcoming release. Do you want to continue?', (ans) => {
      if (ans) {
        unlinkPakhshkitRepos.call(this);
        updatePakhshkitReposVersionsInPkgJson.call(this);
        upgradePakhshkitRepos.call(this);
        NpmYarnHandler.release();
        const newVersion = Utils.getNewVersion();
        const changelog = Utils.getChangeLog();
        ReleaseDataHandler.set(constants.VIDIUN_PLAYER_JS, {
          url: '//github.com/vidiun/' + constants.VIDIUN_PLAYER_JS + '/releases/tag/v' + newVersion,
          version: newVersion,
          changeLog: changelog
        });
        Utils.showPrompt('Observe release commits. Ready to publish ' + constants.VIDIUN_PLAYER_JS + '?', (ans) => {
          if (ans) {
            completeReleaseMode.call(this);
            GitHubConnector.createRelease(constants.VIDIUN_PLAYER_JS)
              .then(() => {
                Utils.printDone();
              })
              .catch((err) => {
                Utils.printError(err);
              });
          } else {
            cancelReleaseMode.call(this);
          }
        });
      }
    });
  }
}

function completeReleaseMode() {
  NpmYarnHandler.publish();
}

function cancelReleaseMode() {
  const rd = ReleaseDataHandler.get(constants.VIDIUN_PLAYER_JS);
  GitHandler.resetHardMaster();
  GitHandler.deleteLocalTag(rd.version);
  ReleaseDataHandler.remove(constants.VIDIUN_PLAYER_JS);
}

function unlinkPakhshkitRepos() {
  Object.keys(pkReposData).forEach((repoAlias) => {
    const pakhshkit = this.pakhshkits[repoAlias];
    if (!pakhshkit.usingBundleBuilder) {
      NpmYarnHandler.unlinkRepo(pakhshkit.name);
    }
  });
}

function updatePakhshkitReposVersionsInPkgJson() {
  let pkgContent = PkgJsonParser.parse();
  Object.keys(pkReposData).forEach((repoAlias) => {
    const pakhshkit = this.pakhshkits[repoAlias];
    if (pakhshkit.include && !pakhshkit.usingBundleBuilder) {
      const pkReleaseData = ReleaseDataHandler.get(pakhshkit.name);
      Utils.print(chalk.bold.underline.blue("- update " + chalk.italic(pakhshkit.name) + " version in package.json to ") + chalk.yellow(pkReleaseData.version));
      pkgContent[constants.DEPENDENCIES][pakhshkit.name] = pakhshkit.url + "#v" + pkReleaseData.version;
      Utils.printDone();
    }
  });
  fs.writeFileSync(constants.PACKAGE_JSON, JSON.stringify(pkgContent, null, 2));
}

function upgradePakhshkitRepos() {
  const dependencies = PkgJsonParser.parse(constants.DEPENDENCIES);
  Object.keys(pkReposData).forEach((repoAlias) => {
    const pakhshkit = this.pakhshkits[repoAlias];
    if (!pakhshkit.usingBundleBuilder) {
      NpmYarnHandler.add(pakhshkit.name, dependencies[pakhshkit.name]);
    }
  });
  GitHandler.add([constants.PACKAGE_JSON, constants.YARN_LOCK]);
  GitHandler.commit('chore(package.json): update pakhshkit-js-* versions', 'pakhshkit-js-* versions');
}

module.exports = VidiunPlayerController;
