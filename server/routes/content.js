const router = require("express").Router();
const Tracks = require("../db/Tracks");
const Profile = require("../db/Profile");
const JamSession = require("../db/JamSession");
const { getLatLong } = require("../services/getLatLong");

const { reset, addPlaylistToRundown } = require("../services/rundown/rundown");
const sessionFlag = require("../services/utl/globalVariableModule");

router.post("/next-content", async (req, res) => {
  const userEmail = req.session.email;
  const { curTrack, nextTrack, jamSessionId } = req.body;

  const profile = await Profile.findOne({
    where: {
      userEmail: userEmail,
    },
  });

  let jamSession;

  if (jamSessionId) {
    jamSession = await JamSession.findOne({
      where: {
        jamSessionId: jamSessionId,
        userEmail: userEmail,
      },
    });
    sessionFlag.set(false);
  }

  if (!jamSession) {
    jamSession = await JamSession.create({
      userEmail: userEmail,
      jamSessionId: jamSessionId,
    });
    let { latitude, longitude } = await getLatLong(profile.zip);

    await Profile.update(
      {
        lat: latitude,
        long: longitude,
      },
      {
        where: {
          userEmail: userEmail,
        },
      }
    );
    sessionFlag.set(true);
  }

  await Tracks.upsert({
    userEmail: userEmail,
    curTrack: curTrack,
    nextTrack: nextTrack,
  });

  const content = await addPlaylistToRundown(userEmail, jamSessionId, profile);
  res.json(content);
});

router.post("/reset", (req, res) => {
  reset();
  res.send("Rundown index reset!");
});

router.post("/add-playlist", (req, res) => {
  const { playlist } = req.body;
  if (!playlist) {
    return res.status(400).send("Playlist is required");
  }
  let updatedShow = addPlaylistToRundown(playlist);
  res.json(updatedShow);
});

module.exports = router;
