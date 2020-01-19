//code below executes on load
window.api = "https://best-way.herokuapp.com/api";

let app = angular.module("myApp", []);
app.controller("myCtrl", [
    "$scope",
    "$window",
    function ($scope, $window) {
        fetch(`${window.api}/cities`)
            .then(response => response.json())
            .then(json => {
                $scope.possibleCities = json.result.map(x => x.title);
            });
        $scope.start = "";
        $scope.end = "";
        $scope.valid = [false, false];
        $scope.validate = function(loc, indx) {
            debugger;
            $scope.valid[indx] = $scope.possibleCities.includes(loc);
        };

        $scope.search = function() {
            debugger;
            let validLocations = $scope.validate();
            console.log(
                validLocations, 
                $scope.possibleCities.includes($scope.start), 
                $scope.possibleCities.includes($scope.end)
            );
        }
    }
]);
