<?php  /* Check if token is set or redirect to login page */
include ("../phplib/install.php");
include ("../phplib/srvconn.php");

$server="localhost";
$UserID='heating';

$conn = new mysqli($servername, $username, $password);
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$query="
SELECT * FROM (
SELECT 
    A.*, 
    B.address_temperature_sensor, 
    C.status,
    D.address_switch,
    E.address_switch_state,
	F.type,
	G.address_window
FROM
(select ObjectID, Value as TargetTemperature from $AppDB.objects where Property='target_temperature') as A
LEFT JOIN 
(select ObjectID, Value as address_temperature_sensor from $AppDB.objects where Property='address_temperature_sensor') as B
ON A.ObjectID=B.ObjectID
LEFT JOIN 
(select ObjectID, Value as status from $AppDB.objects where Property='status') as C
ON A.ObjectID=C.ObjectID
LEFT JOIN 
(select ObjectID, Value as address_switch from $AppDB.objects where Property='address_switch') as D
ON A.ObjectID=D.ObjectID
LEFT JOIN 
(select ObjectID, Value as address_switch_state from $AppDB.objects where Property='address_switch_state') as E
ON A.ObjectID=E.ObjectID
LEFT JOIN 
(select ObjectID, Value as type from $AppDB.objects where Property='type') as F
ON A.ObjectID=F.ObjectID
LEFT JOIN 
(select ObjectID, Value as address_window from $AppDB.objects where Property='address_heating_state') as G
ON A.ObjectID=G.ObjectID
) as Z
WHERE type='AirCondControl'
";

$result = $conn->query($query);
$rows=array();
if ($result->num_rows > 0) {
  while($row = $result->fetch_assoc()) {
	$rows[]=$row;
  }
}
	
foreach($rows as $elem) {

	$now=date("Y-m-d H:i:s");

	$id=$elem['ObjectID'];
	$address_temperature_sensor=$elem['address_temperature_sensor'];
	$target=floatval(trim($elem['TargetTemperature']));
	$status=$elem['status'];
	$address_switch=$elem['address_switch'];
	$address_switch_state=$elem['address_switch_state'];
	$address_window=$elem['address_window'];

	$url=$server."/script/sensor.php?action=get&type=temperature&address_state=".$address_temperature_sensor;

	$curl = curl_init($url);
	curl_setopt($curl, CURLOPT_URL, $url);
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
	//for debug only!
	curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
	curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
	$current = floatval(trim(curl_exec($curl)));
	curl_close($curl);

	$url= $server."/script/state.php?address=".$address_switch_state;

	$curl = curl_init($url);
	curl_setopt($curl, CURLOPT_URL, $url);
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
	//for debug only!
	curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
	curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
	$current_switch_state = intval(trim(curl_exec($curl)));
	curl_close($curl);

	$url= $server."/script/state.php?address=".$address_window;

	$curl = curl_init($url);
	curl_setopt($curl, CURLOPT_URL, $url);
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
	//for debug only!
	curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
	curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
	$window_state = intval(trim(curl_exec($curl)));
	curl_close($curl);


	echo "$now $id Status: $status Current temperature: $current Target: $target Current switch state: $current_switch_state Window: $window_state\n";
//	continue;
	
	$action=null;


	if (intval($window_state) == 1 && intval($status) == 1)  {
		echo "Window is open. Disabling.\n";

		$query="
		UPDATE $AppDB.objects
		SET Value='0'
		WHERE ObjectID='$id'
		AND Property='status'
		";
		$result = $conn->query($query);

	}




	if (intval($current_switch_state)==1 && intval($window_state) == 1)  {
		echo "Window is open. Switching off";
		$action='off';
		$now=date("Y-m-d H:i:s");
		$Entry="Switching $action, current $current target $target";

		$query="
		INSERT INTO $AppDB.objects_log (ObjectID, Timestamp, UserID)
		VALUES ('$id', '$now', '$Entry', '$UserID')
		";
		$result = $conn->query($query);

        echo "\n$now > $id: $Entry";
	}

	if (intval($status) == 0) 	{
		
		if (intval($current_switch_state)==1) 
			
			{
			echo "Disabled. Switching off";
			$action='off';
			$now=date("Y-m-d H:i:s");
			$Entry="Switching $action, current $current target $target";

			$query="
			INSERT INTO $AppDB.objects_log (ObjectID, Timestamp, UserID)
			VALUES ('$id', '$now', '$Entry', '$UserID')
			";
			$result = $conn->query($query);
			echo "\n$now > $id: $Entry";
			}
	}


	else if (intval($current_switch_state)==1 && floatval($current)<=floatval($target))  {
		echo "Switching off";
		$action='off';
		$now=date("Y-m-d H:i:s");
		$Entry="Switching $action, current $current target $target";

		$query="
		INSERT INTO $AppDB.objects_log (ObjectID, Timestamp, UserID)
		VALUES ('$id', '$now', '$Entry', '$UserID')
		";
		$result = $conn->query($query);
        echo "\n$now > $id: $Entry";
	}

	else if (intval($current_switch_state)==0 && floatval($current)>floatval($target)) {

		if (intval($status) == 1) 	$action='on';
		else $action = 'off';

		$now=date("Y-m-d H:i:s");
		$Entry="Switching $action, current $current target $target";

		$query="
		INSERT INTO $AppDB.objects_log (ObjectID, Timestamp, UserID)
		VALUES ('$id', '$now', '$Entry', '$UserID')
		";
		$result = $conn->query($query);
		echo "\n$now > $id: $Entry";
		}

	else  {

//		echo "\n$now > $id: no action, current $current target $target switch $current_switch_state";
		continue;
	}

	if ($action==null) continue;
	
	$url= $server."/script/switch.php?address=".$address_switch."&action=".$action;

//    echo "\n$url\n";
    
	$curl = curl_init($url);
	curl_setopt($curl, CURLOPT_URL, $url);
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
	//for debug only!
	curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
	curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
	curl_exec($curl);
	curl_close($curl);

	$url= $server."/script/state.php?address=".$address_switch_state;

//    echo "\n$url\n";

	$curl = curl_init($url);
	curl_setopt($curl, CURLOPT_URL, $url);
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
	//for debug only!
	curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
	curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
	$new_switch_state = trim(curl_exec($curl));
	curl_close($curl);

	$now=date("Y-m-d H:i:s");
	$Entry="New switch state is $new_switch_state";
	echo "\n$now > $id: $Entry";

	$query="
	INSERT INTO $AppDB.objects_log (ObjectID, Timestamp, Entry, UserID)
	VALUES ('$id', '$now', '$Entry', '$UserID')
	";
	$result = $conn->query($query);

}

?>