import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const metropolysDarkTheme = {
  dark: true,
  colors: {
    background: '#0B0F19',  // Deep space dark
    surface: '#151D30',     // Premium dark card surface
    primary: '#6366F1',     // Indigo Accent
    secondary: '#10B981',   // Emerald Green
    accent: '#8B5CF6',      // Purple Accent
    error: '#EF4444',       // Soft red
    info: '#3B82F6',        // Electric Blue
    success: '#10B981',     // Success
    warning: '#F59E0B',     // Golden Warning
  }
}

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'metropolysDarkTheme',
    themes: {
      metropolysDarkTheme,
    }
  }
})

const app = createApp(App)
app.use(vuetify)
app.mount('#app')
