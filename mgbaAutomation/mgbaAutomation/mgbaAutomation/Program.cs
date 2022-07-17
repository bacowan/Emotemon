using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Automation;

namespace mgbaAutomation
{
    class Program
    {
        [MTAThread]
        static void Main(string[] args)
        {
            var path = "C:\\Program Files\\mGBA\\mGBA.exe";
            var processStartInfo = new ProcessStartInfo(path);
            var process = Process.Start(processStartInfo);
            var processCondition = new PropertyCondition(AutomationElement.ProcessIdProperty, process.Id);
            process.WaitForInputIdle();
            Thread.Sleep(500); //TODO: do some kind of polling or something to wait for mainWindow to not be null
            var mainWindow = AutomationElement.RootElement.FindFirst(
                TreeScope.Children,
                processCondition);
            var menuBar = mainWindow.FindFirst(
                TreeScope.Children,
                new PropertyCondition(AutomationElement.ControlTypeProperty, ControlType.MenuBar));
            var toolsMenuItem = menuBar.FindFirst(
                TreeScope.Children,
                new PropertyCondition(AutomationElement.NameProperty, "Tools"));
            var toolsMenuItemExpand = toolsMenuItem.GetCurrentPattern(ExpandCollapsePattern.Pattern) as ExpandCollapsePattern;
            toolsMenuItemExpand.Expand();
            var menu = toolsMenuItem.FindFirst(
                TreeScope.Children,
                new PropertyCondition(AutomationElement.ControlTypeProperty, ControlType.Menu));
            var scriptingMenuItem = menu.FindFirst(
                TreeScope.Children,
                new PropertyCondition(
                    AutomationElement.NameProperty,
                    "Scripting..."));
            var scriptingMenuItemClick = scriptingMenuItem.GetCurrentPattern(InvokePattern.Pattern) as InvokePattern;
            scriptingMenuItemClick.Invoke();
            var scriptingWindow = AutomationElement.RootElement.FindFirst(
                TreeScope.Children,
                new AndCondition(
                    processCondition,
                    new PropertyCondition(
                        AutomationElement.NameProperty,
                        "Scripting")));
            var scriptingMenuBar = scriptingWindow.FindFirst(
                TreeScope.Children,
                new PropertyCondition(AutomationElement.ControlTypeProperty, ControlType.MenuBar));
            var scriptingFileMenuItem = scriptingMenuBar.FindFirst(
                TreeScope.Children,
                new PropertyCondition(AutomationElement.NameProperty, "File"));
            var scriptingFileMenuItemExpand = scriptingFileMenuItem.GetCurrentPattern(ExpandCollapsePattern.Pattern) as ExpandCollapsePattern;
            scriptingFileMenuItemExpand.Expand();
            Thread.Sleep(500); //TODO: do some kind of polling or something to wait for mainWindow to not be null
            var scriptingFileMenu = scriptingFileMenuItem.FindFirst(
                TreeScope.Children,
                new PropertyCondition(AutomationElement.ControlTypeProperty, ControlType.Menu));
            var loadScriptMenuItem = scriptingFileMenu.FindFirst(
                TreeScope.Children,
                new PropertyCondition(
                    AutomationElement.NameProperty,
                    "Load script..."));

            // the dialog blocks this thread, so we spawn a new task to do stuff in the dialog
            new Thread(() =>
            {
                AutomationElement scriptingDialog = null;
                while (scriptingDialog == null)
                {
                    Thread.Sleep(500);
                    scriptingDialog = AutomationElement.RootElement.FindFirst(
                        TreeScope.Descendants,
                        new AndCondition(
                            new PropertyCondition(
                                AutomationElement.ControlTypeProperty,
                                ControlType.Window),
                            new PropertyCondition(
                                AutomationElement.NameProperty,
                                "Select script to load")));
                    //scriptingDialog = AutomationElement.RootElement.FindFirst(
                    //    TreeScope.Children,
                    //    new AndCondition(
                    //        new PropertyCondition(
                    //            AutomationElement.ControlTypeProperty,
                    //            ControlType.Window),
                    //        new PropertyCondition(
                    //            AutomationElement.NameProperty,
                    //            "Scripting")));
                }
                var loadScriptDialog = scriptingDialog.FindFirst(
                    TreeScope.Children,
                    new PropertyCondition(
                        AutomationElement.ControlTypeProperty,
                        ControlType.Window));
                var addressBox = GetChildByType(loadScriptDialog,
                    ControlType.Pane,
                    ControlType.Pane,
                    ControlType.ProgressBar,
                    ControlType.ComboBox,
                    ControlType.Edit);

                var addressBoxEdit = addressBox.GetCurrentPattern(ValuePattern.Pattern) as ValuePattern;
                addressBoxEdit.SetValue("C:\\Users\\bccow\\programming\\Emotemon\\lua");
            }).Start();

            new Thread(() =>
            {
                var loadScriptMenuItemClick = loadScriptMenuItem.GetCurrentPattern(InvokePattern.Pattern) as InvokePattern;
                loadScriptMenuItemClick.Invoke();
            }).Start();
            
        }

        private static AutomationElement GetChildByType(AutomationElement initial, params ControlType[] controlTypes)
        {
            var ret = initial;

            foreach (var controlType in controlTypes)
            {
                ret = ret?.FindFirst(
                    TreeScope.Children,
                    new PropertyCondition(
                        AutomationElement.ControlTypeProperty,
                        controlType));
            }
            return ret;
        }
    }
}
