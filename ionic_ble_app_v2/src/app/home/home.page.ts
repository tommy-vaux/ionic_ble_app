import { Component, NgZone } from '@angular/core';
import { BLE } from '@awesome-cordova-plugins/ble/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  devices:any[] = []; // create an empty array to store the found devices in, a value tied to the HomePage class (like self.devices in python)

  constructor(private ble: BLE, private ngZone: NgZone) {


    
  }

  Scan() {

    this.devices = [];
    this.ble.scan([],15).subscribe(device => this.onDeviceDiscovered(device));

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
