const { appendFileSync } = require('fs');

const logError = async (message, error) => {
  const logFile = `${__dirname}/logs/errors.log`;

  try {
    const entry = `${new Date()} - ERROR: ${message} - ${error}\n`;

    await appendFileSync(logFile, entry);

    console.log(
      `An error occured. Please check the log in ${__dirname}/logs/errors.log`
    );
  } catch (err) {
    console.log('Error in logger.', err);

    return;
  }
};

module.exports = logError;
