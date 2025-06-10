// server.js (Create this file in a new backend project directory)
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'cricket_app.db');

// --- Database Setup ---
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
    throw err;
  }
  console.log('Connected to the SQLite database.');
  initializeDbSchema();
});

function initializeDbSchema() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL, /* In a real app, store hashed passwords! */
      email TEXT,
      role TEXT NOT NULL,
      profilePictureUrl TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS leagues (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      location TEXT,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      leagueId TEXT NOT NULL,
      captainId TEXT,
      logoUrl TEXT,
      UNIQUE(name, leagueId),
      FOREIGN KEY (leagueId) REFERENCES leagues(id) ON DELETE CASCADE,
      FOREIGN KEY (captainId) REFERENCES players(id) ON DELETE SET NULL
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT UNIQUE,
      profilePictureUrl TEXT
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS player_teams (
        playerId TEXT NOT NULL,
        teamId TEXT NOT NULL,
        PRIMARY KEY (playerId, teamId),
        FOREIGN KEY (playerId) REFERENCES players(id) ON DELETE CASCADE,
        FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      leagueId TEXT NOT NULL,
      teamAId TEXT NOT NULL,
      teamBId TEXT NOT NULL,
      dateTime TEXT NOT NULL,
      venue TEXT,
      overs INTEGER DEFAULT 15,
      status TEXT DEFAULT 'Scheduled', /* Scheduled, Live, Completed, Abandoned */
      tossWonByTeamId TEXT,
      choseTo TEXT, /* 'Bat' or 'Bowl' */
      umpire1 TEXT,
      umpire2 TEXT,
      result TEXT,
      scorecardId TEXT UNIQUE,
      FOREIGN KEY (leagueId) REFERENCES leagues(id) ON DELETE CASCADE,
      FOREIGN KEY (teamAId) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (teamBId) REFERENCES teams(id) ON DELETE CASCADE
      /* FOREIGN KEY (scorecardId) REFERENCES scorecards(id) ON DELETE SET NULL */
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS scorecards (
        id TEXT PRIMARY KEY,
        matchId TEXT NOT NULL UNIQUE,
        innings1 TEXT, /* JSON string for Innings object */
        innings2 TEXT, /* JSON string for Innings object */
        FOREIGN KEY (matchId) REFERENCES matches(id) ON DELETE CASCADE
    )`);

    // Seed initial admin user if not exists
    db.get("SELECT * FROM users WHERE username = 'admin'", (err, row) => {
      if (!row) {
        const adminId = generateId();
        // IMPORTANT: Never store plain text passwords in a real app. Use bcrypt or similar.
        db.run("INSERT INTO users (id, username, password, role, email) VALUES (?, ?, ?, ?, ?)",
          [adminId, 'admin', 'password', 'ADMIN', 'admin@example.com']);
        console.log("Default admin user created.");
      }
    });
    console.log("Database schema checked/initialized.");
  });
}

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Helper ---
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// --- API Routes ---

// USER AUTH
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    // IMPORTANT: Compare hashed passwords in a real app
    db.get("SELECT id, username, email, role, profilePictureUrl FROM users WHERE username = ? AND password = ?", [username, password], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (user) {
            res.json(user);
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    });
});

app.get('/api/users/:id', (req, res) => {
    db.get("SELECT id, username, email, role, profilePictureUrl FROM users WHERE id = ?", [req.params.id], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (user) res.json(user);
        else res.status(404).json({ error: "User not found" });
    });
});


// LEAGUES
app.get('/api/leagues', (req, res) => {
  db.all("SELECT * FROM leagues ORDER BY startDate DESC", [], async (err, leagueRows) => {
    if (err) return res.status(500).json({ error: err.message });
    // For each league, fetch its teams
    const leaguesWithDetails = [];
    for (const league of leagueRows) {
        const teamsInLeague = await new Promise((resolve, reject) => {
            db.all("SELECT id, name FROM teams WHERE leagueId = ?", [league.id], (teamErr, teamRows) => {
                if (teamErr) reject(teamErr);
                else resolve(teamRows);
            });
        });
        leaguesWithDetails.push({ ...league, teams: teamsInLeague || [] });
    }
    res.json(leaguesWithDetails);
  });
});

app.post('/api/leagues', (req, res) => {
  const { name, location, startDate, endDate } = req.body;
  if (!name || !startDate || !endDate) return res.status(400).json({ error: "Missing required fields" });
  const newLeague = { id: generateId(), name, location, startDate, endDate };
  db.run("INSERT INTO leagues (id, name, location, startDate, endDate) VALUES (?, ?, ?, ?, ?)",
    [newLeague.id, newLeague.name, newLeague.location, newLeague.startDate, newLeague.endDate],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ ...newLeague, teams: [] }); // Return with empty teams array to match frontend expectations
    }
  );
});
// ... PUT /api/leagues/:id , DELETE /api/leagues/:id

// TEAMS
app.get('/api/teams', (req, res) => {
    const { leagueId } = req.query;
    let sql = `
        SELECT t.*, GROUP_CONCAT(pt.playerId) as playerIdsStr 
        FROM teams t 
        LEFT JOIN player_teams pt ON t.id = pt.teamId
    `;
    const params = [];
    if (leagueId) {
        sql += " WHERE t.leagueId = ?";
        params.push(leagueId);
    }
    sql += " GROUP BY t.id ORDER BY t.name";

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const teams = rows.map(row => ({
            ...row,
            playerIds: row.playerIdsStr ? row.playerIdsStr.split(',') : [],
            // 'players' array could be populated here if needed, or fetched separately by frontend/client
        }));
        res.json(teams);
    });
});

app.post('/api/teams', (req, res) => {
    const { name, leagueId, captainId, logoUrl } = req.body;
    if (!name || !leagueId) return res.status(400).json({ error: "Team name and league are required" });
    const newTeam = { id: generateId(), name, leagueId, captainId, logoUrl };
    db.run("INSERT INTO teams (id, name, leagueId, captainId, logoUrl) VALUES (?, ?, ?, ?, ?)",
        [newTeam.id, newTeam.name, newTeam.leagueId, newTeam.captainId, newTeam.logoUrl],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ ...newTeam, playerIds: [], players: [] }); // Match frontend type
        }
    );
});
// ... PUT /api/teams/:id , DELETE /api/teams/:id

// PLAYERS
app.get('/api/players', (req, res) => {
    const { teamId } = req.query; // If specific team's players are requested
    let sql = `
        SELECT p.*, GROUP_CONCAT(pt.teamId) as teamIdsStr 
        FROM players p 
        LEFT JOIN player_teams pt ON p.id = pt.playerId 
    `;
    const params = [];
    if (teamId) {
        // This is a bit tricky: to get players FOR a teamId, we need to ensure pt.teamId = ?
        // The GROUP_CONCAT is for ALL teams a player belongs to.
        // A direct query on player_teams and then joining players might be cleaner for "players in a specific team"
        sql = `SELECT p.*, GROUP_CONCAT(pt_all.teamId) as teamIdsStr
               FROM players p
               JOIN player_teams pt_filter ON p.id = pt_filter.playerId
               LEFT JOIN player_teams pt_all ON p.id = pt_all.playerId
               WHERE pt_filter.teamId = ?
               GROUP BY p.id
               ORDER BY p.lastName, p.firstName`;
        params.push(teamId);
    } else {
        sql += " GROUP BY p.id ORDER BY p.lastName, p.firstName";
    }

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const players = rows.map(row => ({
            ...row,
            teamIds: row.teamIdsStr ? row.teamIdsStr.split(',').filter(id => id) : [] // Ensure no empty strings if no teams
        }));
        res.json(players);
    });
});

app.post('/api/players', (req, res) => {
    const { firstName, lastName, email, profilePictureUrl, teamId } = req.body; // teamId for initial assignment
    if (!firstName || !lastName) return res.status(400).json({ error: "First and last name are required" });
    const newPlayer = { id: generateId(), firstName, lastName, email, profilePictureUrl };
    db.run("INSERT INTO players (id, firstName, lastName, email, profilePictureUrl) VALUES (?, ?, ?, ?, ?)",
        [newPlayer.id, newPlayer.firstName, newPlayer.lastName, newPlayer.email, newPlayer.profilePictureUrl],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (teamId) { // If a primary team is provided, add to player_teams
                db.run("INSERT INTO player_teams (playerId, teamId) VALUES (?, ?)", [newPlayer.id, teamId], (err_pt) => {
                    if (err_pt) console.error("Error assigning player to team:", err_pt.message);
                });
            }
            res.status(201).json({ ...newPlayer, teamIds: teamId ? [teamId] : [] });
        }
    );
});
// ... PUT /api/players/:id , DELETE /api/players/:id
// ... POST /api/players/:playerId/teams/:teamId (add to team)
// ... DELETE /api/players/:playerId/teams/:teamId (remove from team)


// MATCHES
app.get('/api/matches', (req, res) => {
    const { leagueId } = req.query;
    let sql = "SELECT * FROM matches";
    const params = [];
    if (leagueId) {
        sql += " WHERE leagueId = ?";
        params.push(leagueId);
    }
    sql += " ORDER BY dateTime DESC";
    db.all(sql, params, (err, matches) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(matches);
    });
});

app.get('/api/matches/:id', (req, res) => {
    db.get("SELECT * FROM matches WHERE id = ?", [req.params.id], (err, match) => {
        if (err) return res.status(500).json({ error: err.message });
        if (match) res.json(match);
        else res.status(404).json({error: "Match not found"});
    });
});

app.post('/api/matches', (req, res) => {
    const { leagueId, teamAId, teamBId, dateTime, venue, overs } = req.body;
    if (!leagueId || !teamAId || !teamBId || !dateTime || !venue || overs === undefined) {
        return res.status(400).json({ error: "Missing required fields for match" });
    }
    const newMatch = { 
        id: generateId(), leagueId, teamAId, teamBId, dateTime, venue, 
        overs: parseInt(overs, 10), status: 'Scheduled' 
    };
    db.run("INSERT INTO matches (id, leagueId, teamAId, teamBId, dateTime, venue, overs, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [newMatch.id, newMatch.leagueId, newMatch.teamAId, newMatch.teamBId, newMatch.dateTime, newMatch.venue, newMatch.overs, newMatch.status],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json(newMatch);
        }
    );
});

app.put('/api/matches/:id', (req, res) => {
    const matchId = req.params.id;
    const { status, tossWonByTeamId, choseTo, result, scorecardId, playingTeamA, playingTeamB /* These player arrays are complex for direct DB store, usually handled by scorecard or linking table if needed pre-scorecard */ } = req.body;
    
    // For simplicity, only updating a few fields. A real app would be more selective.
    // Storing playingXI directly in matches table is not ideal, usually derived from scorecard or a separate state.
    // This is a simplified update, focusing on status, toss, result.
    let updates = [];
    let params = [];

    if(status !== undefined) { updates.push("status = ?"); params.push(status); }
    if(tossWonByTeamId !== undefined) { updates.push("tossWonByTeamId = ?"); params.push(tossWonByTeamId); }
    if(choseTo !== undefined) { updates.push("choseTo = ?"); params.push(choseTo); }
    if(result !== undefined) { updates.push("result = ?"); params.push(result); }
    if(scorecardId !== undefined) { updates.push("scorecardId = ?"); params.push(scorecardId); }

    if (updates.length === 0) return res.status(400).json({error: "No update fields provided"});

    params.push(matchId);
    
    db.run(`UPDATE matches SET ${updates.join(", ")} WHERE id = ?`, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({error: "Match not found or no changes made"});
        db.get("SELECT * FROM matches WHERE id = ?", [matchId], (err, updatedMatch) => {
            if(err) return res.status(500).json({error: err.message});
            res.json(updatedMatch);
        });
    });
});


// SCORECARDS
app.get('/api/scorecards/:matchId', (req, res) => {
    // Scorecard ID is usually `sc_${matchId}` or similar, or directly linked.
    // If scorecardId is stored on match, use that. Here we assume matchId itself is key or part of key.
    db.get("SELECT * FROM scorecards WHERE matchId = ?", [req.params.matchId], (err, scorecard) => {
        if (err) return res.status(500).json({ error: err.message });
        // Parse JSON fields
        if (scorecard) {
            try {
                scorecard.innings1 = scorecard.innings1 ? JSON.parse(scorecard.innings1) : null;
                scorecard.innings2 = scorecard.innings2 ? JSON.parse(scorecard.innings2) : null;
            } catch (e) {
                console.error("Error parsing scorecard innings JSON:", e);
                return res.status(500).json({ error: "Corrupted scorecard data in DB" });
            }
        }
        res.json(scorecard); // Can be null if not found
    });
});

app.put('/api/scorecards/:id', (req, res) => { // id here is scorecard.id
    const scorecardId = req.params.id;
    const { matchId, innings1, innings2 } = req.body;
    if (!matchId) return res.status(400).json({ error: "Match ID is required for scorecard" });

    const innings1Json = innings1 ? JSON.stringify(innings1) : null;
    const innings2Json = innings2 ? JSON.stringify(innings2) : null;

    db.get("SELECT * FROM scorecards WHERE id = ?", [scorecardId], (err, existing) => {
        if (err) return res.status(500).json({ error: err.message });

        if (existing) {
            db.run("UPDATE scorecards SET innings1 = ?, innings2 = ? WHERE id = ?",
                [innings1Json, innings2Json, scorecardId],
                function(errUpdate) {
                    if (errUpdate) return res.status(500).json({ error: errUpdate.message });
                    res.json({ id: scorecardId, matchId, innings1, innings2 });
                }
            );
        } else { // Create new if not existing
            db.run("INSERT INTO scorecards (id, matchId, innings1, innings2) VALUES (?, ?, ?, ?)",
                [scorecardId, matchId, innings1Json, innings2Json],
                function(errInsert) {
                    if (errInsert) return res.status(500).json({ error: errInsert.message });
                     // Also update match table with this scorecardId
                    db.run("UPDATE matches SET scorecardId = ? WHERE id = ?", [scorecardId, matchId]);
                    res.status(201).json({ id: scorecardId, matchId, innings1, innings2 });
                }
            );
        }
    });
});


// --- Serve Frontend (Optional, if co-locating build) ---
// app.use(express.static(path.join(__dirname, '..', 'frontend_build_path')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '..', 'frontend_build_path', 'index.html'));
// });

app.listen(PORT, () => {
  console.log(\`Backend server running on https://cricket-scorer-pro-v1-0-65205660267.us-west1.run.app\`);
});

process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Closed the database connection.');
        process.exit(0);
    });
});
