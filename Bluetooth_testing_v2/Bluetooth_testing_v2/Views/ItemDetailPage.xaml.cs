using Bluetooth_testing_v2.ViewModels;
using System.ComponentModel;
using Xamarin.Forms;

namespace Bluetooth_testing_v2.Views
{
    public partial class ItemDetailPage : ContentPage
    {
        public ItemDetailPage()
        {
            InitializeComponent();
            BindingContext = new ItemDetailViewModel();
        }
    }
}