# Dusty Sorter

A quick and dirty Spotify playlist sorter (actually just copies the playlist and makes a new sorted one, but who's keeping track?) for parties that queues that last multiple days.

It was made for randomising and sorting [Joe](https://github.com/j0dg35)'s 21st birthday collaborative playlist. Though it could be used again in the future.

The program takes a `config.json` file like so:

```json
{
  "playlist": "###",
  "api": {
    "clientId": "###",
    "clientSecret": "###",
    "redirectUri": "http://localhost:8080/callback"
  },
  "clock": {
    "startTime": 17,
    "chillVibes": 4,
    "morningVibes": 10,
    "hypeVibes": 13
  }
}
```

And creates a new Spotify playlist with the music sorted for you.

To make use of it, put the Spotify playlist ID in `playlist`, the [Spotify API keys](https://developer.spotify.com/dashboard/applications) in `api.clientId` and `api.clientSecret` and get going.

The music goes from hype → chill → morning → hype music at the specified times (in 24 hour format)... Starting at 5 PM, changing to chill music at 4 AM, to morning music at 10 AM and back to hype at 1 PM.

How the different music styles are selected is specified in [sorter.ts](src/sorter.ts).

## Usage

If you pass no parameters to the program, it will look for `config.json` in the current working directory.

```bash
npx dusty-sorter
```

You can optionally choose a specific `config.json` from the command-line as the first argument.

```bash
npx dusty-sorter ~/config/joe-bday.json
```

You can omit creating the new playlist (for testing) by passing `--no-upload` afterwards.

```bash
npx dusty-sorter ~/config/joe-bday.json --no-upload
```

The program also drops a detailed song listing called `playlist.txt` in the current working directory detailing the times the songs will play (assuming no gaps or fade), the current vibe and audio feature details.
