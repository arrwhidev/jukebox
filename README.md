# Jukebox

Jukebox lets people add songs to a Spotify playlist by tweeting them.

Once Jukebox is configured and running it will search for tweets that start with the configured hashtag.

For example, someone could tweet ```#aswjukebox led zeppelin kashmir``` and Jukebox will add it to the configured Spotify playlist.
Tweeting ```#aswjukebox kashmir``` would probably work too but being more specific will help to ensure the correct song gets added.

## Requirements

1. You'll need a Spotify account and a Twitter account. Obviously!
2. You need to create developer accounts on both to obtain the required client secrets and tokens.
3. Install node.js

## Getting started

1. Clone this repo.
2. Install npm dependencies; ```npm install```
3. Configure ```config.js``` with your client secrets and pick your hashtag.
4. Start Jukebox; ```node index.js```
5. Visit ```http://localhost:8888``` in a browser and login to Spotify to authorize it.

## Caveats

1. Jukebox adds the first song that matches the search request. If you tweet ```#aswjukebox love``` who knows what song will get added to the playlist... fun!
2. Jukebox won't find private tweets.
3. Tweets must start with the hashtag.

## Notes

I'm not primarily a JavaScript developer. I started this project to improve my JS skills. I'm definitely open to constructive criticisms and advice on how I can improve.

There's loads left to do on this project so feel free to contribute!

Add songs to my playlist using ```#aswjukebox``` :)
