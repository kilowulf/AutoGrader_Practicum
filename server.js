const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const dbFile = "db.json";

// Get data from the database
app.get("/api/data", (req, res) => {
  fs.readFile(dbFile, (err, data) => {
    if (err) {
      res.status(500).send({ error: "Error reading the database file." });
    } else {
      res.send(JSON.parse(data));
    }
  });
});

// Add data to the database
app.post("/api/data", (req, res) => {
  const newRow = req.body;

  fs.readFile(dbFile, (err, data) => {
    if (err) {
      res.status(500).send({ error: "Error reading the database file." });
    } else {
      const dbData = JSON.parse(data);
      newRow.id = Date.now(); // Assign a unique ID using the timestamp
      dbData.push(newRow);
      fs.writeFile(dbFile, JSON.stringify(dbData, null, 2), err => {
        if (err) {
          res.status(500).send({ error: "Error updating the database file." });
        } else {
          res.send(newRow);
        }
      });
    }
  });
});

// Update data in the database
app.put("/api/data", (req, res) => {
  const newData = req.body;
  fs.writeFile(dbFile, JSON.stringify(newData.rows, null, 2), err => {
    if (err) {
      res.status(500).send({ error: "Error updating the database file." });
    } else {
      res.send({ message: "Data updated successfully." });
    }
  });
});

// Update data in the database
app.put("/api/data/:id", (req, res) => {
  const { id } = req.params;
  const updatedRow = req.body;

  fs.readFile(dbFile, (err, data) => {
    if (err) {
      res.status(500).send({ error: "Error reading the database file." });
    } else {
      const dbData = JSON.parse(data);
      const index = dbData.findIndex(row => row.id == id);

      if (index === -1) {
        res.status(404).send({ error: "Row not found." });
      } else {
        dbData[index] = updatedRow;
        fs.writeFile(dbFile, JSON.stringify(dbData, null, 2), err => {
          if (err) {
            res
              .status(500)
              .send({ error: "Error updating the database file." });
          } else {
            res.send({ message: "Data updated successfully." });
          }
        });
      }
    }
  });
});

// Delete data from the database
app.delete("/api/data/:id", (req, res) => {
  const { id } = req.params;

  fs.readFile(dbFile, (err, data) => {
    if (err) {
      res.status(500).send({ error: "Error reading the database file." });
    } else {
      const dbData = JSON.parse(data);
      const index = dbData.findIndex(row => row.id == id);

      if (index === -1) {
        res.status(404).send({ error: "Row not found." });
      } else {
        dbData.splice(index, 1);
        fs.writeFile(dbFile, JSON.stringify(dbData, null, 2), err => {
          if (err) {
            res
              .status(500)
              .send({ error: "Error updating the database file." });
          } else {
            res.send({ message: "Data deleted successfully." });
          }
        });
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
