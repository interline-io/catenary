<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Icon Component
      </h1>
      <p class="subtitle">
        Material Design Icons integration
      </p>

      <!-- Basic Icons -->
      <demo-box label="Basic Icons">
        <div class="is-flex is-align-items-center" style="gap: 1rem;">
          <cat-icon icon="home" />
          <cat-icon icon="account" />
          <cat-icon icon="cog" />
          <cat-icon icon="bell" />
          <cat-icon icon="email" />
          <cat-icon icon="heart" />
          <cat-icon icon="star" />
          <cat-icon icon="check" />
        </div>
      </demo-box>

      <!-- Sizes -->
      <demo-box label="Sizes">
        <div class="is-flex is-align-items-center" style="gap: 1rem;">
          <cat-icon icon="home" size="small" />
          <cat-icon icon="home" />
          <cat-icon icon="home" size="medium" />
          <cat-icon icon="home" size="large" />
        </div>
        <p class="has-text-grey mt-3">
          Sizes: small, normal (default), medium, large
        </p>
      </demo-box>

      <!-- Colors -->
      <demo-box label="Colors">
        <div class="is-flex is-align-items-center" style="gap: 1rem;">
          <cat-icon icon="heart" variant="primary" />
          <cat-icon icon="heart" variant="info" />
          <cat-icon icon="heart" variant="success" />
          <cat-icon icon="heart" variant="warning" />
          <cat-icon icon="heart" variant="danger" />
          <cat-icon icon="heart" variant="dark" />
        </div>
        <p class="has-text-grey mt-3">
          Use the <code>variant</code> prop to change icon colors
        </p>
      </demo-box>

      <!-- Common Icons -->
      <demo-box label="Common Icons">
        <div class="columns is-multiline">
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="home" />
              <span class="ml-2">home</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="account" />
              <span class="ml-2">account</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="cog" />
              <span class="ml-2">cog</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="bell" />
              <span class="ml-2">bell</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="email" />
              <span class="ml-2">email</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="heart" />
              <span class="ml-2">heart</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="star" />
              <span class="ml-2">star</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="check" />
              <span class="ml-2">check</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="close" />
              <span class="ml-2">close</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="menu" />
              <span class="ml-2">menu</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="search" />
              <span class="ml-2">search</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="plus" />
              <span class="ml-2">plus</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="pencil" />
              <span class="ml-2">pencil</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="delete" />
              <span class="ml-2">delete</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="upload" />
              <span class="ml-2">upload</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="download" />
              <span class="ml-2">download</span>
            </div>
          </div>
        </div>
      </demo-box>

      <!-- With Buttons -->
      <demo-box label="Icons in Buttons">
        <div class="buttons">
          <cat-button variant="primary">
            <cat-icon icon="plus" size="small" />
            <span>Add</span>
          </cat-button>
          <cat-button variant="info">
            <cat-icon icon="pencil" size="small" />
            <span>Edit</span>
          </cat-button>
          <cat-button variant="danger">
            <cat-icon icon="delete" size="small" />
            <span>Delete</span>
          </cat-button>
          <cat-button>
            <cat-icon icon="download" size="small" />
            <span>Download</span>
          </cat-button>
        </div>
        <div class="buttons">
          <cat-button variant="primary">
            <cat-icon icon="content-save" size="small" />
          </cat-button>
          <cat-button variant="info">
            <cat-icon icon="share-variant" size="small" />
          </cat-button>
          <cat-button>
            <cat-icon icon="dots-vertical" size="small" />
          </cat-button>
        </div>
      </demo-box>

      <!-- Navigation Icons -->
      <demo-box label="Navigation Icons">
        <div class="columns is-multiline">
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="arrow-left" />
              <span class="ml-2">arrow-left</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="arrow-right" />
              <span class="ml-2">arrow-right</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="arrow-up" />
              <span class="ml-2">arrow-up</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="arrow-down" />
              <span class="ml-2">arrow-down</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="chevron-left" />
              <span class="ml-2">chevron-left</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="chevron-right" />
              <span class="ml-2">chevron-right</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="chevron-up" />
              <span class="ml-2">chevron-up</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="chevron-down" />
              <span class="ml-2">chevron-down</span>
            </div>
          </div>
        </div>
      </demo-box>

      <!-- Status Icons -->
      <demo-box label="Status Icons">
        <div class="columns is-multiline">
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="check-circle" class="has-text-success" />
              <span class="ml-2">Success</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="information" class="has-text-info" />
              <span class="ml-2">Information</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="alert" class="has-text-warning" />
              <span class="ml-2">Warning</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="alert-circle" class="has-text-danger" />
              <span class="ml-2">Error</span>
            </div>
          </div>
        </div>
      </demo-box>

      <!-- File Type Icons -->
      <demo-box label="File Type Icons">
        <div class="columns is-multiline">
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="file-document" />
              <span class="ml-2">Document</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="file-image" />
              <span class="ml-2">Image</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="file-video" />
              <span class="ml-2">Video</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="file-music" />
              <span class="ml-2">Music</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="file-pdf-box" />
              <span class="ml-2">PDF</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="file-code" />
              <span class="ml-2">Code</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="folder" />
              <span class="ml-2">Folder</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <cat-icon icon="zip-box" />
              <span class="ml-2">Archive</span>
            </div>
          </div>
        </div>
      </demo-box>

      <!-- Social Media Icons -->
      <demo-box label="Social Media Icons">
        <div class="buttons">
          <cat-button>
            <cat-icon icon="facebook" size="small" />
          </cat-button>
          <cat-button>
            <cat-icon icon="twitter" size="small" />
          </cat-button>
          <cat-button>
            <cat-icon icon="instagram" size="small" />
          </cat-button>
          <cat-button>
            <cat-icon icon="linkedin" size="small" />
          </cat-button>
          <cat-button>
            <cat-icon icon="github" size="small" />
          </cat-button>
          <cat-button>
            <cat-icon icon="youtube" size="small" />
          </cat-button>
        </div>
      </demo-box>

      <!-- Icon Reference -->
      <demo-box label="Icon Reference">
        <div class="notification is-info is-light">
          <p>
            <strong>Material Design Icons</strong>
          </p>
          <p class="mt-2">
            This component uses <a href="https://materialdesignicons.com/" target="_blank">Material Design Icons</a>.
            Browse the full icon library at:
          </p>
          <p class="mt-2">
            <a href="https://materialdesignicons.com/" target="_blank">
              https://materialdesignicons.com/
            </a>
          </p>
        </div>
      </demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import DemoBox from '../../components/demo-box.vue'
</script>
