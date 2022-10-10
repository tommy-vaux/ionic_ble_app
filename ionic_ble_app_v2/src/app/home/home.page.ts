import { Component, NgZone } from '@angular/core';
import { BLE } from '@awesome-cordova-plugins/ble/ngx';

// LIB docs: https://github.com/don/cordova-plugin-ble-central

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  devices:any[] = []; // create an empty array to store the found devices in, a value tied to the HomePage class (like self.devices in python)
  selectedColor = 0;

  target = "D2:E8:AF:EE:B8:77";


  constructor(private ble: BLE, private ngZone: NgZone) {
    
  }

  Scan() {

    this.devices = [];
    this.ble.scan([],15).subscribe(device => this.onDeviceDiscovered(device));

  }

  Connect() {
    // Scan for devices
    //this.Scan();
    // connect to the ble device
    console.log("Connecting to device...")
    this.ble.connect(this.target).subscribe(deviceData => this.connectionSuccessful(deviceData), deviceData => this.connectionFailed(deviceData));//,this.connectionSuccessful,this.connectionFailed);
  }

  ApplyColor() {
    console.log("Will Apply Color Here.");
    var final_packet = new Uint8Array(1);
    final_packet[0] = this.selectedColor
    this.ble.write(this.target, "0045c100-00a5-521b-3fc2-a103645c1283", "0045c100-01a5-521b-3fc2-a103645c1283", final_packet.buffer);

  }

  connectionSuccessful(deviceData) {
    console.log("Connected to device successfully! Data: " + JSON.stringify(deviceData, null, 2));
  }

  connectionFailed(deviceData) {
    console.log("Connection Failed! ERROR: " + JSON.stringify(deviceData, null, 2));
  }

  handleColorSelection(e) {
    console.log("Color Selection Saved.")
    this.selectedColor = +e.detail.value;
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
