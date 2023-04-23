const express = require("express");
const cors = require("cors");
const axios = require("axios");
const querystring = require("querystring");

var scopes = [
  "user-read-private",
  "user-read-email",
  "user-modify-playback-state",
  "user-read-playback-state",
  "user-read-currently-playing",
  "playlist-modify-private",
  "playlist-modify-public",
  "user-follow-modify",
  "user-follow-read",
  "user-top-read",
  "user-read-recently-played",
  "user-library-modify",
  "user-library-read",
  "ugc-image-upload",
];

const API_BASE = process.env.APP_API_BASE;

const SITE_URL = process.env.APP_SITE_URL;

const CLIENT_ID = "56a9254bb00a40349299525a0bb6e083";
const CLIENT_SECRET = "b2972ce0bcd24cc5a8dd475d04465d2e";
const REDIRECT_URI = API_BASE + "/callback";

const GEN_ID = "cf09c982d4d44aeea96938bcfd95de8e";
const GEN_SECRET = "740b14b6fc8846f791d053c1feb3f54d";

const app = express();

var user = 0;

function setUser(value) {
  console.log(user);
  user = value;
}

function getUser() {
  return user;
}

var port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

app.listen(3001, () => {
  console.log("running server");
});

const generateRandomString = (length) => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const stateKey = "spotify_auth_state";

app.get("/", (req, res) => {
  res.send("Statify Backend by Alan Zhan");
});

app.get("/login", (req, res) => {
  const state = generateRandomString(16);
  res.cookie(stateKey, state);
  const queryParams = querystring.stringify({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: scopes.join(" "),
    show_dialog: true,
  });
  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

app.get("/callback", (req, res) => {
  const code = req.query.code || null;

  axios({
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    data: querystring.stringify({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: REDIRECT_URI,
    }),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${new Buffer.from(
        `${CLIENT_ID}:${CLIENT_SECRET}`
      ).toString("base64")}`,
    },
  })
    .then((response) => {
      if (response.status === 200) {
        const { access_token, refresh_token, expires_in } = response.data;

        const queryParams = querystring.stringify({
          access_token,
          refresh_token,
          expires_in,
        });

        res.redirect(`${SITE_URL}/?${queryParams}`);
      } else {
        res.redirect(SITE_URL);
      }
    })
    .catch((error) => {
      res.redirect(SITE_URL);
    });
});

app.get("/refresh_token", (req, res) => {
  const { refresh_token } = req.query;

  axios({
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    data: querystring.stringify({
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    }),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${new Buffer.from(
        `${CLIENT_ID}:${CLIENT_SECRET}`
      ).toString("base64")}`,
    },
  })
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      res.send(error);
    });
});

app.get("/artist", (req, res) => {
  console.log("request");
  axios({
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    data: querystring.stringify({
      grant_type: "client_credentials",
    }),
    headers: {
      Authorization: `Basic ${new Buffer.from(
        `${GEN_ID}:${GEN_SECRET}`
      ).toString("base64")}`,
    },
    json: true,
  }).then((response) => {
    var token = response.data.access_token;
    axios({
      method: "get",
      url: `https://api.spotify.com/v1/artists/${req.query.id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      json: true,
    })
      .then((response) => {
        res.send(response.data);
      })
      .catch((error) => {
        res.send(error);
      });
  });
});

app.get("/artist-top-tracks", (req, res) => {
  axios({
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    data: querystring.stringify({
      grant_type: "client_credentials",
    }),
    headers: {
      Authorization: `Basic ${new Buffer.from(
        `${GEN_ID}:${GEN_SECRET}`
      ).toString("base64")}`,
    },
    json: true,
  }).then((response) => {
    var token = response.data.access_token;
    axios({
      method: "get",
      url: `https://api.spotify.com/v1/artists/${req.query.id}/top-tracks?market=US`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      json: true,
    })
      .then((response) => {
        res.send(response.data);
      })
      .catch((error) => {
        res.send(error);
      });
  });
});

app.get("/artist-albums", (req, res) => {
  axios({
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    data: querystring.stringify({
      grant_type: "client_credentials",
    }),
    headers: {
      Authorization: `Basic ${new Buffer.from(
        `${GEN_ID}:${GEN_SECRET}`
      ).toString("base64")}`,
    },
    json: true,
  }).then((response) => {
    var token = response.data.access_token;
    axios({
      method: "get",
      url: `https://api.spotify.com/v1/artists/${req.query.id}/albums?market=US&include_groups=album,single&limit=20`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      json: true,
    })
      .then((response) => {
        res.send(response.data);
      })
      .catch((error) => {
        res.send(error);
      });
  });
});

app.get("/album", (req, res) => {
  axios({
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    data: querystring.stringify({
      grant_type: "client_credentials",
    }),
    headers: {
      Authorization: `Basic ${new Buffer.from(
        `${GEN_ID}:${GEN_SECRET}`
      ).toString("base64")}`,
    },
    json: true,
  }).then((response) => {
    var token = response.data.access_token;
    axios({
      method: "get",
      url: `https://api.spotify.com/v1/albums/${req.query.id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      json: true,
    })
      .then((response) => {
        res.send(response.data);
      })
      .catch((error) => {
        res.send(error);
      });
  });
});

app.get("/featured-playlists", (req, res) => {
  axios({
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    data: querystring.stringify({
      grant_type: "client_credentials",
    }),
    headers: {
      Authorization: `Basic ${new Buffer.from(
        `${GEN_ID}:${GEN_SECRET}`
      ).toString("base64")}`,
    },
    json: true,
  }).then((response) => {
    var token = response.data.access_token;
    axios({
      method: "get",
      url: `https://api.spotify.com/v1/browse/featured-playlists?country=US&limit=10&offset=0`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      json: true,
    })
      .then((response) => {
        res.send(response.data);
      })
      .catch((error) => {
        res.send(error);
      });
  });
});

