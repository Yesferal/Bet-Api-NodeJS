import { AxiosDataSource } from 'bet-core-node/lib/framework/axios/axios.data.source'
import { MongooseDataSource } from 'bet-core-node/lib/framework/mongoose/mongoose.data.source'
import { ApiDataSource } from 'bet-core-node/lib/domain/abstraction/api.data.source'
import { DatabaseDataSource } from 'bet-core-node/lib/domain/abstraction/database.data.source'
import { MatchRepository } from 'bet-core-node/lib/domain/data/match.repository'
import { StandingRepository } from 'bet-core-node/lib/domain/data/standing.repository'
import { FilterMatchesUseCase } from 'bet-core-node/lib/domain/usecase/filter.matches.usecase'
import { SyncMatchesUseCase } from 'bet-core-node/lib/domain/usecase/sync.matches.usecase'
import { MongooseBuilder } from 'bet-core-node/lib/framework/mongoose/mongoose.builder'
import { RouterFacade } from '../router/router.facade'
import { GetMatchesUseCase } from 'bet-core-node/lib/domain/usecase/get.matches.usecase'
import { DateUtil } from 'bet-core-node/lib/domain/util/date.util'
import { Middleware } from '../middleware/middleware'
import { Env } from '../util/env'
import { PrivateEnv } from '../util/private.env'
import { GetMatchDetailUseCase } from 'bet-core-node/lib/domain/usecase/get.match.detail.usecase'
import { SynchronizationRepository } from 'bet-core-node/lib/domain/data/synchronization.repository'
import { GetSynchronizationDetailUseCase } from 'bet-core-node/lib/domain/usecase/get.synchronization.detail'
import { UpdateMatchesFinishedUseCase } from 'bet-core-node/lib/domain/usecase/update.matches.finished.usecase'
import { GetSynchronizationsUseCase } from 'bet-core-node/lib/domain/usecase/get.synchronizations.usecase'
import { GetAccuracyUseCase } from 'bet-core-node/lib/domain/usecase/get.accuracy.usecase'
import { GetBetResultUseCase } from 'bet-core-node/lib/domain/usecase/get.bet.result.usecase'
import { DeleteMatchesUseCase } from 'bet-core-node/lib/domain/usecase/delete.matches.usecase'
import { DeleteSynchronizationsUseCase } from 'bet-core-node/lib/domain/usecase/delete.syncs.usecase'
import { GetBlackLeaguesListUseCase } from 'bet-core-node/lib/domain/usecase/get.black.leagues.list.usecase'
import { LeagueRepository } from 'bet-core-node/lib/domain/data/league.repository'
import { FilterLeaguesDetectedUseCase } from 'bet-core-node/lib/domain/usecase/filter.leagues.detected.usecase'
import { FilterLeaguesSelectedUseCase } from 'bet-core-node/lib/domain/usecase/filter.leagues.selected.usecase'
import { GetClientSettingsUseCase } from 'bet-core-node/lib/domain/usecase/client/get.client.settings.usecase'
import { ClientRepository } from 'bet-core-node/lib/domain/data/client/client.repository'
import { ClientDataSource } from 'bet-core-node/lib/domain/abstraction/client/client.data.source'
import { SyncMatchesByLeagueUseCase } from 'bet-core-node/lib/domain/usecase/server/sync.matches.by.league.usecase'
import { BetCupDataSource } from 'bet-core-node/lib/domain/abstraction/betcup/betcup.client.data.source'

