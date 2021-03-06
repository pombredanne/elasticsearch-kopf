function GlobalController($scope, $location, $timeout) {
	$scope.version = "0.2-SNAPSHOT";
	$scope.username = null;
	$scope.password = null;
	
	$scope.setConnected=function(status) {
		$scope.is_connected = status;
	}

	$scope.broadcastMessage=function(message,args) {
		$scope.$broadcast(message,args);
	}
	
	$scope.readParameter=function(name){
	    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
		return (results != null) ? results[1] : null;
	}
	
	$scope.setHost=function(url) {
		var exp = /^(https|http):\/\/(\w+):(\w+)@(.*)/i;
		// expected: "http://user:password@host", "http", "user", "password", "host"]
		var url_parts = exp.exec(url);
		if (url_parts != null) {
			$scope.host = url_parts[1] + "://" + url_parts[4];
			$scope.username = url_parts[2];
			$scope.password = url_parts[3];
		} else {
			$scope.username = null;
			$scope.password = null;
			$scope.host = url;
		}
		$scope.setConnected(false);
		$scope.client = new ElasticClient($scope.host,$scope.username,$scope.password);
		$scope.broadcastMessage('hostChanged',{});
	}
	
	if ($location.host() == "") { // when opening from filesystem
		$scope.setHost("http://localhost:9200");
	} else {
		var location = $scope.readParameter('location');
		if (location != null) {
			$scope.setHost(location);
		} else {
			$scope.setHost($location.protocol() + "://" + $location.host() + ":" + $location.port());			
		}
 	}
	$scope.refresh = 3000;
	$scope.modal = new ModalControls();
	$scope.alert = null;
	$scope.is_connected = false;

	// should be called when an action could change status/topology of cluster
	$scope.forceRefresh=function() {
		$scope.broadcastMessage('forceRefresh',{});
	}

	$scope.hasConnection=function() {
		return $scope.is_connected;
	}
	
	$scope.isActive=function(tab) {
		return $('#' + tab).hasClass('active');
	}
	
	$scope.getHost=function() {
		return $scope.host;
	}
	
	$scope.setRefresh=function(refresh) {
		$scope.refresh = refresh;
	}
	
	$scope.getRefresh=function() {
		return $scope.refresh;
	}

	$scope.clearAlert=function() {
		$scope.alert = null;
	}
	
	$scope.readablizeBytes=function(bytes) {
		if (bytes > 0) {
		    var s = ['b', 'KB', 'MB', 'GB', 'TB', 'PB'];
		    var e = Math.floor(Math.log(bytes) / Math.log(1024));
		    return (bytes / Math.pow(1024, e)).toFixed(2) + s[e];	
		} else {
			return 0;
		}
	}

	$scope.displayInfo=function(title,info) {
		$scope.modal.title = title;
		$scope.modal.info = jsonTree.create(info);
		$('#modal_info').modal({show:true,backdrop:false});
	}
	
	$scope.setAlert=function(alert) {
		$scope.alert = alert;
	}
	
	$scope.isInModal=function() {
		return ($('.modal-backdrop').length > 0);
	}
	
	$scope.getCurrentTime=function() {
		var d = new Date(); 
		return ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);
	}
}