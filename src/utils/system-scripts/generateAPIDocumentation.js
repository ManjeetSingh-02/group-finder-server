// import external modules
import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';

(function () {
  // generate API documentation in OpenAPI 3.0 format using swagger-jsdoc
  const generatedAPIDocs = swaggerJsdoc({
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'ChaiHub-Server API Documentation',
        description: 'Interactive API reference for ChaiHub-Server',
        version: '1.0.0',
        contact: {
          name: 'Manjeet Singh',
          url: 'https://github.com/ManjeetSingh-02',
          email: 'manjeetsingh.wrk@gmail.com',
        },
      },
    },
    apis: ['./src/modules/**/*.js'],
  });

  // save the generated documentation to a JSON file in the docs directory
  fs.writeFileSync('./docs/apiDocumentation.json', JSON.stringify(generatedAPIDocs, null, 2));
})();
