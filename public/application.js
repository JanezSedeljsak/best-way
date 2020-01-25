//code below executes on load
window.api = "https://best-way.herokuapp.com/api";
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
        $scope.wayView = false;
        $scope.locResult = [];

        //methods
        $scope.addLocation = () => {
            // a lot of hacky code bcs of wierd lifecycle
            if ($scope.locations) {
                if ($scope.locations.includes($scope._newName)) {
                    swal({
                        title: "Location already in list!",
                        text: "Do you wanna add a duplicate?",
                        icon: "warning",
                        buttons: true,
                        dangerMode: true
                    }).then(willDelete => {
                        if (!willDelete) {
                            swal("List adding aborted!", ".....", "success");
                            $scope._newName = "";
                            $scope._validLoc = true;
                            setTimeout(() => {
                                document.getElementById("addIdent").click();
                            }, 100);
                        } else {
                            swal("Location will be added to list!", ".....", "success");
                            $scope.locations.push($scope._newName);
                            $scope._newName = "";
                            $scope._validLoc = true;
                            document.getElementById("newLocIdent").value = "";

                            setTimeout(() => {
                                document.getElementById("addIdent").click();
                            }, 100);
                        }
                    });
                } else {
                    if ($scope._newName != "") {
                        $scope.locations.push($scope._newName);
                    }
                    $scope._newName = "";
                    $scope._validLoc = true;
                    document.getElementById("newLocIdent").value = "";
                }
            }
        };

        $scope.back = () => location.reload();

        $scope.isValidLocation = () => {
            $scope._newName = document.getElementById("newLocIdent").value;
            $scope._validLoc = $window.possibleCities
                ? !$window.possibleCities.includes($scope._newName)
                : false;
        };

        $scope.locationPick = () => {
            if (document.querySelector(".empty")) return;
            $scope._validLoc = false;
            $scope._newName = window.event.target.innerText;
        };

        $scope.deleteLocation = _index => {
            $scope.locations.splice(_index, 1);
        };

        $scope.arrayFetch = async () => {
            window.event.preventDefault();
            let response = await fetch(
                `${window.api}/locations/${JSON.stringify($scope.locations)}`
            );
            let json = await response.json();
            $scope.locResult = json.result;
            console.log($scope.locResult);
            //$scope.wayView = true;
        };
    }
]);