export class Di {
    private mongooseDataSource: MongooseDataSource | undefined
    private matchRepository: MatchRepository | undefined
    private leagueRepository: LeagueRepository | undefined
    private axioDataSourceWithFirstAuth: ApiDataSource | undefined
    private standingRepositoryWithFirstAuth: StandingRepository | undefined
    private filterMatchesUseCaseWithFirstAuth: FilterMatchesUseCase | undefined
    private axioDataSourceWithSecondAuth: ApiDataSource | undefined
    private standingRepositoryWithSecondAuth: StandingRepository | undefined
    private filterMatchesUseCaseWithSecondAuth: FilterMatchesUseCase | undefined
    private axioDataSourceWithThirdAuth: ApiDataSource | undefined
    private standingRepositoryWithThirdAuth: StandingRepository | undefined
    private filterMatchesUseCaseWithThirdAuth: FilterMatchesUseCase | undefined
    private syncMatchesUseCase: SyncMatchesUseCase | undefined
    private syncMatchesByLeagueUseCase: SyncMatchesByLeagueUseCase | undefined
    private updateMatchesFinishedUseCase: UpdateMatchesFinishedUseCase | undefined
    private getMatchesUseCase: GetMatchesUseCase | undefined
    private getBlackListLeagueUseCase: GetBlackLeaguesListUseCase | undefined
    private getMatchDetailUseCase: GetMatchDetailUseCase | undefined
    private getClientSettingsUseCase: GetClientSettingsUseCase | undefined
    private routerFacade: RouterFacade | undefined
    private dateUtil: DateUtil | undefined
    private middleware: Middleware | undefined
    private synchronizationRepository: SynchronizationRepository | undefined
    private clientRepository: ClientRepository | undefined
    private getSynchronizationDetailUseCase: GetSynchronizationDetailUseCase | undefined
    private getSynchronizationsUseCase: GetSynchronizationsUseCase | undefined
    private getAccuracyUseCase: GetAccuracyUseCase | undefined
    private getBetResultUseCase: GetBetResultUseCase | undefined
    private deleteMatchesUseCase: DeleteMatchesUseCase | undefined
    private deleteSynchronizationsUseCase: DeleteSynchronizationsUseCase | undefined
    private filterLeaguesDetectedUseCase: FilterLeaguesDetectedUseCase | undefined
    private filterLeaguesSelectedUseCase: FilterLeaguesSelectedUseCase | undefined

    constructor(private env: Env, private privateEnv: PrivateEnv) {
        console.log(`Init with config vars: ${JSON.stringify(env)}`)
    }

    private resolveAxioDataSourceWithFirstAuth() {
        return this.axioDataSourceWithFirstAuth || (this.axioDataSourceWithFirstAuth = new AxiosDataSource(this.privateEnv.FOOTBALL_API_BASE_URL, this.privateEnv.FOOTBALL_FIRST_API_KEY, this.env.TIMEZONE))
    }

    private resolveAxioDataSourceWithSecondAuth() {
        return this.axioDataSourceWithSecondAuth || (this.axioDataSourceWithSecondAuth = new AxiosDataSource(this.privateEnv.FOOTBALL_API_BASE_URL, this.privateEnv.FOOTBALL_SECOND_API_KEY, this.env.TIMEZONE))
    }

    private resolveAxioDataSourceWithThirdAuth() {
        return this.axioDataSourceWithThirdAuth || (this.axioDataSourceWithThirdAuth = new AxiosDataSource(this.privateEnv.FOOTBALL_API_BASE_URL, this.privateEnv.FOOTBALL_THIRD_API_KEY, this.env.TIMEZONE))
    }

    private resolveMongoose(): MongooseDataSource {
        const mongooseConnection = new MongooseBuilder()
            .withUrl(this.privateEnv.DB_URL)
            .withName(this.privateEnv.DB_NAME)
            .build()

        return this.mongooseDataSource || (this.mongooseDataSource = new MongooseDataSource(mongooseConnection, this.resolveDateUtil()))
    }

    private resolveDatabaseDataSource(): DatabaseDataSource {
        return this.resolveMongoose()
    }

    private resolveClientDataSource(): ClientDataSource {
        return this.resolveMongoose()
    }

    private resolveBetCupClientDataSource(): BetCupDataSource {
        return this.resolveMongoose()
    }

    private resolveMatchRepository() {
        return this.matchRepository || (this.matchRepository = new MatchRepository(this.resolveAxioDataSourceWithFirstAuth(), this.resolveDatabaseDataSource(), this.resolveBetCupClientDataSource()))
    }

