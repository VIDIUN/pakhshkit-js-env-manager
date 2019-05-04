# PakhshKit JS Env Manager - An environment manager to setup pakhshkit-js-* projects across repos

PakhshKit JS Env Manager is a command line tool which aims to solve the development
challenges for multiple packages (pakhshkit-js-*) that
integrates to a single application ([Vidiun Player] in our case).

[Vidiun Player]: https://github.com/vidiun/vidiun-player-js

# Prerequisites

### 1. Install ttab
First, install ttab globally on your machine:
```
$ [sudo] npm install ttab -g
```
Then, go to System Preferences > Security & Privacy, tab Privacy,
select Accessibility, unlock, and make sure Terminal.app is in the list on the
right and has a checkmark.

### 2. Clone _vidiun-player-js_ repository
```
$ git clone https://github.com/vidiun/vidiun-player-js.git
$ cd vidiun-player-js
$ yarn
```

### 3. Folder structure
Pay attention that all pakhshkit-js-* repos including vidiun-player-js repo must be under the same parent directory.
An example for a valid folder structure is:
```
- repos
  - pakhshkit-js
  - pakhshkit-js-hls
  - pakhshkit-js-dash
  - pakhshkit-js-ima
  - pakhshkit-js-ui
  - pakhshkit-js-youbora
  - pakhshkit-js-providers
  - pakhshkit-js-vanalytics
  - vidiun-player-js
```
# Quick Start
* Go to _package.json_ file in _vidiun-player-js_ project.
* Observe under `scripts` the following commands:
````
"scripts": {
  ....
  "pakhshkit-dev:start": "pakhshkit-dev start",
  "pakhshkit-dev:stop": "pakhshkit-dev stop",
  "pakhshkit-rel": "pakhshkit-rel start"
  ...
}
````
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Those commands will helps us to run the required modes.
* Observe new entry named `envManager` which contains the following configuration:

```
  "envManager": {
    "devMode": {},
    "releaseMode": []
  }
```
* To run a certain script, simply open your terminal, go to vidiun-player-js project:
```
$ cd PATH/TO/vidiun-player-js
```
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;and run one of:
  ```
  yarn run pakhshkit-rel
  yarn run pakhshkit-dev:start
  yarn run pakhshkit-dev:stop
  ```
## Aliases for pakhshkit repos
Each repo has an alias to shorten its name and thus manipulate the configuration more easily and quickly:
* _pakhshkit-js -> **core**_
* _pakhshkit-js-ui -> **ui**_
* _pakhshkit-js-ima -> **ima**_
* _pakhshkit-js-hls -> **hls**_
* _pakhshkit-js-dash -> **dash**_
* _pakhshkit-js-providers -> **providers**_
* _pakhshkit-js-youbora -> **youbora**_
* _pakhshkit-js-vanalytics -> **vanalytics**_
* _pakhshkit-js-ott-analytics -> **ott-analytics**_
* _pakhshkit-js-google-analytics -> **google-analytics**_
* _pakhshkit-js-comscore -> **comscore**_
* _pakhshkit-js-kava -> **kava**_
* _pakhshkit-js-vr -> **vr**_

# Configuration

## devMode

### Commands
* **pakhshkit-dev:start**
* **pakhshkit-dev:stop**


### Structure
```
  "devMode": {
    "alias": "version",
    ...
  }
```

|     Property         	| Type    	| Possible Values| Description                                                                                                                                                                                	|
|----------------------	|---------	|-------	|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|
| ```version```         | ```string```|  ```'latest'```,```'local'```,```'vX.X.X'```   |Specifies the package version that the corresponding repo will checkout to on the local machine. For 'latest' it will checkout to the master branch. For 'local' it will stay on the current local branch (whatever that is).                                                                                                                                         	|


### Example:
```
  "devMode": {
    "core": "v0.10.0",
    "ui": "latest",
    "hls": "local"
  }
```

## releaseMode

### Commands
* **pakhshkit-rel**

### Structure
```
  "releaseMode": [
    "alias1",
    "alias2",
    "alias3",
    ...
  ]
 ```
### Example:
```
  "releaseMode": [
    "core",
    "youbora",
    "hls",
    ...
  ]
 ```

## Compatibility

This tool has been tested only on Mac OS.

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/vidiun/pakhshkit-js-ima/tags).

## License

This project is licensed under the AGPL-3.0 License - see the [LICENSE.md](LICENSE.md) file for details
