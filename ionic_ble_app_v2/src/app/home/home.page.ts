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

  target = "D2:E8:AF:EE:B8:77";

  constructor(private ble: BLE, private ngZone: NgZone, public toastController: ToastController, private alertController: AlertController, private loadingController : LoadingController) {
    
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
    this.bpm_val = decoder.decode(await this.ble.read(this.target, "1800","2A00"));
    this.bol_val = decoder.decode(await this.ble.read(this.target, "1800","2A00"));

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
      message: 'Failed to Connect to device "Arduino RGB".',
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
