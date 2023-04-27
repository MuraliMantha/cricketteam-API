const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running");
    });
  } catch (e) {
    console.log(`Error msg: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// get players
app.get("/players/", async (request, response) => {
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };

  const getPlayers = `
    SELECT * FROM cricket_team ORDER BY player_id;`;
  const playerArray = await db.all(getPlayers);
  response.send(
    playerArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//add player
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerId, playerName, jerseyNumber, role } = playerDetails;
  const addPlayer = `
    INSERT INTO cricket_team (player_id,player_name, jersey_number,role)
    VALUES
    (
        "${playerId}","${playerName}","${jerseyNumber}","${role}"
    );`;

  const dbresponse = await db.run(addPlayer);
  const teamId = dbresponse.lastID;
  response.send({ teamId: teamId });
});
//get a player
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
    SELECT * FROM cricket_team 
    WHERE player_id = ${playerId};`;

  const player = await db.get(getPlayer);
  response.send(player);
});

//update player
app.put("/players/:playerId/", async (request, response) => {
  const playerDetails = request.body;
  const { playerId } = request.params;
  const { player_id, playerName, jerseyNumber, role } = playerDetails;
  const updatePlayer = `
    UPDATE cricket_team SET 
  
        player_Id="${playerId}",
        player_name="${playerName}",
        jersey_number="${jerseyNumber}",
        role="${role}"
        WHERE player_id = ${playerId};`;

  const dbresponse = await db.run(updatePlayer);

  response.send("player updated");
});

//delete player

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
    DELETE FROM cricket_team 
    WHERE player_id = ${playerId};`;

  const player = await db.get(deletePlayer);
  response.send("deleted player");
});
