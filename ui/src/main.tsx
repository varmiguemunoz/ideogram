import { createRoot } from 'react-dom/client';
import App from './App';

import "./styles/global.css"

const container = document.getElementById('app');
if (!container) throw new Error('Missing #app container');

const root = createRoot(container);
root.render(<App />);
