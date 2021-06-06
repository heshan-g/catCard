const { writeFileSync } = require('fs');
const { join } = require('path');
const fetch = require('node-fetch');
const blend = require('util').promisify(require('@mapbox/blend'));
const argv = require('minimist')(process.argv.slice(2));

const logError = require('./errorLogger');

const {
  greeting = 'Hello',
  who = 'You',
  width = 400,
  height = 500,
  color = 'Pink',
  size = 100
} = argv;

// An array of URLs allow for varying number of images to be stitched
const urls = [
  `https://cataas.com/cat/says/${greeting}?width=${width}&height=${height}&color${color}&s=${size}`,
  `https://cataas.com/cat/says/${who}?width=${width}&height=${height}&color${color}&s=${size}`
];

// HTTP request helper method returns a promise
const makeGetRequest = (url) => {
  return fetch(url);
};

// Execute application
(async () => {
  // Store image requests in an arraiy
  let fetchResults = [];

  try {
    const imageRequests = urls.map((url) => {
      return makeGetRequest(url);
    });

    // Resolve API fetch promises in parallel
    fetchResults = await Promise.all(imageRequests);
  } catch (err) {
    logError('Fetching images from the API', err);
    return;
  }

  // Cache binary data
  const bufferPromisses = fetchResults.map((result) => {
    console.log(`Received response with status: ${result.status}`);

    // Return promise of buffer object
    return result.buffer();
  });

  // Resolve all buffers in parallel
  const bufferedImages = await Promise.all(bufferPromisses);

  // Generate an array of buffers for the blend method
  const imageData = bufferedImages.map((buffer, index) => {
    // The "x" coordinate value is dynamic for varying number of images
    return {
      buffer,
      x: index * width,
      y: 0
    };
  });

  // Generate an options object for the blend method
  // The "width" attribute value is dynamic for varying number of images
  const options = {
    width: width * imageData.length + 1,
    height: height,
    format: 'jpeg'
  };

  // The blend method (stitch images)
  let result;
  try {
    result = await blend(imageData, options);
  } catch (err) {
    logError('Stitching the image', err);
    return;
  }

  // Define the output file name and path
  const fileOut = join(process.cwd(), `cat-card.jpg`);
  try {
    // Use a promise with "writeFileSync" with no callbacks
    await writeFileSync(fileOut, result);
  } catch (err) {
    logError('Creating output file', err);
    return;
  }

  console.log('The file was saved!');
  return;
})();
