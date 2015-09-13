cd `dirname $0`
dir=`pwd`

cd "${dir}/node_modules/leaflet"
npm install
jake build
cd "${dir}"
# grunt build
projectFile="${dir}/node_modules/leaflet/dist/package.json"
rm -f "${projectFile}"
echo '{"name": "leaflet", "main": "leaflet-src.js", "style": "leaflet.css"}' >>"${projectFile}"
