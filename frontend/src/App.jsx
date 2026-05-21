import { BrowserRouter } from "react-router-dom"

import { GlobalStoreProvider } from "@/stores/use-global-store"
import { AppRoutes } from "@/routes/app-routes"

function App() {
  return (
    <GlobalStoreProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </GlobalStoreProvider>
  )
}

export default App