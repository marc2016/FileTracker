/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import $ from 'jquery'
import ko from 'knockout'

import './index.sass'
import { FileTrackerViewModel } from 'viewModels/FileTrackerViewModel'
import { MainWindowViewModel } from 'viewModels/MainWindowViewModel'
import { SyncSettingsViewModel } from 'viewModels/SyncSettingsViewModel'

const mainWindowViewModel = new MainWindowViewModel()
ko.applyBindings(mainWindowViewModel, $('#MainNavBar')[0])

const accountService = window.services.accountService
const syncSettingsViewModel = new SyncSettingsViewModel(accountService)
const programProcessService = window.services.programService
ko.applyBindings(syncSettingsViewModel, $('#SyncSettingsView')[0])
syncSettingsViewModel.show()

const syncService = window.services.syncService
const fileTrackerVideModel = new FileTrackerViewModel(
  syncService,
  accountService,
  programProcessService
)
ko.applyBindings(fileTrackerVideModel, $('#FileTrackerView')[0])
ko.applyBindings(fileTrackerVideModel, $('#FileTrackerSyncModal')[0])
fileTrackerVideModel.show()
