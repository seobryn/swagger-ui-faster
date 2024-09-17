import {Faster} from '@seobryn/faster';
import swaggerUi from '../../index.mjs';
import swaggerDocumentSplit from './swagger-split.json' assert { type: 'json' };
import swaggerDocument from './swagger.json' assert { type: 'json' };
import { __dirname } from '../../utils/fs-utils.mjs'

var app = new Faster({parseBody: true});

var options = {
	validatorUrl: null,
	oauth: {
		clientId: "your-client-id1",
		clientSecret: "your-client-secret-if-required1",
		realm: "your-realms1",
		appName: "your-app-name1",
		scopeSeparator: ",",
		additionalQueryStringParams: {}
	},
	docExpansion: 'full',
	operationsSorter: function (a, b) {
		var score = {
			'/test': 1,
			'/bar': 2
		}
		return score[a.get("path")] < score[b.get("path")]
	}
};

app.post('/test', async (req, res) => {
	res.status(200).json({ status: 'OK' });
});

app.get('/bar', async (req, res) => {
	res.status(200).json({ status: 'OKISH' });
});

app.get('/api-docs/*', ...swaggerUi.serve)
app.get('/api-docs/', swaggerUi.setup(swaggerDocument, { baseURL: '/api-docs/' }, options, '.swagger-ui .topbar { background-color: red }'));

app.get('/api-docs-from-url/*', ...swaggerUi.serve)
app.get('/api-docs-from-url/', swaggerUi.setup(null, { baseURL: '/api-docs-from-url/' }, options, '.swagger-ui .topbar { background-color: red }', null, '/swagger.json'));

var swaggerUiOpts = {
	explorer: false,
	swaggerOptions: options,
	customCss: '.swagger-ui .topbar { background-color: blue }',
	baseURL: 'api-docs-using-object/'
}

app.get('/api-docs-using-object/*', ...swaggerUi.serve)
app.get('/api-docs-using-object/', swaggerUi.setup(swaggerDocument, swaggerUiOpts));

var swaggerUiOpts2 = {
	explorer: false,
	swaggerOptions: options,
	customCss: '.swagger-ui .topbar { background-color: pink }',
	swaggerUrl: '/swagger.json',
	customJs: '/my-custom.js',
	operationsSorter: 'alpha'
}

app.get('/api-docs-from-url-using-object/*', ...swaggerUi.serve)
app.get('/api-docs-from-url-using-object/', swaggerUi.setup(null, Object.assign({}, swaggerUiOpts2, { baseURL: '/api-docs-from-url-using-object/' })));

// Restify does static file hosting differently then Express. They prepend the mount point to the
// static directory which seems ok from some points of view but means you can't have virtual paths
// and in the case of this module we need a virtual path. In Restify v5 and up they add the option
// to not prepend the mount path but seems it loses it in the relative URLs so I had to add a new
// option to setup() so we can add the mount path to the HTML to fix the relative URLs. That does
// mean that the case where the options is null is no longer valid so I'm commenting this case out.
//
// app.get(/\/api-docs-with-null\/+.*/, ...swaggerUi.serve)
// app.get('/api-docs-with-null', swaggerUi.setup(swaggerDocument, null, options, '.swagger-ui .topbar { background-color: orange }'));

app.get('/api-docs-split/*', ...swaggerUi.serve)
app.get('/api-docs-split/', swaggerUi.setup(swaggerDocumentSplit, { baseURL: '/api-docs-split/' }, options, '.swagger-ui .topbar { background-color: orange }'));

app.get('/api-docs-with-opts/*', ...swaggerUi.serveWithOptions({ redirect: false }))
app.get('/api-docs-with-opts/', swaggerUi.setup(swaggerDocumentSplit, { baseURL: '/api-docs-with-opts/' }, options, '.swagger-ui .topbar { background-color: orange }'));

var swaggerHtml = swaggerUi.generateHTML(swaggerDocument, Object.assign({}, swaggerUiOpts, { baseURL: '/api-docs-html1/' }))

app.get('/api-docs-html1/*', ...swaggerUi.serveFiles(swaggerDocument, swaggerUiOpts))
app.get('/api-docs-html1/', async (req, res) => {
	res.writeHead(200, {
		'Content-Length': Buffer.byteLength(swaggerHtml),
		'Content-Type': 'text/html'
	});
	res.write(swaggerHtml);
	res.end();
});

export default app;
