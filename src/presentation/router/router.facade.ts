import express, { Router } from 'express'
import { GetMatchesUseCase } from 'bet-core-node/lib/domain/usecase/get.matches.usecase'
import { Env } from '../util/env'
import { ErrorMessage } from '../util/error.message'
import moment from 'moment-timezone'
import { GetMatchDetailUseCase } from 'bet-core-node/lib/domain/usecase/get.match.detail.usecase'
import { GetSynchronizationDetailUseCase } from 'bet-core-node/lib/domain/usecase/get.synchronization.detail'
import { GetSynchronizationsUseCase } from 'bet-core-node/lib/domain/usecase/get.synchronizations.usecase'
import { SyncMatchesByLeagueUseCase } from 'bet-core-node/lib/domain/usecase/betcup/server/sync.matches.by.league.usecase'
import { SyncMatchesUseCase } from 'bet-core-node/lib/domain/usecase/sync.matches.usecase'
import { GetAccuracyUseCase } from 'bet-core-node/lib/domain/usecase/get.accuracy.usecase'
import { GetClientSettingsUseCase } from 'bet-core-node/lib/domain/usecase/client/get.client.settings.usecase'
import { GetBetCupMatchesUseCase } from 'bet-core-node/lib/domain/usecase/betcup/get.betcup.matches.usecase'
import { GetBetCupMatchDetailUseCase } from 'bet-core-node/lib/domain/usecase/betcup/get.betcup.match.detail.usecase'
import { GetBetCupLeaguesUseCase } from 'bet-core-node/lib/domain/usecase/betcup/get.betcup.leagues.usecase'

export class RouterFacade {

    constructor(
        private getMatchDetailUseCase: GetMatchDetailUseCase,
        private getMatchesUseCase: GetMatchesUseCase,
        private env: Env,
        private getSynchronizationDetailUseCase: GetSynchronizationDetailUseCase,
        private getSynchronizationsUseCase: GetSynchronizationsUseCase,
        private getAccuracyUseCase: GetAccuracyUseCase,
        private getClientSettingsUseCase: GetClientSettingsUseCase,
        private syncMatchesByLeagueUseCase: SyncMatchesByLeagueUseCase,
        private getBetCupMatchesUseCase: GetBetCupMatchesUseCase,
        private getBetCupLeaguesUseCase: GetBetCupLeaguesUseCase,
        private getBetCupMatchDetailUseCase: GetBetCupMatchDetailUseCase,
        private syncMatchesUseCase: SyncMatchesUseCase,
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

    getSyncMatchesRouter(): Router {
        return express.Router({
            strict: true
        }).get('/:date', async (request, response) => {
            try {
                const dateAsString = request.query.date?.toString()
                if (dateAsString) {
                    const dateOnly = dateAsString.slice(0, 10)
                    const date = new Date(`${dateOnly}T00:00:00.000Z`)
                    // JS Date rolls invalid days (e.g. 2026-02-31 -> 2026-03-03).
                    // Reject if the parsed GMT date is not the same YYYY-MM-DD we received.
                    if (isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dateOnly) {
                        response.status(400).json({ message: ErrorMessage.BadRequest })
                        return
                    }

                    const notStartedParam = request.query.notStarted?.toString()
                    // Default true. Only "false" or "0" turn it off; any other value (e.g. "testing") stays true.
                    const notStarted = notStartedParam === undefined || (notStartedParam.toLowerCase() !== 'false' && notStartedParam !== '0')
                    const timezone = this.env.TIMEZONE || 'GMT'
                    const matchFilter = notStarted
                        ? 'not-started matches only'
                        : 'all matches for that date'

                    this.syncMatchesUseCase.execute(date, notStarted)
                    console.log(`RouterFacade: Syncing matches for ${dateOnly}, notStarted=${notStarted}. Requested at ${new Date().toISOString()}`)

                    response.status(200).json({
                        message: `Sync started for ${dateOnly} at 00:00 ${timezone}. Fetching ${matchFilter}. This response only confirms the job started; it has not finished yet. Check /synchronization?fixtureDate=${dateOnly} for the result.`,
                        date: date,
                        dateGmt: dateOnly,
                        timezone: timezone,
                        notStarted: notStarted
                    })
                } else {
                    response.status(400).json({ message: ErrorMessage.BadRequestMissingDate })
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
                    const matches = await this.getBetCupMatchesUseCase.execute(leagueString, seasonString)

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

    getBetCupMatchDetailRouter(): Router {
        return express.Router({
            strict: true
        }).get('/:id', async (request, response) => {
            try {
                const id = request.query.id?.toString()
                if (id) {
                    const matches = await this.getBetCupMatchDetailUseCase.execute(id)

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

    getBetCupLeaguesRouter(): Router {
        return express.Router({
            strict: true
        }).get('/:league', async (request, response) => {
            try {
                const leagues = await this.getBetCupLeaguesUseCase.execute()

                response.status(200).send(leagues)
            } catch (e) {
                console.log(e)
                response.status(400).json({ message: ErrorMessage.BadRequest })
            }
        })
    }
}
