require("dotenv").config();

const express = require("express");
const expressLayouts = require("express-ejs-layouts");

// require spotify-web-api-node package here:
const SpotifyWebApi = require("spotify-web-api-node");
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => {
    console.log("fetched data sucessful");
    spotifyApi.setAccessToken(data.body["access_token"]);
  })
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );

const app = express();

app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

// setting the spotify-api goes here:

// Our routes go here:
app.get("/", (request, response) => {
  response.render("homePage");
});
app.get("/artist-search", async (request, response) => {
  try {
    const myrequest = request.query;
    console.log("request.query: ", request.query);
    const artistsSearch = await spotifyApi.searchArtists(myrequest.artist);
    console.log("The received data from the API: ", artistsSearch.body);

    response.render("artist-search-results", {
      artistItems: artistsSearch.body.artists.items,
    });
  } catch (err) {
    console.log("The error while searching artists occurred: ", err);
  }
});

app.get("/albums/:artistId", async (req, res, next) => {
  try {
    // extracting the id from the url. Eg: http://localhost:3000/albums/0kgnPJElpccT4mc6IMZ653
    const myrequest = req.params;
    console.log("my request: ", myrequest); // my request:  { artistId: '0kgnPJElpccT4mc6IMZ653' }
    const albumsSearch = await spotifyApi.getArtistAlbums(myrequest.artistId);
    console.log("my artist album: ", albumsSearch);
    res.render("albums", { albumItems: albumsSearch.body.items });
    console.log("one album: ", albumsSearch.body.items[0]);
  } catch (err) {
    console.log("error while searching albums: ", err);
  }
  // .getArtistAlbums() code goes here
});

app.get("/tracks/:albumId", async (req, res) => {
  try {
    // extracting the id from the url. Eg: http://localhost:3000/tracks/4t1QFLS8YBdDo8GgHuVp3w
    const mytrackRequest = req.params;
    console.log("this is my request: ", mytrackRequest); // this is my request:  { albumId: '4t1QFLS8YBdDo8GgHuVp3w' }
    const trackSearch = await spotifyApi.getAlbumTracks(mytrackRequest.albumId);
    console.log("my tracks: ", trackSearch.body.items[0]);
    // const trackItems2 = {
    //   trackItems: trackSearch.body.items
    // }
    res.render("tracks", { trackItems: trackSearch.body.items });
  } catch (err) {
    console.log("something seems to be happening here: ", err);
  }
});
app.listen(3000, () =>
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊")
);