app.get("/playlists", (req, res) => {
  axios({
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    data: querystring.stringify({
      grant_type: "client_credentials",
    }),
    headers: {
      Authorization: `Basic ${new Buffer.from(
        `${GEN_ID}:${GEN_SECRET}`
      ).toString("base64")}`,
    },
    json: true,
  }).then((response) => {
    var token = response.data.access_token;
    axios({
      method: "get",
      url: `https://api.spotify.com/v1/playlists/${req.query.id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      json: true,
    })
      .then((response) => {
        res.send(response.data);
      })
      .catch((error) => {
        res.send(error);
      });
  });
});

app.get("/audio-features", (req, res) => {
  axios({
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    data: querystring.stringify({
      grant_type: "client_credentials",
    }),
    headers: {
      Authorization: `Basic ${new Buffer.from(
        `${GEN_ID}:${GEN_SECRET}`
      ).toString("base64")}`,
    },
    json: true,
  }).then((response) => {
    var token = response.data.access_token;
    axios({
      method: "get",
      url: `https://api.spotify.com/v1/audio-features?ids=${req.query.id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      json: true,
    })
      .then((response) => {
        res.send(response.data);
      })
      .catch((error) => {
        res.send(error);
      });
  });
});

app.get("/user", (req, res) => {
  axios({
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    data: querystring.stringify({
      grant_type: "client_credentials",
    }),
    headers: {
      Authorization: `Basic ${new Buffer.from(
        `${GEN_ID}:${GEN_SECRET}`
      ).toString("base64")}`,
    },
    json: true,
  }).then((response) => {
    var token = response.data.access_token;
    axios({
      method: "get",
      url: `https://api.spotify.com/v1/users/${req.query.id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      json: true,
    })
      .then((response) => {
        res.send(response.data);
      })
      .catch((error) => {
        res.send(error);
      });
  });
});

app.get("/user-playlists", (req, res) => {
  axios({
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    data: querystring.stringify({
      grant_type: "client_credentials",
    }),
    headers: {
      Authorization: `Basic ${new Buffer.from(
        `${GEN_ID}:${GEN_SECRET}`
      ).toString("base64")}`,
    },
    json: true,
  }).then((response) => {
    var token = response.data.access_token;
    axios({
      method: "get",
      url: `https://api.spotify.com/v1/users/${req.query.id}/playlists?limit=10&offset=0`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      json: true,
    })
      .then((response) => {
        res.send(response.data);
      })
      .catch((error) => {
        res.send(error);
      });
  });
});

app.get("/track", (req, res) => {
  axios({
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    data: querystring.stringify({
      grant_type: "client_credentials",
    }),
    headers: {
      Authorization: `Basic ${new Buffer.from(
        `${GEN_ID}:${GEN_SECRET}`
      ).toString("base64")}`,
    },
    json: true,
  }).then((response) => {
    var token = response.data.access_token;
    axios({
      method: "get",
      url: `https://api.spotify.com/v1/tracks/${req.query.id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      json: true,
    })
      .then((response) => {
        res.send(response.data);
      })
      .catch((error) => {
        res.send(error);
      });
  });
});

app.get("/recommendations", (req, res) => {
  axios({
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    data: querystring.stringify({
      grant_type: "client_credentials",
    }),
    headers: {
      Authorization: `Basic ${new Buffer.from(
        `${GEN_ID}:${GEN_SECRET}`
      ).toString("base64")}`,
    },
    json: true,
  }).then((response) => {
    var token = response.data.access_token;
    var query = `https://api.spotify.com/v1/recommendations/`;
    if (
      req.query.seed_artists &&
      req.query.seed_artists !== null &&
      req.query.seed_artists !== undefined
    ) {
      query += `?seed_artists=${req.query.seed_artists}`;
    }
    if (
      req.query.seed_genres &&
      req.query.seed_genres !== null &&
      req.query.seed_genres !== undefined
    ) {
      query += `?seed_genres=${req.query.seed_genres}`;
    }
    if (
      req.query.seed_tracks &&
      req.query.seed_tracks !== null &&
      req.query.seed_tracks !== undefined
    ) {
      query += `?seed_tracks=${req.query.seed_tracks}`;
    }
    query += `&limit=10`;
    axios({
      method: "get",
      url: query,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      json: true,
    })
      .then((response) => {
        res.send(response.data);
      })
      .catch((error) => {
        res.send(error);
      });
  });
}); 

app.get("/search", (req, res) => {
  console.log("searching for " + req.query.q);
  axios({
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    data: querystring.stringify({
      grant_type: "client_credentials",
    }),
    headers: {
      Authorization: `Basic ${new Buffer.from(
        `${GEN_ID}:${GEN_SECRET}`
      ).toString("base64")}`,
    },
    json: true,
  }).then((response) => {
    var token = response.data.access_token;
    axios({
      method: "get",
      url: `https://api.spotify.com/v1/search/?q=${req.query.q}&type=track,artist,album,playlist&limit=50`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      json: true,
    })
      .then((response) => {
        res.send(response.data);
      })
      .catch((error) => {
        res.send(error);
      });
  });
});
