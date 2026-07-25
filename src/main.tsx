import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { ModalsProvider } from '@mantine/modals'
import { store } from './store'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/dates/styles.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/800.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/space-grotesk/700.css'
import { theme } from './theme'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
// Initialise i18next before the first render so `t()` resolves on first paint,
// and set the document language/direction to match the saved preference.
import { i18n, applyDocumentLang, readLanguage } from './locale'
void i18n
applyDocumentLang(readLanguage())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <Notifications position="top-right" />
        <ModalsProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </ModalsProvider>
      </MantineProvider>
    </Provider>
  </StrictMode>,
)
