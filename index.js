const companyId = 76;
const manufacturerDataValuePrefix = '02';

const refresh = () => {
  window.document.location.reload();
};

const handleChange = (evt) => {
  setInformation({ ...information, [evt.target.name]: evt.target.value });
};

const handleSubmit = () => {
  console.log(information);
  let lock = false;
  listDevice.forEach(function (item, index) {
    if (
      item.uuid.slice(0, 12) === information.device ||
      item.uuid.slice(12, 20) === information.user ||
      item.uuid.slice(20, 28) === information.variable
    ) {
      lock = true;
    }
  });
  if (lock === true) {
    alert('Successful, Correct Information');
    window.open(site);
  } else {
    alert('Failed!! The input is not correct. Please check the codes');
  }
  console.log('🚀 ~ file: App.js ~ line 76 ~ handleSubmit ~ lock', lock);
  setInformation({
    device: '',
    user: '',
    variale: '',
  });
};

const SCAN_OPTIONS = {
  acceptAllAdvertisements: true,
  keepRepeatedDevices: true,
  acceptAllDevices: true,
};

let arr = [];
function startDeviceScanner() {
  navigator.bluetooth
    .requestLEScan(SCAN_OPTIONS)
    .then((scanner) => {
      console.log(scanner.active);
      navigator.bluetooth.addEventListener('advertisementreceived', (event) => {
        /* Display device data */
        let manuData = event.manufacturerData;
        let appleData = event.manufacturerData.get(0x004c);

        for (var [key, value] of manuData) {
          var manufacturerDataValue_changedHex = '';

          for (var i = 0; i < value.byteLength; i++) {
            if (value.getUint8(i) < 0x0f) manufacturerDataValue_changedHex += '0';

            manufacturerDataValue_changedHex += value.getUint8(i).toString(16);
          }
          // narrow down to iBeacon
          if (
            key === companyId &&
            manufacturerDataValue_changedHex.slice(0, 2) === manufacturerDataValuePrefix
          ) {
            /**
             * Display device data, etc…
             */
            if (!arr.some((el) => el.uuid === manufacturerDataValue_changedHex.slice(4, 32))) {
              let major = appleData.getUint16(18, false);
              let minor = appleData.getUint16(20, false);
              let txPowerAt1m = -appleData.getInt8(22);
              let pathLossVs1m = txPowerAt1m - event.rssi;
              // ✅ only runs if value not in array
              let data = {
                uuid: manufacturerDataValue_changedHex.slice(4, 32),
                major: major,
                minor: minor,
                power: txPowerAt1m,
                pathLossVs1m: pathLossVs1m,
              };
              arr.push(data);
            //   setListDevice((pre) => [...pre, data]);
            }
          }
        }
      });
    })
    .catch((error) => {
      console.log(error);
    });
}

$(document).ready(function(){
    $( "#refresh" ).on("click", function( event ) {
        refresh();
    })
    $( "#scan" ).on("click", function( event ) {
        startDeviceScanner();
    })
    setInterval(()=>{
        $(".list_beacon").empty()
        $.each(arr, function(index, item){
            $(".list_beacon").append("<div class='m-3 border'><div>uuid: "+arr[index].uuid+"</div><div class='d-flex'><div class='mr-3'>major: "+arr[index].major+"</div><div class='ml-3'>minor: "+arr[index].minor+"</div></div><div class='d-flex'><div class='mr-3'>power: "+arr[index].pathLossVs1m+"</div></div></div>")
        })
        arr=[]
    },3500)
    $( "#check" ).on("click", function( event ) {
        let lock = false
        let device = $( "#device" ).val();
        let user = $( "#user" ).val();
        let variale = $( "#variale" ).val();
        let site = $( "#site" ).val();
        for (let index = 0; index < arr.length; index++) {
            if(device === arr[index].uuid.slice(0, 12) ||
            user === arr[index].uuid.slice(12, 20) ||
            variale === arr[index].uuid.slice(20, 28)
            ){
                alert("Successful, Correct Information");
                window.open(site);
            }else {
                alert("Failed!! The input is not correct. Please check the codes");
            }
        }
    })
})