    private resolveLeagueRepository() {
        return this.leagueRepository || (this.leagueRepository = new LeagueRepository(this.resolveDatabaseDataSource()))
    }

    private resolveStadingRepositoryWithFirstAuth() {
        return this.standingRepositoryWithFirstAuth || (this.standingRepositoryWithFirstAuth = new StandingRepository(this.resolveAxioDataSourceWithFirstAuth()))
    }

    private resolveStadingRepositoryWithSecondAuth() {
        return this.standingRepositoryWithSecondAuth || (this.standingRepositoryWithSecondAuth = new StandingRepository(this.resolveAxioDataSourceWithSecondAuth()))
    }

    private resolveStadingRepositoryWithThirdAuth() {
        return this.standingRepositoryWithThirdAuth || (this.standingRepositoryWithThirdAuth = new StandingRepository(this.resolveAxioDataSourceWithThirdAuth()))
    }

    private resolveFilterMatchesUseCaseWithFirstAuth() {
        return this.filterMatchesUseCaseWithFirstAuth || (this.filterMatchesUseCaseWithFirstAuth = new FilterMatchesUseCase(this.resolveStadingRepositoryWithFirstAuth(), this.env.DELTA_PROBABILITY_ERROR, this.env.CURRENT_ACCURACY,
            this.privateEnv.ESTIMATE_HOME_POINTS_PER_ROUND, this.privateEnv.ESTIMATE_AWAY_POINTS_PER_ROUND))
    }

    private resolveFilterMatchesUseCaseWithSecondAuth() {
        return this.filterMatchesUseCaseWithSecondAuth || (this.filterMatchesUseCaseWithSecondAuth = new FilterMatchesUseCase(this.resolveStadingRepositoryWithSecondAuth(), this.env.DELTA_PROBABILITY_ERROR, this.env.CURRENT_ACCURACY,
            this.privateEnv.ESTIMATE_HOME_POINTS_PER_ROUND, this.privateEnv.ESTIMATE_AWAY_POINTS_PER_ROUND))
    }

    private resolveFilterMatchesUseCaseWithThirdAuth() {
        return this.filterMatchesUseCaseWithThirdAuth || (this.filterMatchesUseCaseWithThirdAuth = new FilterMatchesUseCase(this.resolveStadingRepositoryWithThirdAuth(), this.env.DELTA_PROBABILITY_ERROR, this.env.CURRENT_ACCURACY,
            this.privateEnv.ESTIMATE_HOME_POINTS_PER_ROUND, this.privateEnv.ESTIMATE_AWAY_POINTS_PER_ROUND))
    }

    private resolveSynchronizationRepository() {
        return this.synchronizationRepository || (this.synchronizationRepository = new SynchronizationRepository(this.resolveDatabaseDataSource()))
    }

    private resolveClientRepository() {
        return this.clientRepository || (this.clientRepository = new ClientRepository(this.resolveClientDataSource()))
    }

    resolveUpdateMatchesFinishedUseCase() {
        return this.updateMatchesFinishedUseCase || (this.updateMatchesFinishedUseCase = new UpdateMatchesFinishedUseCase(this.resolveMatchRepository(), this.resolveSynchronizationRepository(), this.resolveDateUtil(), this.resolveGetBetResultUseCase()))
    }

    resolveSyncMatchesUseCase() {
        return this.syncMatchesUseCase || (this.syncMatchesUseCase = new SyncMatchesUseCase(this.resolveMatchRepository(),
            [this.resolveFilterMatchesUseCaseWithFirstAuth(), this.resolveFilterMatchesUseCaseWithSecondAuth(), this.resolveFilterMatchesUseCaseWithThirdAuth()],
            this.resolveFilterLeaguesDetectedUseCase(), this.resolveFilterLeaguesSelectedUseCase(), this.env.ALLOWED_REQUESTS, this.env.DELAY_BY_REQUEST, this.resolveSynchronizationRepository(), this.resolveDateUtil()))
    }

