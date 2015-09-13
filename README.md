# TechOnMap UI

This project contains the code used for running the front-end of [TechOnMap](http://www.techonmap.fr), a collaborative and open data map of the digital organizations located in the Paris Region. This map was designed by [La Fonderie](http://www.lafonderie-idf.fr) and developed by [Ubimix](http://ubimix.com).

## Docker install

```
git clone https://github.com/ubimix/techonmap-ui.git
cd techonmap-ui/docker
sudo ./1.init.sh
sudo ./2.start.sh 1234
```

Open a browser at [http://localhost:1234/app/](http://localhost:1234/app/)

## Standard install

Requirements :
* node >= 0.10.28
* bower >= 1.2.5

Dependencies install and minified JS generation with Webpack:
```
npm install
sudo npm install -g grunt-cli
sudo npm install -g webpack
grunt
```

## License

The code of TechOnMap UI is licensed under the MIT license (see [LICENSE](LICENSE)  file).
