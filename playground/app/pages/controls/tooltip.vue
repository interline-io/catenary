<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Tooltip Component
      </h1>
      <p class="subtitle">
        Contextual information on hover
      </p>

      <demo-box label="Basic Tooltip">
        <div class="has-text-centered">
          <cat-tooltip text="This is a tooltip">
            <cat-button>
              Hover me
            </cat-button>
          </cat-tooltip>
        </div>
      </demo-box>

      <demo-box label="Positions">
        <div class="has-text-centered mb-4">
          <cat-tooltip text="Top tooltip" position="top">
            <cat-button>
              Top
            </cat-button>
          </cat-tooltip>
        </div>
        <div class="is-flex is-justify-content-space-between mb-4">
          <cat-tooltip text="Left tooltip" position="left">
            <cat-button>
              Left
            </cat-button>
          </cat-tooltip>
          <cat-tooltip text="Right tooltip" position="right">
            <cat-button>
              Right
            </cat-button>
          </cat-tooltip>
        </div>
        <div class="has-text-centered">
          <cat-tooltip text="Bottom tooltip" position="bottom">
            <cat-button>
              Bottom
            </cat-button>
          </cat-tooltip>
        </div>
      </demo-box>

      <demo-box label="With Icons">
        <div class="buttons">
          <cat-tooltip text="Save changes">
            <cat-button>
              <cat-icon icon="content-save" />
            </cat-button>
          </cat-tooltip>
          <cat-tooltip text="Edit item">
            <cat-button>
              <cat-icon icon="pencil" />
            </cat-button>
          </cat-tooltip>
          <cat-tooltip text="Delete item">
            <cat-button>
              <cat-icon icon="delete" />
            </cat-button>
          </cat-tooltip>
          <cat-tooltip text="Download file">
            <cat-button>
              <cat-icon icon="download" />
            </cat-button>
          </cat-tooltip>
          <cat-tooltip text="Share content">
            <cat-button>
              <cat-icon icon="share-variant" />
            </cat-button>
          </cat-tooltip>
        </div>
      </demo-box>

      <demo-box label="Example: Form Field Help" example>
        <cat-field label="Username:">
          <div class="is-flex">
            <cat-input v-model="username" expanded />
            <cat-tooltip text="Username must be 3-20 characters, alphanumeric only" position="right">
              <cat-button class="ml-2">
                <cat-icon icon="help-circle" />
              </cat-button>
            </cat-tooltip>
          </div>
        </cat-field>

        <cat-field label="Password:">
          <div class="is-flex">
            <cat-input v-model="password" type="password" expanded />
            <cat-tooltip text="Password must be at least 8 characters with uppercase, lowercase, and numbers" position="right">
              <cat-button class="ml-2">
                <cat-icon icon="help-circle" />
              </cat-button>
            </cat-tooltip>
          </div>
        </cat-field>
      </demo-box>

      <demo-box label="Example: Text with Tooltip" example>
        <p>
          Hover over
          <cat-tooltip text="This is an abbreviation for 'example'" position="top">
            <span class="has-text-primary" style="cursor: help; text-decoration: underline dotted;">
              e.g.
            </span>
          </cat-tooltip>
          to see its meaning.
        </p>
        <p class="mt-3">
          The term
          <cat-tooltip text="Application Programming Interface" position="top">
            <span class="has-text-info" style="cursor: help; border-bottom: 1px dotted;">
              API
            </span>
          </cat-tooltip>
          is commonly used in software development.
        </p>
      </demo-box>

      <demo-box label="Example: Status Indicators" example>
        <table class="table is-fullwidth">
          <thead>
            <tr>
              <th>Service</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Web Server</td>
              <td>
                <cat-tooltip text="All systems operational">
                  <cat-icon icon="check-circle" class="has-text-success" />
                </cat-tooltip>
              </td>
            </tr>
            <tr>
              <td>Database</td>
              <td>
                <cat-tooltip text="All systems operational">
                  <cat-icon icon="check-circle" class="has-text-success" />
                </cat-tooltip>
              </td>
            </tr>
            <tr>
              <td>Email Service</td>
              <td>
                <cat-tooltip text="Experiencing minor delays">
                  <cat-icon icon="alert" class="has-text-warning" />
                </cat-tooltip>
              </td>
            </tr>
            <tr>
              <td>API Gateway</td>
              <td>
                <cat-tooltip text="Service unavailable - maintenance in progress">
                  <cat-icon icon="alert-circle" class="has-text-danger" />
                </cat-tooltip>
              </td>
            </tr>
          </tbody>
        </table>
      </demo-box>

      <demo-box label="Example: Navigation Menu" example>
        <div class="buttons">
          <cat-tooltip text="Dashboard" position="bottom">
            <cat-button>
              <cat-icon icon="view-dashboard" />
            </cat-button>
          </cat-tooltip>
          <cat-tooltip text="Messages" position="bottom">
            <cat-button>
              <cat-icon icon="email" />
            </cat-button>
          </cat-tooltip>
          <cat-tooltip text="Notifications" position="bottom">
            <cat-button>
              <cat-icon icon="bell" />
            </cat-button>
          </cat-tooltip>
          <cat-tooltip text="Settings" position="bottom">
            <cat-button>
              <cat-icon icon="cog" />
            </cat-button>
          </cat-tooltip>
          <cat-tooltip text="User Profile" position="bottom">
            <cat-button>
              <cat-icon icon="account-circle" />
            </cat-button>
          </cat-tooltip>
        </div>
      </demo-box>

      <demo-box label="Example: Interactive Toolbar" example>
        <div class="buttons">
          <cat-tooltip text="Bold (Ctrl+B)" position="bottom">
            <cat-button>
              <cat-icon icon="format-bold" />
            </cat-button>
          </cat-tooltip>
          <cat-tooltip text="Italic (Ctrl+I)" position="bottom">
            <cat-button>
              <cat-icon icon="format-italic" />
            </cat-button>
          </cat-tooltip>
          <cat-tooltip text="Underline (Ctrl+U)" position="bottom">
            <cat-button>
              <cat-icon icon="format-underline" />
            </cat-button>
          </cat-tooltip>
          <cat-tooltip text="Align Left" position="bottom">
            <cat-button>
              <cat-icon icon="format-align-left" />
            </cat-button>
          </cat-tooltip>
          <cat-tooltip text="Align Center" position="bottom">
            <cat-button>
              <cat-icon icon="format-align-center" />
            </cat-button>
          </cat-tooltip>
          <cat-tooltip text="Align Right" position="bottom">
            <cat-button>
              <cat-icon icon="format-align-right" />
            </cat-button>
          </cat-tooltip>
          <cat-tooltip text="Insert Link" position="bottom">
            <cat-button>
              <cat-icon icon="link" />
            </cat-button>
          </cat-tooltip>
          <cat-tooltip text="Insert Image" position="bottom">
            <cat-button>
              <cat-icon icon="image" />
            </cat-button>
          </cat-tooltip>
        </div>
      </demo-box>

      <demo-box label="Example: Tags with Info" example>
        <div class="tags">
          <cat-tooltip text="Primary programming language" position="top">
            <cat-tag>
              TypeScript
            </cat-tag>
          </cat-tooltip>
          <cat-tooltip text="UI framework" position="top">
            <cat-tag>
              Vue.js
            </cat-tag>
          </cat-tooltip>
          <cat-tooltip text="Meta framework for Vue" position="top">
            <cat-tag>
              Nuxt
            </cat-tag>
          </cat-tooltip>
          <cat-tooltip text="CSS framework" position="top">
            <cat-tag>
              Bulma
            </cat-tag>
          </cat-tooltip>
        </div>
      </demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DemoBox from '../../components/demo-box.vue'

const username = ref('')
const password = ref('')
</script>
