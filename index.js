const express = require('express')
const app = express()
const path = require('path')
const views = __dirname + '/src'

app.get('/', (req, res) => res.sendFile(path.join(views + '/interface.html')))
app.get('/api/basic/:start/:end', (req, res) => {
    res.status(200).json({
        ok: false,
        result: req.params.start
    });
});
app.get('/api/locations/:locations', (req, res) => {
    if(req.params.locations.split(",").length > 1) {
        res.status(200).json({
            ok: true,
            result: req.params.locations.split(",")
        });
    } else {
        res.status(200).json({
            ok: false,
            result: "Url params not valid!"
        });
    }

});
app.use('/static', express.static('public'));

app.listen(process.env.PORT || 5000, () => console.log(`App running`))
