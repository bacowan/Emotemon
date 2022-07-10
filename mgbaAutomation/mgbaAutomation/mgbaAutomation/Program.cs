using System.Diagnostics;
using System.Windows.Automation;

namespace mgbaAutomation
{
    class Program
    {
        static void Main(string[] args)
        {
            var path = "C:\\Program Files\\mGBA\\mGBA.exe";
            var processStartInfo = new ProcessStartInfo(path);
            var process = Process.Start(processStartInfo);
            process.WaitForInputIdle();
            var mainWindow = AutomationElement.RootElement.FindFirst(
                TreeScope.Children,
                new PropertyCondition(AutomationElement.ProcessIdProperty, process.Id));
        }
    }
}
