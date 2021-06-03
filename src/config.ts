/*!
 * Retrieves and validates the configuration file.
 */

import fs from "fs/promises"
import fs_ from "fs"
import path from "path"
import { URL } from "url"

/**
 * Configuration.
 */
export interface Config {
    /**
     * The Spotify playlist ID.
     */
    playlist: string,

    /**
     * Spotify API settings.
     */
    api: {
        clientId: string,
        clientSecret: string,
    }

    /**
     * Times to start transitioning the music vibes.
     *
     * Time is an integer from 0-24, in 24 hour format.
     */
    clock: {
        /**
         * When the playlist starts getting played. Starts with hype vibes.
         */
        startTime: number,

        /**
         * When to start playing chill vibes.
         */
        chillVibes: number,

        /**
         * When to start morning vibes.
         */
        morningVibes: number,

        /**
         * When to start hype vibes again.
         */
        hypeVibes: number,
    },
}

/**
 * Retrieves configuration from file.
 *
 * @param filename Configuration filename.
 * @returns A future configuration file.
 */
export async function getConfig(filename?: string): Promise<Config> {
    filename ??= defaultConfigPath()

    const configString = await fs.readFile(filename, { encoding: "utf8" })
    const config = JSON.parse(configString)

    assertConfig(config);

    return config;
}

export function defaultConfigPath(): string {
    return process.argv[2] ?? "config.json"
}

export function assertConfig(config: any): asserts config is Config {
    // the basics
    assertPrimitive("playlist", "string", config.playlist);
    assertPrimitive("api", "object", config.api);
    assertPrimitive("clock", "object", config.clock);

    // clock values
    assertPrimitive("clock.startTime", "number", config.clock.startTime);
    assertPrimitive("clock.chillVibes", "number", config.clock.chillVibes);
    assertPrimitive("clock.morningVibes", "number", config.clock.morningVibes);
    assertPrimitive("clock.hypeVibes", "number", config.clock.hypeVibes);

    // api values
    assertPrimitive("api.clientId", "string", config.api.clientId)
    assertPrimitive("api.clientSecret", "string", config.api.clientSecret)

    // object is good
    return config;
}

//

type PrimitiveType = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"

function assertPrimitive(name: string, type: PrimitiveType, value: unknown) {
    const valueType = typeof value;
    if (valueType !== type) {
        throw new TypeError(`'${name} is not ${type}, it is ${valueType}.`)
    }
}
