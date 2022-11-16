import express, { Express, Router } from 'express'
import { Middleware } from './middleware/middleware'

export class ServerBuilder {
    private betApp: Express
    private port: string | undefined
    private middleware: Middleware | undefined

    constructor() {
        this.betApp = express()
    }

    withPort(
        port: string
    ): ServerBuilder {
        this.port = port

        return this
    }

    withMiddleware(
        middleware: Middleware
    ): ServerBuilder {
        this.middleware = middleware

        return this
    }

    register(
        param: string,
        router: Router
    ): ServerBuilder {
        this.betApp.get(param, router)

        return this
    }

    registerPrivate(
        param: string,
        router: Router
    ): ServerBuilder {
        if (this.middleware) {
            this.betApp.get(param, this.middleware.verifyAuthorization, router)
        } else {
            this.betApp.get(param, router)
        }

        return this
    }

    build(): Express {
        this.betApp.use(express.json())
        this.betApp.listen(this.port, () => {
            console.log(`ServerBuilder: Listening on port http://localhost:${this.port}`)
        })

        return this.betApp
    }
}
