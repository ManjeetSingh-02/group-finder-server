// import local modules
import app from '../../app.js';

// import external modules
import expressJSDocSwagger from 'express-jsdoc-swagger';
import fs from 'fs/promises';
import path from 'path';

(async function () {
  const srcDir = path.resolve(import.meta.dirname, '../../');
  const outputDir = path.join(srcDir, 'utils', 'docs');
  const outputFile = path.join(outputDir, 'apiDocs.json');

  // initialize swagger documentation
  const docInstance = expressJSDocSwagger(app)({
    baseDir: srcDir,
    filesPattern: 'api/v1/**/*.controllers.js',
    info: {
      contact: {
        name: 'Manjeet Singh',
        email: 'manjeetsingh.wrk@gmail.com',
        url: 'https://github.com/ManjeetSingh-02',
      },
      description: 'Interactive API reference for ChaiHub-Server',
      title: 'ChaiHub-Server API Documentation',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
    ],
  });

  // listen for 'finish' event to save the generated docs into a json file
  docInstance.on('finish', async generatedData => {
    try {
      // ensure the output directory exists
      await fs.mkdir(outputDir, { recursive: true });
      console.log('--- Output Directory Creation/Verification: ✅');

      // save the generated documentation to a JSON file in the output directory
      await fs.writeFile(outputFile, JSON.stringify(generatedData, null, 2), 'utf8');
      console.log('--- API Documentation JSON Stored in Output File: ✅');
    } catch (error) {
      // log error
      console.error('---------------------------------------------------------');
      console.error('ERROR DURING API DOCS JSON GENERATION');
      console.error(`ERROR DETAILS: ${error.message}`);
      console.error('RUN THE SCRIPT AGAIN AFTER FIXING THE ISSUE');
      console.error('---------------------------------------------------------');

      // delete the output file if it was partially created
      await fs.unlink(outputFile).catch(() => {});
      console.log('--- Partially Created Output File Deletion: ✅');

      // exit with failure
      process.exit(1);
    }
  });
})();
