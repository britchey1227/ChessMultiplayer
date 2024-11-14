import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url';
const app = express();
const PORT = 8080;

// Set EJS as the view engine
app.set('view engine', 'ejs');
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
app.set('views', path.join(dirname, 'views'));

app.use(express.static(path.join(dirname, 'public')));

// Serve the EJS file at the root route
app.get('/', (req, res) => {
    res.render('game', { title: 'Welcome to My Express App' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});