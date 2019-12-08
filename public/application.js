//code below executes on load
window.api = "http://localhost:5000/api";
fetch(`${window.api}/cities`)
    .then(response => response.json())
    .then(json => {
        window.possibleCities = json.result.map(x => x.title);
        $(".ui.search").search({
            source: json.result
        });
    });

let app = angular.module("myApp", []);
app.controller("myCtrl", [
    "$scope",
    "$window",
    function ($scope, $window) {
        // variables
        $scope._newName = "";
        $scope.locations = [];
        $scope._validLoc = true;

        //methods
        $scope.addLocation = () => {
            $scope.locations.push($scope._newName);
            $scope._newName = "";
            $scope._validLoc = true;
        };

        $scope.isValidLocation = () => {
            console.log(document.getElementById("newLocIdent").value);
            $scope._newName = document.getElementById("newLocIdent").value;
            $scope._validLoc = $window.possibleCities
                ? !$window.possibleCities.includes($scope._newName)
                : false;
        };

        $scope.deleteLocation = _index => {
            $scope.locations.splice(_index, 1);
        };

        $scope.basicFetch = async () => {
            window.event.preventDefault();
            let response = await fetch(
                `${window.api}/basic/${$scope.locations[0]}/${$scope.locations[1]}`
            );
            let json = await response.json();
            console.log(json);
        };

        $scope.arrayFetch = async () => {
            window.event.preventDefault();
            let response = await fetch(
                `${window.api}/locations/${JSON.stringify($scope.locations)}`
            );
            let json = await response.json();
            console.log(json);
        };
    }
]);
