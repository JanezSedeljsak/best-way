const express = require('express')
const axios = require('axios')
const app = express()
const path = require('path')
const views = __dirname + '/src'

class Methods {
    static getLocationWeather(_location) {
        return new Promise(async resolve => {
            axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${_location}&appid=` + '70ef7d1ecc959f4ef1a91a8a4ab7a914')
                .then(response => {
                    console.log(response.data);
                    resolve(response.data);
                })
                .catch(err => resolve(err))
        });
    }
}

app.get('/', (req, res) => res.sendFile(path.join(views + '/interface.html')));

app.get('/api/basic/:start/:end', async (req, res) => {
    res.status(200).json({
        ok: false,
        start: await Methods.getLocationWeather(req.params.start),
        end: await Methods.getLocationWeather(req.params.end)
    });
});
app.get('/api/locations/:locations', async (req, res) => {
    if (JSON.parse(req.params.locations).length > 1) {
        res.status(200).json({
            ok: true,
            result: await Promise.all(JSON.parse(req.params.locations).map(async x => await Methods.getLocationWeather(x)))
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
