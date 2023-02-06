const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());
const path = require("path");
module.exports = app;

const db_path = path.join(__dirname, "covid19India.db");
let db = null;
const initalizeDbAndServer = async () => {
  try {
    db = await open({
      filename: db_path,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running!");
    });
  } catch (error) {
    console.log(`Database Error ${error.message}`);
  }
};
initalizeDbAndServer();

//API 1

app.get("/states/", async (request, response) => {
  const query1 = `SELECT state_id AS stateId,state_name AS stateName,population AS population
    FROM 
    state;`;
  const statesList = await db.all(query1);
  response.send(statesList);
});

//API 2

app.get("/states/:stateId", async (request, response) => {
  const { stateId } = request.params;
  const query2 = `SELECT state_id AS stateId,state_name AS stateName,population AS population
    FROM
    state
    WHERE
    state_id=${stateId};`;
  const state = await db.get(query2);
  response.send(state);
});

//API 3

app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const query3 = `INSERT INTO district(district_name,state_id,cases,cured,active,deaths)VALUES(
        '${districtName}',
        '${stateId}',
        '${cases}',
        '${cured}',
        '${active}',
        '${deaths}'
    );`;
  await db.run(query3);
  response.send("District Successfully Added");
});

//API 4

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const query4 = `SELECT district_id AS districtId,district_name AS districtName,state_id AS stateId,cases as cases, cured as cured, active as active,deaths as deaths
    FROM district
    WHERE district_id=${districtId};`;
  const district = await db.get(query4);
  response.send(district);
});

//API 5

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const query5 = `DELETE FROM district WHERE district_id=${districtId}`;
  await db.run(query5);
  response.send("District Removed");
});

//API 6

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const query6 = `UPDATE district SET district_name='${districtName}',state_id='${stateId}',cases='${cases}',cured='${cured}',active='${active}',deaths='${deaths}'
    WHERE district_id=${districtId};`;
  await db.run(query6);
  response.send("District Details Updated");
});

//API 7

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const query7 = `SELECT 
    sum(cases) AS totalCases, sum(cured) AS totalCured, sum(active) AS totalActive, sum(deaths) AS totalDeaths 
    FROM district 
    WHERE state_id=${stateId};`;
  const totalStatistics = await db.get(query7);
  response.send(totalStatistics);
});

//API 8
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const query8 = `SELECT state.state_name AS stateName
    FROM state INNER JOIN district ON state.state_id=district.state_id
    WHERE district.district_id=${districtId};`;
  const district = await db.get(query8);
  response.send(district);
});
