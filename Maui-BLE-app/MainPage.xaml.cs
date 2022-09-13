using Maui_BLE_app.Models;
using System.Collections.ObjectModel;

namespace Maui_BLE_app;

public partial class MainPage : ContentPage
{
	int count = 0;

	// public List<BLE_List_Device> devices { get; set; } = new List<BLE_List_Device>();

	ObservableCollection<BLE_List_Device> devices = new ObservableCollection<BLE_List_Device>();

	public ObservableCollection<BLE_List_Device> Devices { get { return devices; } }

	public MainPage()
	{
		InitializeComponent();
		GenerateItem();
		GenerateItem();


    }

	private void OnDiscoverClicked(object sender, EventArgs e)

	{
		GenerateItem();

    }

	private void OnItemSelected(object sender, SelectedItemChangedEventArgs args)
	{
		BLE_List_Device device = args.SelectedItem as BLE_List_Device;
	}

	private void GenerateItem()
	{
        BLE_List_Device device = new BLE_List_Device();
        device.Name = "Device " + count;
        device.Address = "AA:BB:CC:DD:EE:FF";

        Console.WriteLine("Creating Entry '" + device.Name + ":" + device.Address + "'");

        devices.Add(device);

        count++;
    }
}

