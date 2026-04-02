<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Download CSV Component
      </h1>
      <p class="subtitle">
        Button that triggers a CSV file download from tabular data
      </p>

      <demo-box label="Basic Usage">
        <cat-download-csv :data="sampleData" filename="sample" />
      </demo-box>

      <demo-box label="Custom Label and Icons">
        <div class="buttons">
          <cat-download-csv
            :data="sampleData"
            filename="report"
            label="Export Report"
            icon-left="file-delimited"
          />
          <cat-download-csv
            :data="sampleData"
            filename="backup"
            label="Backup Data"
            icon-left="database-export"
            icon-right="download"
          />
        </div>
      </demo-box>

      <demo-box label="Disabled State">
        <cat-download-csv :data="[]" filename="empty" disabled label="No data available" />
      </demo-box>

      <demo-box label="Sample Data Preview">
        <cat-table :data="sampleData">
          <template #columns>
            <cat-table-column field="name" label="Name" />
            <cat-table-column field="email" label="Email" />
            <cat-table-column field="role" label="Role" />
          </template>
          <template #default="{ row }">
            <td>{{ row.name }}</td>
            <td>{{ row.email }}</td>
            <td>{{ row.role }}</td>
          </template>
        </cat-table>
        <cat-download-csv :data="sampleData" filename="users" label="Download Table as CSV" />
      </demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import DemoBox from '../../components/demo-box.vue'

const sampleData = [
  { name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
  { name: 'Bob Smith', email: 'bob@example.com', role: 'Editor' },
  { name: 'Carol Lee', email: 'carol@example.com', role: 'Viewer' },
  { name: 'Dan Brown', email: 'dan@example.com', role: 'Editor' }
]
</script>