    private resolveFilterLeaguesDetectedUseCase() {
        return this.filterLeaguesDetectedUseCase || (this.filterLeaguesDetectedUseCase = new FilterLeaguesDetectedUseCase())
    }

    private resolveFilterLeaguesSelectedUseCase() {
        return this.filterLeaguesSelectedUseCase || (this.filterLeaguesSelectedUseCase = new FilterLeaguesSelectedUseCase(this.resolveGetBlackListLeaguesUseCase()))
    }

    private resolveGetBlackListLeaguesUseCase() {
        return this.getBlackListLeagueUseCase || (this.getBlackListLeagueUseCase = new GetBlackLeaguesListUseCase(this.resolveLeagueRepository()))
    }

    private resolveGetMatchesUseCase() {
        return this.getMatchesUseCase || (this.getMatchesUseCase = new GetMatchesUseCase(this.resolveMatchRepository(), this.resolveDateUtil()))
    }

    private resolveGetMatchDetailUseCase() {
        return this.getMatchDetailUseCase || (this.getMatchDetailUseCase = new GetMatchDetailUseCase(this.resolveMatchRepository()))
    }

    private resolveGetSynchronizationDetailUseCase() {
        return this.getSynchronizationDetailUseCase || (this.getSynchronizationDetailUseCase = new GetSynchronizationDetailUseCase(this.resolveSynchronizationRepository(), this.resolveDateUtil()))
    }

    private resolveGetSynchronizationsUseCase() {
        return this.getSynchronizationsUseCase || (this.getSynchronizationsUseCase = new GetSynchronizationsUseCase(this.resolveSynchronizationRepository()))
    }

    private resolveGetBetResultUseCase() {
        return this.getBetResultUseCase || (this.getBetResultUseCase = new GetBetResultUseCase())
    }

    resolveDeleteMatchesUseCase() {
        return this.deleteMatchesUseCase || (this.deleteMatchesUseCase = new DeleteMatchesUseCase(this.resolveMatchRepository(), this.resolveDateUtil()))
    }

    resolveDeleteSynchronizationsUseCase() {
        return this.deleteSynchronizationsUseCase || (this.deleteSynchronizationsUseCase = new DeleteSynchronizationsUseCase(this.resolveSynchronizationRepository(), this.resolveDateUtil()))
    }

    private resolveAccuracyUseCase() {
        return this.getAccuracyUseCase || (this.getAccuracyUseCase = new GetAccuracyUseCase(this.resolveMatchRepository(), this.resolveDateUtil(), this.resolveGetBetResultUseCase()))
    }

    private resolveGetClientSettingsUseCase() {
        return this.getClientSettingsUseCase || (this.getClientSettingsUseCase = new GetClientSettingsUseCase(this.resolveClientRepository()))
    }

    resolveRouterFacade() {
        return this.routerFacade || (this.routerFacade = new RouterFacade(this.resolveGetMatchDetailUseCase(), this.resolveGetMatchesUseCase(), this.env, this.resolveGetSynchronizationDetailUseCase(), this.resolveGetSynchronizationsUseCase(), this.resolveAccuracyUseCase(), this.resolveGetClientSettingsUseCase(), this.resolveSyncMatchesByLeagueUseCase()))
    }

    private resolveSyncMatchesByLeagueUseCase() {
        return this.syncMatchesByLeagueUseCase || (this.syncMatchesByLeagueUseCase = new SyncMatchesByLeagueUseCase(this.resolveMatchRepository()))
    }

    resolveDateUtil() {
        return this.dateUtil || (this.dateUtil = new DateUtil())
    }

    resolveMiddleware() {
        return this.middleware || (this.middleware = new Middleware(this.privateEnv.BET_KEY_AUTH, [this.privateEnv.ANDROID_SECRET_KEY, this.privateEnv.IOS_SECRET_KEY]))
    }
}
