export interface Env {
    PORT: string,
    ALLOWED_REQUESTS: number,
    DELAY_BY_REQUEST: number,
    APP_VERSION: string,
    /**
     * Its a value to minimize the error
     * when we pick some matches up due to a posible miscalculation
     */
    DELTA_PROBABILITY_ERROR: number,
    /**
     * Its should increase/decrease dependning on the week results
     * in order to make the following probability more accurate
     */
    CURRENT_ACCURACY: number,
    TIMEZONE: string
}
