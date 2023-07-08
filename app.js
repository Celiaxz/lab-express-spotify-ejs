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
      artists: artistsSearch.body.artists.items,
    });
  } catch (err) {
    console.log("The error while searching artists occurred: ", err);
  }
});

app.get("/albums/:artistId", async (req, res, next) => {
  try {
    const myrequest = req.params;
    console.log("my request: ", myrequest);
    const albumsSearch = await spotifyApi.getArtistAlbums(myrequest.artistId);
    console.log("my artist album: ", albumsSearch);
    res.render("albums", { albums: albumsSearch.body.items });
  } catch (err) {
    console.log("error while searching albums: ", err);
  }
  // .getArtistAlbums() code goes here
});

app.listen(3000, () =>
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊")
);
