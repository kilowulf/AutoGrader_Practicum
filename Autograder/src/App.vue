<!-- CS 4690 Spring 
     Aaron Brown 
     03-22-23 
     
     AutoGrader Practicum: 
     run project command: npm run dev 
     - two way binding between inputs and database object
     - calculates point total from checked rows 
     - checking a row will update the database with any new data entered to inputs

     * Note:: to run you must have vite running: (npm run dev) and the server (node server.js) - localhost:5173

-->

<template>
  <div id="app" class="container">
    <h1>Autograder</h1>
    <table class="table">
      <thead>
        <tr>
          <th>Select</th>
          <th>Points</th>
          <th>Criteria</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in rows" :key="index">
          <td>
            <input
              type="checkbox"
              v-model="row.isChecked"
              @change="updateData(index)"
            />
          </td>
          <td>
            <input type="number" class="form-control" v-model="row.points" />
          </td>
          <td>
            <input type="text" class="form-control" v-model="row.criteria" />
          </td>
          <td>
            <button class="btn btn-danger" @click="deleteRow(index)">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
        <tr>
          <td></td>
          <td>
            <input type="number" class="form-control" v-model="newPoints" />
          </td>
          <td>
            <input type="text" class="form-control" v-model="newCriteria" />
          </td>
          <td>
            <button class="btn btn-primary" @click="addRow">
              <i class="bi bi-plus"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <textarea
      class="form-control"
      :rows="inc_rows"
      readonly
      v-model="Summary"
    ></textarea>
    <p>Total Points: {{ totalPoints }}</p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      rows: [],
      newPoints: 0,
      newCriteria: "",
      inc_rows: 3
    };
  },
  computed: {
    Summary() {
      let summary = "";
      let rowCount = 0;
      this.rows.forEach((row) => {
        if (row.isChecked) {
          rowCount++;
          summary += `${row.points >= 0 ? "+" : ""}${row.points}: ${
            row.criteria
          }\n`;
        }
      });
      if (rowCount > 0) {
        summary += "=====================\n";
        summary += `Total Points: ${this.totalPoints}\n`;
        rowCount += 2;
      }
      this.inc_rows = rowCount;
      return summary;
    },
    totalPoints() {
      return this.rows.reduce(
        (sum, row) => (row.isChecked ? sum + row.points : sum),
        100
      );
    }
  },
  methods: {
    async loadData() {
      try {
        const response = await axios.get("http://localhost:3001/api/data");
        this.rows = response.data;
      } catch (error) {
        console.error(error);
      }
    },
    async addRow() {
      const newRow = {
        criteria: this.newCriteria,
        points: this.newPoints,
        isChecked: false
      };

      try {
        const response = await axios.post(
          "http://localhost:3001/api/data",
          newRow
        );
        this.rows.push(response.data);
        this.newCriteria = "";
        this.newPoints = 0;
      } catch (error) {
        console.error(error);
      }
    },
    async deleteRow(index) {
      const rowId = this.rows[index].id;

      try {
        await axios.delete(`http://localhost:3001/api/data/${rowId}`);
        this.rows.splice(index, 1);
      } catch (error) {
        console.error(error);
      }
    },
    async updateRow(row) {
      try {
        await axios.put(`http://localhost:3001/api/data/${row.id}`, row);
      } catch (error) {
        console.error(error);
      }
    },
    async updateData() {
      try {
        const response = await axios.put("http://localhost:3001/api/data", {
          rows: this.rows
        });
        console.log(response.data.message);
      } catch (error) {
        console.error(error);
      }
    },
    rowEquals(row1, row2) {
      return (
        row1.criteria === row2.criteria &&
        row1.points === row2.points &&
        row1.isChecked === row2.isChecked
      );
    }
  },
  watch: {
    rows: {
      handler(newValue, oldValue) {
        newValue.forEach((row, index) => {
          if (oldValue[index] && !this.rowEquals(oldValue[index], row)) {
            this.updateRow(row);
          }
        });
      },
      deep: true
    }
  },
  created() {
    this.loadData();
  }
};
</script>
