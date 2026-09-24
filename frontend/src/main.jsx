import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { Provider } from "react-redux"
import { ThemeProvider } from "./context/ThemeContext"
import './index.css'
import App from './App.jsx'
import store from "./store.jsx"

console.log(store.getState())

store.subscribe(()=>{
    console.log(store.getState())
})


createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <ThemeProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ThemeProvider>
    </Provider>
)