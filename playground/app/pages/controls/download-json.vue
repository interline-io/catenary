<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Download JSON Component
      </h1>
      <p class="subtitle">
        Button that triggers a JSON file download from string data
      </p>

      <demo-box label="Basic Usage">
        <cat-download-json :data="jsonString" filename="sample" label="Download JSON" />
      </demo-box>

      <demo-box label="Custom Extension (GeoJSON)">
        <cat-download-json
          :data="geojsonString"
          filename="features"
          extension=".geojson"
          label="Download GeoJSON"
          icon-left="map-marker"
        />
      </demo-box>

      <demo-box label="Custom Label and Icons">
        <div class="buttons">
          <cat-download-json
            :data="jsonString"
            filename="config"
            label="Export Config"
            icon-left="code-json"
          />
          <cat-download-json
            :data="jsonString"
            filename="backup"
            label="Save Backup"
            icon-left="content-save"
            icon-right="download"
          />
        </div>
      </demo-box>

      <demo-box label="Disabled State">
        <cat-download-json data="" filename="empty" disabled label="No data available" />
      </demo-box>

      <demo-box label="Data Preview">
        <pre class="box">{{ jsonString }}</pre>
        <cat-download-json :data="jsonString" filename="users" label="Download as JSON" />
      </demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import DemoBox from '../../components/demo-box.vue'

const sampleData = {
  users: [
    { name: 'Alice Johnson', role: 'Admin' },
    { name: 'Bob Smith', role: 'Editor' },
    { name: 'Carol Lee', role: 'Viewer' }
  ],
  exportedAt: '2025-01-15T10:00:00Z'
}

const jsonString = JSON.stringify(sampleData, null, 2)

const geojsonData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-122.4194, 37.7749] },
      properties: { name: 'San Francisco' }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-73.9857, 40.7484] },
      properties: { name: 'New York' }
    }
  ]
}

const geojsonString = JSON.stringify(geojsonData, null, 2)
</script>
