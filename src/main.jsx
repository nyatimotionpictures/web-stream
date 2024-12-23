import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { store } from './5-Store/store.js'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { AuthContextProvider } from './5-Store/AuthContext.jsx'
import { SidebarProvider } from './5-Store/SidebarContext.tsx'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from './lib/tanstack.ts'

//const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <SidebarProvider>
        <AuthContextProvider>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
          <App />
        </AuthContextProvider>
      </SidebarProvider>
    </Provider>
  
  </QueryClientProvider>
 
);
