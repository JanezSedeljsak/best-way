//code below executes on load
window.api = "http://localhost:5000/api";

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
            $scope.valid[indx] = $scope.possibleCities.includes(loc);
        };

        $scope.search = function() {
            fetch(`${window.api}/between/${$scope.start}/${$scope.end}`)
            .then(response => response.json())
            .then(json => {
               console.log(json);
            });
        }
    }
]);
