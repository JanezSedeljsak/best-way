const express = require('express')
const axios = require('axios')
const cors = require('cors')
const app = express()
const path = require('path')
const views = __dirname + '/src'
const { getName } = require('country-list')

app.use(cors({ origin: '*', optionsSuccessStatus: 200, credentials: true }))
app.use('/static', express.static('public'))
app.listen(process.env.PORT || 5000, () => console.log(`App running`))

class Methods {
    static getLocationWeather(_location) {
        return new Promise(async resolve => {
            axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${_location}&units=metric&appid=` + '70ef7d1ecc959f4ef1a91a8a4ab7a914')
                .then(response => {
                    resolve(response.data);
                })
                .catch(err => resolve(err))
        });

    }

    static getGeolocationByName(_name) {
        return new Promise(async resolve => {
            axios.get(`https://geocoder.ls.hereapi.com/6.2/geocode.json?apiKey=3pwTWXX_AtpLB6OkzdFO3Ns8eJ3nc9Wke6GXnbnwOPQ&searchtext=${_name}`)
                .then(response => {
                    resolve(response.data.Response.View[0].Result[0].Location.DisplayPosition);
                })
                .catch(err => resolve(err))
        });
    }

    static getGeolocationWeather({ latitude, longitude }) {
        return new Promise(async resolve => {
            axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${(latitude)}&lon=${(longitude)}&units=metric&appid=` + '70ef7d1ecc959f4ef1a91a8a4ab7a914')
                .then(response => {
                    resolve(response.data);
                })
                .catch(err => resolve(err))
        });
    }

    static getCitiesList() {
        return new Promise(async resolve => {
            axios.get(`https://best-way.herokuapp.com/static/list.txt`)
                .then(response => {
                    resolve(response.data);
                })
                .catch(err => resolve(err))
        });
    }

    static getLocationsBeetwen(start, end) {
        return new Promise(async resolve => {
            axios.get(`https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=3pwTWXX_AtpLB6OkzdFO3Ns8eJ3nc9Wke6GXnbnwOPQ&waypoint0=geo!${start.Latitude},${start.Longitude}&waypoint1=geo!${end.Latitude},${end.Longitude}&mode=fastest;car;traffic:disabled`)
                .then(response => {
                    let points;
                    try {
                        points = response.data.response.route[0].leg[0].maneuver
                    } catch (err) {
                        points = [];
                    }
                    if (points.length) {
                        let result = points
                            .map(item => item.position)
                        resolve(result);
                    } else {
                        resolve([]);
                    }
                })
                .catch(err => resolve(err))
        });
    }

    static retriveDataForResponse(response) {
        if (Object.values(response).length) {
            return {
                location: {
                    longitude: response.coord.lon || null,
                    latitude: response.coord.lat || null
                },
                weather: {
                    temp: response.main.temp,
                    wind: response.wind.speed,
                    country: getName(response.sys.country),
                    city: response.name ? response.name : "",
                    main: response.weather[0].main,
                    description: response.weather[0].description,
                    pressure: response.main.pressure,
                    humidity: response.main.humidity
                }
            }
        } else {
            return { result: "INVALID LOCATION" }
        }

    };
}

// view routes
app.get('/locray', (req, res) => res.sendFile(path.join(views + '/locray.html')));
app.get('/', (req, res) => res.sendFile(path.join(views + '/base.html')));
app.get('/doc', (req, res) => res.sendFile(path.join(views + '/documentation.html')));


// api routes
app.get('/api/between/:start/:end', async (req, res) => {
    let start = await Methods.getGeolocationByName(req.params.start);
    let end = await Methods.getGeolocationByName(req.params.end);

    let locations = await Methods.getLocationsBeetwen(start, end),
        result = [],
        chunkSize = Math.round(locations.length / 5);

    for (let i = 0, len = locations.length; i < len; i += chunkSize) {
        let current = locations.slice(i, i + chunkSize)
        current = await Promise.all(current.map(async x => await Methods.getGeolocationWeather(x)));
        current = current.sort((a, b) => a.main.temp > b.main.temp ? -1 : 1)[0]
        result.push(Methods.retriveDataForResponse(current))
    }

    res.status(200).json({ ok: true, result });
});

app.get('/api/locations/:locations', async (req, res) => {
    if (JSON.parse(req.params.locations).length > 1) {
        let result = await Promise.all(JSON.parse(req.params.locations).map(async x => await Methods.getLocationWeather(x)))
        result = result
            .sort((a, b) => a.main.temp > b.main.temp ? -1 : 1)
            .map(item => Methods.retriveDataForResponse(item));

        result = result.length > 5 ? result.slice(0, 5) : result;

        res.status(200).json({
            ok: true,
            result: result
        });
    } else {
        res.status(200).json({
            ok: false,
            result: "Url params not valid!"
        });
    }

});

app.get('/api/weather/:cityname', async (req, res) => {
    const response = await Methods.getLocationWeather(req.params.cityname);
    res.status(200).json({
        ok: true,
        result: Methods.retriveDataForResponse(response)
    });
});

app.get('/api/weather/:lat/:lon', async (req, res) => {
    const { lat, lon } = req.params;
    const response = await Methods.getGeolocationWeather({ latitude: lat, longitude: lon });
    res.status(200).json({
        ok: true,
        result: Methods.retriveDataForResponse(response)
    });
});

app.get('/api/cities', async (req, res) => {
    let result = await Methods.getCitiesList();
    res.status(200).json({
        ok: true,
        result: result.split("\n").map(loc => ({ title: loc }))
    });
});
