const express = require('express')
const app = express()
app.use(express.json());

app.get('/', (req, res) => {
    res.end('Initial route')
})

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
})