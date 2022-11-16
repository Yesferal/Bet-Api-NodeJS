export interface PrivateEnv {
    BET_KEY_AUTH: string,
    FOOTBALL_API_BASE_URL: string,
    FOOTBALL_FIRST_API_KEY: string,
    FOOTBALL_SECOND_API_KEY: string,
    FOOTBALL_THIRD_API_KEY: string,
    DB_URL: string,
    DB_NAME: string,
    ANDROID_SECRET_KEY: string,
    IOS_SECRET_KEY: string,
    /**
     * Its mean that we estimate that, on average,
     * A home team make 2 points per match played
     */
    ESTIMATE_HOME_POINTS_PER_ROUND: number,
    /**
     * Its mean that we estimate that, on average,
     * An away team make less than 1 point per match played
     */
    ESTIMATE_AWAY_POINTS_PER_ROUND: number
}
