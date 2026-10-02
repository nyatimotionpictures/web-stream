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
 * @name episodePath
 * @description /episode/:episodeKey/:filmKey/:seasonKey
 *
 * The episode page resolves the film from the second segment and then looks up
 * the season and episode inside it, so all three have to be present and
 * correct. Episode records only carry seasonId, so a caller listing episodes
 * without their parents gets null rather than a half built url.
 *
 * @param {object} episode
 * @param {object} film the parent series or film
 * @param {object} season
 * @returns {string|null}
 */
export const episodePath = (episode, film, season) => {
    const episodeKey = recordKey(episode);
    const filmKey = recordKey(film);
    const seasonKey = recordKey(season);

    if (!episodeKey || !filmKey || !seasonKey) return null;

    return `/episode/${episodeKey}/${filmKey}/${seasonKey}`;
};

/**
 * @name detailPath
 * @description Build the right path for any film, season or episode record,
 * for the places that render a mixed list. Episodes still need their parents,
 * which a mixed list does not carry, so they resolve to null.
 * @param {object} record
 * @param {{film?: object, season?: object}} [parents]
 * @returns {string|null}
 */
export const detailPath = (record, parents = {}) => {
    if (isEpisode(record)) {
        return episodePath(record, parents.film, parents.season);
    }
    if (isSeason(record)) {
        return seasonPath(record);
    }

    return filmPath(record);
};
