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
            axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${_location}&appid=` + '70ef7d1ecc959f4ef1a91a8a4ab7a914')
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
                } catch(err) {
                    points = [];
                }
                if(points.length) {
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
}

// view routes
app.get('/locray', (req, res) => res.sendFile(path.join(views + '/locray.html')));
app.get('/', (req, res) => res.sendFile(path.join(views + '/base.html')));
app.get('/doc', (req, res) => res.sendFile(path.join(views + '/documentation.html')));


// api routes
app.get('/api/between/:start/:end', async (req, res) => {
    let start = await Methods.getGeolocationByName(req.params.start);
    let end = await Methods.getGeolocationByName(req.params.end);

    console.log("start end after get mjau", start, end);

    let locations = await Methods.getLocationsBeetwen(start, end);
    if(locations.length) {
        locations = await Promise.all(locations.map(async x => await Methods.getGeolocationWeather(x)))
        locations = locations
            .sort((a, b) => a.main.temp > b.main.temp ? -1 : 1)
            .map(item => ({
                location: {
                    longitude: item.coord.lon || null,
                    latitude: item.coord.lat || null
                }, 
                weather: {
                    temp: item.main.temp,
                    wind: item.wind.speed,
                    country: getName(item.sys.country),
                    main: item.weather.main
                }
            }));


        locations = locations.length > 5 ? locations.slice(0, 5) : locations;
    }
    res.status(200).json({
        ok: true,
        result: locations
    });
});

app.get('/api/locations/:locations', async (req, res) => {
    if (JSON.parse(req.params.locations).length > 1) {
        let result =  await Promise.all(JSON.parse(req.params.locations).map(async x => await Methods.getLocationWeather(x)))
        result = result
            .sort((a, b) => a.main.temp > b.main.temp ? -1 : 1)
            .map(item => ({
                location: {
                    longitude: item.coord.lon || null,
                    latitude: item.coord.lat || null
                }, 
                weather: {
                    temp: item.main.temp,
                    wind: item.wind.speed,
                    country: getName(item.sys.country),
                    main: item.weather.main
                }
            }));

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

app.get('/api/cities', async (req, res) => {
    let result = await Methods.getCitiesList();
    res.status(200).json({
        ok: true,
        result: result.split("\n").map(loc => ({ title: loc }))
    });
})
