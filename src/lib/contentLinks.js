/**
 * Internal link builders for detail routes.
 *
 * Public urls carry slugs so they stay readable after an id would tell a viewer
 * nothing. The api resolves ids, current slugs and retired slugs alike, so every
 * builder prefers the slug and falls back to the ObjectId, which keeps navigation
 * working for any record that predates the backfill.
 *
 * Each builder returns null when it cannot construct a working path, so a
 * caller can skip navigation instead of pushing a url that cannot resolve.
 */

/**
 * @name recordKey
 * @description The value to put in a url segment: slug when present, otherwise
 * the id. A couple of the older cards were still reading a raw Mongo
 * `{ _id: { $oid } }` shape that the api stopped returning, so that shape is
 * tolerated here rather than at every call site.
 * @param {object|string} record
 * @returns {string|null}
 */
const recordKey = (record) => {
    if (!record) return null;
    if (typeof record === "string") return record;

    if (record._id) {
        return typeof record._id === "string" ? record._id : record._id?.$oid ?? null;
    }

    return record.slug || record.id || null;
};

/**
 * @name recordType
 * @description Lowercased type, or an empty string. Several call sites branch
 * on a substring of type, and some records arrive without one.
 * @param {object} record
 * @returns {string}
 */
const recordType = (record) => String(record?.type ?? "").toLowerCase();

/**
 * @name isSeries
 * @param {object} record
 * @returns {boolean}
 */
export const isSeries = (record) => recordType(record).includes("series");

/**
 * @name isEpisode
 * @param {object} record
 * @returns {boolean}
 */
export const isEpisode = (record) => recordType(record).includes("episode");

/**
 * @name isSeason
 * @param {object} record
 * @returns {boolean}
 */
export const isSeason = (record) => {
    const type = recordType(record);
    return type.includes("season") || type.includes("segment");
};

/**
 * @name filmPath
 * @description /film/:key for a movie, /series/:key for a series.
 * @param {object} film
 * @returns {string|null}
 */
export const filmPath = (film) => {
    const key = recordKey(film);
    if (!key) return null;

    return isSeries(film) ? `/series/${key}` : `/film/${key}`;
};

/**
 * @name seasonPath
 * @description /segments/:key
 * @param {object} season
 * @returns {string|null}
 */
export const seasonPath = (season) => {
    const key = recordKey(season);
    return key ? `/segments/${key}` : null;
};

/**
 * @name matchesRecord
 * @description Whether a url segment identifies a record. Public urls carry
 * slugs but older links and in-app navigation carry ObjectIds, so both have to
 * match. Used to resolve a query param that may hold either.
 * @param {object} record
 * @param {string} param
 * @returns {boolean}
 */
export const matchesRecord = (record, param) =>
    Boolean(record) && Boolean(param) && (record.id === param || record.slug === param);

/**
 * @name recordId
 * @description The stable ObjectId of a record, the inverse of recordKey. Used
 * by the player, which is navigated programmatically and keys its own lookups
 * and state off ids rather than slugs.
 * @param {object|string} record
 * @returns {string|null}
 */
const recordId = (record) => {
    if (!record) return null;
    if (typeof record === "string") return record;

    if (record._id) {
        return typeof record._id === "string" ? record._id : record._id?.$oid ?? null;
    }

    return record.id ?? null;
};

/**
 * @name watchSeriesPath
 * @description /watch/s/:seasonId?ep=:episodeId, the player that handles
 * episode playlists. Ids rather than slugs on purpose: the player is only ever
 * reached by navigating inside the app, never by a shared link, and it resolves
 * its episode against the list it already has in memory.
 * @param {object} season
 * @param {object} episode
 * @returns {string|null}
 */
export const watchSeriesPath = (season, episode) => {
    const seasonId = recordId(season);
    const episodeId = recordId(episode);

    if (!seasonId || !episodeId) return null;

    return `/watch/s/${seasonId}?ep=${episodeId}`;
};

/**
 * @name episodeQueryPath
 * @description /segments/:seasonKey?ep=:episodeKey, which opens the episode
 * details modal on the season page. This is what a shared episode link points
 * at, so the episode is addressable without a page of its own.
 * @param {object} season
 * @param {object} episode
 * @returns {string|null}
 */
export const episodeQueryPath = (season, episode) => {
    const seasonKey = recordKey(season);
    const episodeKey = recordKey(episode);

    if (!seasonKey || !episodeKey) return null;

    return `/segments/${seasonKey}?ep=${episodeKey}`;
};

/**
 * @name detailPath
 * @description Build the right path for a film or season record, for the places
 * that render a mixed list. An episode has no page of its own, so it resolves to
 * null here rather than falling through to a /film/ url that cannot resolve;
 * use episodeQueryPath with its season instead.
 * @param {object} record
 * @returns {string|null}
 */
export const detailPath = (record) => {
    if (isEpisode(record)) {
        return null;
    }
    if (isSeason(record)) {
        return seasonPath(record);
    }

    return filmPath(record);
};
