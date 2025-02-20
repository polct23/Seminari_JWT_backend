import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Mi API con Swagger',
            version: '1.0.0',
            description: 'Documentación de mi API usando Swagger y TypeScript'
        },
        servers: [
            {
                url: 'http://localhost:9000'
            }
        ]
    },
    apis: ['./src/routes/*.ts'] // Ruta a tus archivos de rutas
};

const swaggerSpec = swaggerJSDoc(options);

export function swaggerDocs(app: Express, port: number) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log(`Swagger docs disponibles en http://localhost:${port}/api-docs`);
}
