import express, { Router } from 'express'
import { GetMatchesUseCase } from 'bet-core-node/lib/domain/usecase/get.matches.usecase'
import { Env } from '../util/env'
import { ErrorMessage } from '../util/error.message'
import moment from 'moment-timezone'
import { GetMatchDetailUseCase } from 'bet-core-node/lib/domain/usecase/get.match.detail.usecase'
import { GetSynchronizationDetailUseCase } from 'bet-core-node/lib/domain/usecase/get.synchronization.detail'
import { GetSynchronizationsUseCase } from 'bet-core-node/lib/domain/usecase/get.synchronizations.usecase'
import { SyncMatchesByLeagueUseCase } from 'bet-core-node/lib/domain/usecase/server/sync.matches.by.league.usecase'
import { GetAccuracyUseCase } from 'bet-core-node/lib/domain/usecase/get.accuracy.usecase'
import { GetClientSettingsUseCase } from 'bet-core-node/lib/domain/usecase/client/get.client.settings.usecase'

export class RouterFacade {

    constructor(
        private getMatchDetailUseCase: GetMatchDetailUseCase,
        private getMatchesUseCase: GetMatchesUseCase,
        private env: Env,
        private getSynchronizationDetailUseCase: GetSynchronizationDetailUseCase,
        private getSynchronizationsUseCase: GetSynchronizationsUseCase,
        private getAccuracyUseCase: GetAccuracyUseCase,
        private getClientSettingsUseCase: GetClientSettingsUseCase,
        private syncMatchesByLeagueUseCase: SyncMatchesByLeagueUseCase
    ) {}

    getMatchesRouter(): Router {
        return express.Router({
            strict: true
        }).get('/:date', async (request, response) => {
            try {
                const dateAsString = request.query.date?.toString()
                const timezone = request.query.timezone?.toString()
                if (dateAsString) {
                    var date = null
                    if (timezone) {
                        date = new Date(moment.tz(dateAsString, timezone).format())
                    } else {
                        date = new Date(dateAsString)
                    }
                    const matches = await this.getMatchesUseCase.execute(date)

                    response.status(200).send(matches)
                } else {
                    response.status(400).json({ message: ErrorMessage.BadRequestMissingDate })
                }
            } catch (e) {
                console.log(e)
                response.status(400).json({ message: ErrorMessage.BadRequest })
            }
        })
    }

    getMatchDetailRouter(): Router {
        return express.Router({
            strict: true
        }).get('/:id', async (request, response) => {
            try {
                const id = request.query.id?.toString()
                if (id) {
                    const matches = await this.getMatchDetailUseCase.execute(id)

                    response.status(200).send(matches)
                } else {
                    response.status(400).json({ message: ErrorMessage.BadRequestMissingId })
                }
            } catch (e) {
                console.log(e)
                response.status(400).json({ message: ErrorMessage.BadRequest })
            }
        })
    }

    getHelloRouter(): Router {
        return express.Router({
            strict: true
        }).get('/', async (request, response) => {
            response.status(200).json({
                message: `Howdy Render. I am alive!`,
                envVar: this.env
            })
        })
    }

    getSynchronizationDetailRouter(): Router {
        return express.Router({
            strict: true
        }).get('/:fixtureDate', async (request, response) => {
            try {
                const dateAsString = request.query.fixtureDate?.toString()
                if (dateAsString) {
                    const date = new Date(dateAsString)
                    const synchronization = await this.getSynchronizationDetailUseCase.execute(date)

                    response.status(200).send(synchronization)
                } else {
                    response.status(400).json({ message: ErrorMessage.BadRequestMissingDate })
                }
            } catch (e) {
                console.log(e)
                response.status(400).json({ message: ErrorMessage.BadRequest })
            }
        })
    }

    getAppSettings(): Router {
        return express.Router({
            strict: true
        }).get('/:versionCode', async (request, response) => {
            try {
                const versionCode = Number(request.query.versionCode?.toString())
                const platform = request.query.platform?.toString()
                if (versionCode && platform) {
                    const clientSettings = await this.getClientSettingsUseCase.execute(versionCode, platform)

                    response.status(200).send(clientSettings)
                } else {
                    response.status(400).json({ message: ErrorMessage.BadRequestMissingVersionCode })
                }
            } catch (e) {
                console.log(e)
                response.status(400).json({ message: ErrorMessage.BadRequest })
            }
        })
    }

    getSynchronizationsRouter(): Router {
        return express.Router({
            strict: true
        }).get('/:from', async (request, response) => {
            try {
                const fromAsString = request.query.from?.toString()
                const toAsString = request.query.to?.toString()
                if (fromAsString && toAsString) {
                    const from = new Date(fromAsString)
                    const to = new Date(toAsString)
                    const synchronization = await this.getSynchronizationsUseCase.execute(from, to)

                    response.status(200).send(synchronization)
                } else {
                    response.status(400).json({ message: ErrorMessage.BadRequestMissingFromOrTo })
                }
            } catch (e) {
                console.log(e)
                response.status(400).json({ message: ErrorMessage.BadRequest })
            }
        })
    }

    getAccuracyRouter(): Router {
        return express.Router({
            strict: true
        }).get('/:date', async (request, response) => {
            try {
                const dateAsString = request.query.date?.toString()
                const timezone = request.query.timezone?.toString()
                if (dateAsString) {
                    var date = null
                    if (timezone) {
                        date = new Date(moment.tz(dateAsString, timezone).format())
                    } else {
                        date = new Date(dateAsString)
                    }
                    const accuracy = await this.getAccuracyUseCase.execute(date)

                    response.status(200).send(accuracy)
                } else {
                    response.status(400).json({ message: ErrorMessage.BadRequestMissingDate })
                }
            } catch (e) {
                console.log(e)
                response.status(400).json({ message: ErrorMessage.BadRequest })
            }
        })
    }

    /**
     *  BetCup Section 
     */

    getSyncFixtureByLeagueRouter(): Router {
        return express.Router({
            strict: true
        }).get('/:league', async (request, response) => {
            try {
                const leagueString = request.query.league?.toString()
                const seasonString = request.query.season?.toString()
                if (leagueString && seasonString) {
                    const matches = await this.syncMatchesByLeagueUseCase.execute(leagueString, seasonString)

                    response.status(200).send(matches)
                } else {
                    response.status(400).json({ message: ErrorMessage.BadRequestMissingDate })
                }
            } catch (e) {
                console.log(e)
                response.status(400).json({ message: ErrorMessage.BadRequest })
            }
        })
    }

    getBetCupMatchesRouter(): Router {
        return express.Router({
            strict: true
        }).get('/:league', async (request, response) => {
            try {
                const leagueString = request.query.league?.toString()
                const seasonString = request.query.season?.toString()
                if (leagueString && seasonString) {
                    //const matches = await this.getBetCupMatches.execute(leagueString, seasonString)

                    //response.status(200).send(matches)
                } else {
                    response.status(400).json({ message: ErrorMessage.BadRequestMissingDate })
                }
            } catch (e) {
                console.log(e)
                response.status(400).json({ message: ErrorMessage.BadRequest })
            }
        })
    }
}
