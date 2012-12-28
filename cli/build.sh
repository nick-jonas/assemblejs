# clear output directory
echo "Clearing directory..."
rm -rf output/*

# compile the sass
echo "Compiling Sass..."
compass compile ../app/sass/ -e production --force

# copy app directory to output
echo "Copying app directory to output..."
cp -r ../app/. output/

# remove the src folder
echo "Removing source folder from output..."
 rm -rf output/src

# build the JS application source, place one javascript file in output/assets/js/
echo "Building JS application into one file..."
node r.js -o app.build.js

# replace index.html script src from RequireJS application to compiled javascript file
echo "Replacing index.html src attribute..."
sed 's/src\/libs\/require\/require.js/assets\/js\/main-build.js/g' output/index.html > output/index.html.temp
sed 's/ data-main="src\/config"//g' output/index.html.temp > output/index.html.temp2
rm output/index.html
rm output/index.html.temp
mv output/index.html.temp2 output/index.html
