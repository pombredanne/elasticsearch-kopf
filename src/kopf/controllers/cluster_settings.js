function ClusterSettingsController($scope, $location, $timeout) {
	$scope.saveClusterSettings=function() {
			var new_settings = {};
			new_settings['transient'] = $scope.cluster.settings;
			var response = $scope.client.updateClusterSettings(JSON.stringify(new_settings, undefined, ""),
				function(response) {
					$scope.modal.alert = new SuccessAlert("Cluster settings were successfully updated",response);
					$scope.broadcastMessage('forceRefresh', {});
				}, 
				function(error) {
					$scope.modal.alert = new ErrorAlert("Error while updating cluster settings",error);
				}
		);
	}
}