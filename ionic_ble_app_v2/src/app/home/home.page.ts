import { Component, NgZone } from '@angular/core';
import { BLE } from '@awesome-cordova-plugins/ble/ngx';
import { DomController, LoadingController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

// LIB docs: https://github.com/don/cordova-plugin-ble-central

//const toastController = document.querySelector('ion-toast-controller');

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {

  devices:any[] = []; // create an empty array to store the found devices in, a value tied to the HomePage class (like self.devices in python)
  selectedColor = 0;

  ble_btn_text : string = "Connect";
  ble_not_connected : boolean = true; // needs to be 'true' to disable the components used.

  x_val = "None";
  y_val = "None";
  z_val = "None";

  bpm_val = "None";
  bol_val = "None";

  bpm_valid = "None";
  bol_valid = "None";
  // target = "D2:E8:AF:EE:B8:77"; // ARDUINO NANO 33 BLE
  target = "DE:84:1C:1C:7A:EB"; // SEEED XIAO BLE SENSE (final hardware)

  device_service_uuid = "45c100-00a5-521b-3fc2-a103645c1283";
  bpm_value_uuid = "45c100-01a5-521b-3fc2-a103645c1283";
  bpm_valid_uuid = "45c100-02a5-521b-3fc2-a103645c1283";
  bol_value_uuid = "45c100-03a5-521b-3fc2-a103645c1283";
  bol_valid_uuid = "45c100-04a5-521b-3fc2-a103645c1283";

  interval_inst: any;


  constructor(private ble: BLE, private ngZone: NgZone, public toastController: ToastController, private alertController: AlertController, private loadingController : LoadingController) {
    this.interval_inst = setInterval(()=> {
      if(this.ble_not_connected == false) {
        this.GetLatestData();
      }
    },1000);
  }

  Scan() {

    this.devices = [];
    this.ble.scan([],15).subscribe(device => this.onDeviceDiscovered(device));

  }

  async Connect() {
    // Scan for devices
    //this.Scan();
    // connect to the ble device
    //console.log("Connecting to device...");
    const loading = await this.loadingController.create({
      message: "Connecting to Device...",
    });

    if(this.ble_btn_text == "Connect") {
      this.ble.connect(this.target).subscribe(deviceData => this.connectionSuccessful(deviceData, loading), deviceData => this.connectionFailed(deviceData, loading));
      loading.present();
    } else {
      this.ble.disconnect(this.target);
      clearInterval(this.interval_inst);
      this.toastController.create({
        color: 'dark',
        duration: 1000,
        message: "Device Disconnected.",
      }).then(toast => {
        toast.present();
      });
      this.ble_btn_text = "Connect"
      this.ble_not_connected = true;
    }
  }

  ApplyColor() {
    console.log("Will Apply Color Here.");
    var final_packet = new Uint8Array(1);
    final_packet[0] = this.selectedColor;
    this.ble.write(this.target, "0045c100-00a5-521b-3fc2-a103645c1283", "0045c100-01a5-521b-3fc2-a103645c1283", final_packet.buffer);

  }

  async GetLatestData() {
    var decoder = new TextDecoder("utf-8");
    console.log("Getting Latest Data from device");
    //this.ble.read(this.target, "1800","2A00")//.subscribe(respData => function(respData) { this.x_val = respData.value; }, function(respData) { this.x_val = "ERROR"; });
    this.x_val = decoder.decode(await this.ble.read(this.target, "1800","2A00"));
    this.y_val = decoder.decode(await this.ble.read(this.target, "1800","2A00"));
    this.z_val = decoder.decode(await this.ble.read(this.target, "1800","2A00"));

    var bpm_valid_data = new Uint8Array(await this.ble.read(this.target, this.device_service_uuid, this.bpm_valid_uuid));
    var bol_valid_data = new Uint8Array(await this.ble.read(this.target, this.device_service_uuid, this.bol_valid_uuid));

    var bpm_value_data = new Uint8Array(await this.ble.read(this.target, this.device_service_uuid,this.bpm_value_uuid));
    var bol_value_data = new Uint8Array(await this.ble.read(this.target, this.device_service_uuid,this.bol_value_uuid));

    this.bpm_valid = bpm_valid_data[0].toString();//bpm_valid_data.toString();
    this.bol_valid = bol_valid_data[0].toString();
    
    if(this.bpm_valid == "1") {
      this.bpm_val = bpm_value_data[0].toString();
    } else {
      this.bpm_val = "No Reading";
    }

    if(this.bol_valid == "1") {
      this.bol_val = bol_value_data[0].toString() + "%";
    } else {
      this.bol_val = "No Reading";
    }

  }



  connectionSuccessful(deviceData, loading) {
    this.ble_not_connected = false;
    this.ble_btn_text = "Disconnect"
    loading.dismiss();
    console.log("Connected to device successfully! Data: " + JSON.stringify(deviceData, null, 2));
    this.toastController.create({
      color: 'dark',
      duration: 1000,
      message: "Connected Successfully.",
    }).then(toast => {
      toast.present();
    });
  }

  async connectionFailed(deviceData, loading) {
    this.ble_not_connected = true;
    loading.dismiss();
    console.log("Connection Failed! ERROR: " + JSON.stringify(deviceData, null, 2));
    const alert = await this.alertController.create({
      header: 'Connection Failed',
      subHeader: 'Arduino RGB',
      message: 'lost Connection to Device.',
      buttons: ['OK'],
    });

    await alert.present();
    /*this.toastController.create({
      color: 'dark',
      duration: 1000,
      message: "Connection Failed!"
    }).then(toast => {
      toast.present();
    });*/
  }

  handleColorSelection(e) {
    console.log("Color Selection Saved.")
    this.selectedColor = +e.detail.value;
    this.ApplyColor();
  }

  onDeviceDiscovered(device) {

    console.log("Discovered " + JSON.stringify(device, null, 2));

    this.ngZone.run(() => 
    {
      this.devices.push(device)
      console.log(device)
    })

  }

}