import { ServerBuilder } from './server.builder'
import { Di } from './di/di'
import { CronBuilder } from 'bet-core-node/lib/framework/cron/cron.builder'
import { PrivateEnv } from './util/private.env'
import { Env } from './util/env'
import { NodePackage } from 'bet-core-node/lib/framework/node/node.package'

console.log(`Core Version: ${new NodePackage().getVersion()}`)

/**
 * Public Environment Variables
 */
const env: Env = {
    PORT: process.env.PORT || '',
    ALLOWED_REQUESTS: Number(process.env.ALLOWED_REQUESTS) || 0,
    DELAY_BY_REQUEST: Number(process.env.DELAY_BY_REQUEST) || 3600,
    APP_VERSION: process.env.npm_package_version || '',
    DELTA_PROBABILITY_ERROR: Number(process.env.DELTA_PROBABILITY_ERROR) || 0.1,
    CURRENT_ACCURACY: Number(process.env.CURRENT_ACCURACY) || 0.75,
    TIMEZONE: process.env.TIMEZONE || ''
}

/**
 * Private Environment Variables
 */
const privateEnv: PrivateEnv = {
    BET_KEY_AUTH: process.env.BET_KEY_AUTH || '',
    FOOTBALL_API_BASE_URL: process.env.FOOTBALL_API_BASE_URL || '',
    FOOTBALL_FIRST_API_KEY: process.env.FOOTBALL_FIRST_API_KEY || '',
    FOOTBALL_SECOND_API_KEY: process.env.FOOTBALL_SECOND_API_KEY || '',
    FOOTBALL_THIRD_API_KEY: process.env.FOOTBALL_THIRD_API_KEY || '',
    DB_URL: process.env.DB_URL || '',
    DB_NAME: process.env.DB_NAME || '',
    ANDROID_SECRET_KEY: process.env.ANDROID_SECRET_KEY || '',
    FLUTTER_SECRET_KEY: process.env.FLUTTER_SECRET_KEY || '',
    ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY || '',
    ESTIMATE_HOME_POINTS_PER_ROUND: Number(process.env.ESTIMATE_HOME_POINTS_PER_ROUND) || 2,
    ESTIMATE_AWAY_POINTS_PER_ROUND: Number(process.env.ESTIMATE_AWAY_POINTS_PER_ROUND) || 0.9
}

/**
 * Dependency Injection
 */
const di = new Di(env, privateEnv)

/**
 * GMT-0
 */
const GMT_HOUR = 0

/**
 * America/Lima timezone as Date
 * America/Lima hour GTM-0
 * so 0 (Server hour) - 0 (value set here) -> midnight at GMT
 */
function getDateAtMidnight(): Date {
    const date = new Date()
    date.setHours(GMT_HOUR)
    date.setMinutes(0)
    date.setSeconds(0)
    date.setMilliseconds(0)

    return date
}

/**
 * Update matches from yesterday
 */
function updateMatchesFinished(): void {
    const yesterday = di.resolveDateUtil().getDayBefore(getDateAtMidnight())

    // TODO: Make this on just one request, or at least 1 per day and one per hour
    di.resolveUpdateMatchesByDateUseCase().execute(getDateAtMidnight())
    di.resolveUpdateMatchesByDateUseCase().execute(yesterday)
}

new CronBuilder()
    .withHour("*")
    .withMinutes("*/5")
    .schedule(updateMatchesFinished)
    .build()

/**
* Sync matches for three days before
*/
async function syncMatches(): Promise<void> {
    const today = getDateAtMidnight()
    const dateUtil = di.resolveDateUtil()
    const threeDaysAfter = dateUtil.getDayAfter(dateUtil.getDayAfter(dateUtil.getDayAfter(today)))

    await di.resolveSyncMatchesUseCase().execute(threeDaysAfter)
    console.log(`Server: Syncing matches for ${threeDaysAfter}. Execute at ${today.toISOString()}`)
}

new CronBuilder()
    .withHour(GMT_HOUR.toString())
    .withMinutes("5")
    .schedule(syncMatches)
    .build()

/**
 * Delete matches 15 days ago
 */
async function deleteMatches() {
    const DAYS = 15
    const today = getDateAtMidnight()
    const anyDaysAgo = di.resolveDateUtil().getDaysBefore(today, DAYS)

    await di.resolveDeleteMatchesUseCase().execute(anyDaysAgo)
    console.log(`Server: Deleting matches for ${anyDaysAgo.toISOString()}`)
}

new CronBuilder()
    .withHour((GMT_HOUR+1).toString())
    .withMinutes("30")
    .schedule(deleteMatches)
    .build()

/**
 * Delete synchronizations 30 days ago
 */
async function deleteSynchronizations() {
    const DAYS = 30
    const today = getDateAtMidnight()
    const anyDaysAgo = di.resolveDateUtil().getDaysBefore(today, DAYS)

    await di.resolveDeleteSynchronizationsUseCase().execute(anyDaysAgo)
    console.log(`Server: Deleting synchronizations for ${anyDaysAgo.toISOString()}`)
}

new CronBuilder()
    .withHour((GMT_HOUR+1).toString())
    .withMinutes("35")
    .schedule(deleteSynchronizations)
    .build()

/**
* Build Node Js Server
*/
new ServerBuilder()
    .withPort(env.PORT)
    .withMiddleware(di.resolveMiddleware())
    .register('/', di.resolveRouterFacade().getHelloRouter())
    .registerPrivate('/match', di.resolveRouterFacade().getMatchDetailRouter())
    .registerPrivate('/matches', di.resolveRouterFacade().getMatchesRouter())
    .registerPrivate('/synchronization', di.resolveRouterFacade().getSynchronizationDetailRouter())
    .registerPrivate('/synchronizations', di.resolveRouterFacade().getSynchronizationsRouter())
    .registerPrivate('/accuracy', di.resolveRouterFacade().getAccuracyRouter())
    .registerPrivate('/settings', di.resolveRouterFacade().getAppSettings())
    /**
     * BetCup Section
     */
    .registerPrivate('/syncFixtureByLeague', di.resolveRouterFacade().getSyncFixtureByLeagueRouter())
    .registerPrivate('/betcupmatch', di.resolveRouterFacade().getBetCupMatchDetailRouter())
    .registerPrivate('/betcupmatches', di.resolveRouterFacade().getBetCupMatchesRouter())
    .registerPrivate('/betcupleagues', di.resolveRouterFacade().getBetCupLeaguesRouter())
    .build()
