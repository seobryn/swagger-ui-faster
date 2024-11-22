# Swagger UI for Faster Web Framework

Adds middleware to your Faster app to serve the Swagger UI bound to your Swagger document. This acts as living documentation for your API hosted from within your app.

Swagger version is pulled from npm module swagger-ui-dist. Please use a lock file or specify the version of swagger-ui-dist you want to ensure it is consistent across environments.

## Usage

Install using npm:

```bash
$ npm install --save @seobryn/swagger-ui-faster
```

Faster setup `app.mjs`

```javascript
import { Faster } from '@seobryn/faster';
import swaggerUi from '@seobryn/swagger-ui-faster';
import swaggerSpec from './swagger.json' assert { type: "json" };

const server = new Faster({ parseBody: true, log: { errorAsJson: true } });

server.get("/docs/*", ...swaggerUi.serve)
server.get("/docs/", swaggerUi.setup(swaggerSpec, { baseURL: "/docs/" }))
```

Open http://`<app_host>`:`<app_port>`/docs/ in your browser to view the documentation.

### [swagger-jsdoc](https://www.npmjs.com/package/swagger-jsdoc)

If you are using swagger-jsdoc simply pass the swaggerSpec into the setup function:

```javascript
// Initialize swagger-jsdoc -> returns validated swagger spec in json format
const swaggerSpec = swaggerJSDoc(options);

server.get("/docs/*", ...swaggerUi.serve)
server.get("/docs/", swaggerUi.setup(swaggerSpec, { baseURL: "/docs/" }))
```

### Swagger Explorer

By default the Swagger Explorer bar is hidden, to display it pass true as the 'explorer' property of the options to the setup function:

```javascript
import { Faster } from '@seobryn/faster';
import swaggerUi from '@seobryn/swagger-ui-faster';
import swaggerSpec from './swagger.json' assert { type: "json" };

const server = new Faster({ parseBody: true, log: { errorAsJson: true } });

var options = {
  explorer: true,
  baseURL: '/docs/',
};

server.get("/docs/*", ...swaggerUi.serve)
server.get("/docs/", swaggerUi.setup(swaggerSpec, options))
```

### Custom swagger options

To pass custom options e.g. validatorUrl, to the SwaggerUi client pass an object as the 'swaggerOptions' property of the options to the setup function:

```javascript
import { Faster } from '@seobryn/faster';
import swaggerUi from '@seobryn/swagger-ui-faster';
import swaggerSpec from './swagger.json' assert { type: "json" };

const server = new Faster({ parseBody: true, log: { errorAsJson: true } });

var options = {
	swaggerOptions: {
    validatorUrl: null,
  },
  baseURL: 'docs/',
};

server.get("/docs/*", ...swaggerUi.serve)
server.get("/docs/", swaggerUi.setup(swaggerSpec, options))
```

### Custom CSS styles

To customize the style of the swagger page, you can pass custom CSS as the 'customCss' property of the options to the setup function.

E.g. to hide the swagger header:

```javascript
import { Faster } from '@seobryn/faster';
import swaggerUi from '@seobryn/swagger-ui-faster';
import swaggerSpec from './swagger.json' assert { type: "json" };

const server = new Faster({ parseBody: true, log: { errorAsJson: true } });

var options = {
  customCss: '.swagger-ui .topbar { display: none }',
  baseURL: '/docs/',
};

server.get("/docs/*", ...swaggerUi.serve)
server.get("/docs/", swaggerUi.setup(swaggerSpec, options))
```

### Custom JS

If you would like to have full control over your HTML you can provide your own javascript file, value accepts absolute or relative path

```javascript
import { Faster } from '@seobryn/faster';
import swaggerUi from '@seobryn/swagger-ui-faster';
import swaggerSpec from './swagger.json' assert { type: "json" };

const server = new Faster({ parseBody: true, log: { errorAsJson: true } });

var options = {
  customJs: '/custom.js',
  baseURL: '/docs/',
};

server.get("/docs/*", ...swaggerUi.serve)
server.get("/docs/", swaggerUi.setup(swaggerSpec, options))
```

### Load swagger from url

To load your swagger from a url instead of injecting the document, pass `null` as the first parameter, and pass the relative or absolute URL as the 'swaggerUrl' property of the options to the setup function.

```javascript
import { Faster } from '@seobryn/faster';
import swaggerUi from '@seobryn/swagger-ui-faster';

const server = new Faster({ parseBody: true, log: { errorAsJson: true } });

var options = {
  swaggerUrl: 'http://petstore.swagger.io/v2/swagger.json',
  baseURL: '/docs/',
}

server.get("/docs/*", ...swaggerUi.serve)
server.get("/docs/", swaggerUi.setup(null, options))
```

### Load swagger from yaml file

To load your swagger specification yaml file you need to use a module able to convert yaml to json; for instance `yamljs`.

    npm install --save yamljs

```javascript
import { Faster } from '@seobryn/faster';
import swaggerUi from '@seobryn/swagger-ui-faster';
import YAML from 'yamljs';

const server = new Faster({ parseBody: true, log: { errorAsJson: true } });

const swaggerDocument = YAML.load('./swagger.yaml');

server.get("/docs/*", ...swaggerUi.serve)
server.get("/docs/", swaggerUi.setup(swaggerDocument, { baseURL: 'docs' }))
```

## Requirements

* Node v18.19.0 or above
* Faster 1.0.6 or above

## Testing

* Install Puppeteer
* `npm install`
* `npm test`
