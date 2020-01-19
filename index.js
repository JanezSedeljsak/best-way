const express = require('express')
const axios = require('axios')
const app = express()
const path = require('path')
const views = __dirname + '/src'

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
})

class Methods {
    static getLocationWeather(_location) {
        return new Promise(async resolve => {
            axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${_location}&appid=` + '70ef7d1ecc959f4ef1a91a8a4ab7a914')
                .then(response => {
                    resolve(response.data);
                })
                .catch(err => resolve(err))
        });
    }

    static getCitiesList() {
        return new Promise(async resolve => {
            axios.get(`http://localhost:5000/static/list.txt`)
                .then(response => {
                    resolve(response.data);
                })
                .catch(err => resolve(err))
        });
    }
}

app.get('/locray', (req, res) => res.sendFile(path.join(views + '/locray.html')));
app.get('/', (req, res) => res.sendFile(path.join(views + '/base.html')));

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

app.get('/api/cities', async (req, res) => {
    let result = await Methods.getCitiesList();
    res.status(200).json({
        ok: true,
        result: result.split("\n").map(loc => ({ title: loc }))
    });
})
app.use('/static', express.static('public'));

app.listen(process.env.PORT || 5000, () => console.log(`App running`))


/*
fetch("https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=3pwTWXX_AtpLB6OkzdFO3Ns8eJ3nc9Wke6GXnbnwOPQ&waypoint0=geo!52.5,13.4&waypoint1=geo!52.5,13.45&mode=fastest;car;traffic:disabled").then(resposne => resposne.json()).then(console.log);
*/
