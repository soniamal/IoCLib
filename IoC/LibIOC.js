/* eslint-disable dot-notation */
const { ClassicPage } = require('e2e-core')
// fixes/additions to the core Classic page -- merge them back periodically
class FixedClassicPage extends ClassicPage {
  constructor (options = {}) {
    super(options)
    if (options.page) {
      this.page.setDefaultNavigationTimeout(60000)
      this.page.setDefaultTimeout(60000)
    }
  }

  async typeover (element, text) {
    const { page } = this
    await element.click()
    await page.keyboard.down('Control'); await page.keyboard.press('KeyA'); await page.keyboard.up('Control'); await page.keyboard.press('Delete')
    return element.type(text)
  }

  async chooseFiles (element, files) {
    const [fileChooser] = await Promise.all([
      this.page.waitForFileChooser(),
      element.click() // some button that triggers file selection
    ])
    const filesAsArray = Array.isArray(files) ? files : [files] // input can be string or array of strings
    await fileChooser.accept(filesAsArray)
    const wasCancelled = !(await element.evaluate(el => el.dispatchEvent(new Event('change', { bubbles: true })))) // pptr doesn't fire this event
    // dispatch event is synchronous and returns false if the event is cancelled, true otherwise
    return Promise.resolve(wasCancelled ? null : fileChooser)
  }

  async waitForButton (labelText) {
    // TODO -- accept 'page' as a second parameter, defaulted to this.page
    const { page } = this
    const xpath = `(//input[contains(@class,'btn') and @value='${labelText}'])|(//button[normalize-space(text())='${labelText}'])`
    return page.waitForXPath(xpath)
  }

  async waitForXPath (xpath) {
    // TODO -- accept 'page' as a second parameter, defaulted to this.page
    const { page } = this
    return page.waitForXPath(xpath)
  }

  async waitForSelector (selector) {
    // TODO -- accept 'page' as a second parameter, defaulted to this.page
    const { page } = this
    return page.waitForSelector(selector)
  }

  async waitForClose () {
    return new Promise(resolve => this.page.once('close', resolve))
  }

  async prepareToAcceptUpcomingDialog () {
    // TODO -- accept 'page' as a second parameter, defaulted to this.page
    const { page } = this
    page.on('dialog', async dialog => await dialog.accept())
  }
}

// CPA entry dialog(s)
class CPAEntryPage extends FixedClassicPage {
  constructor (options = {}) { super(options) }

  async gotoAddNewTab () {
    const { page } = this
    const tabToClick = await page.waitForSelector('td.rich-tabhdr-cell-inactive > table')
    await Promise.all([
      page.waitForNavigation(),
      tabToClick.click()
    ])
    return Promise.resolve(page)
  }

  async enterComposer (data) {
    const form = this.page
    const el = {}
    el['First Name'] = await this.getElementByFieldLabel('First Name', '/following::input[1]', form)
    await this.typeover(el['First Name'], data['First Name'])
    el['Last Name'] = await this.getElementByFieldLabel('Last Name', '/following::input[1]', form)
    await this.typeover(el['Last Name'], data['Last Name'])
    el['Percentage'] = await this.getElementByFieldLabel('Percentage', '/following::input[1]', form)
    await this.typeover(el['Percentage'], data['Percentage'])
    el['Society'] = await this.getElementByFieldLabel('Society', '/following::select', form)
    await el['Society'].select(data['Society'])
    return Promise.resolve(true)
  }

  async enterPublisher (data) {
    const el = {}
    el['Name'] = await this.getElementByFieldLabel('Name', '/following::input[1]')
    await this.typeover(el['Name'], data['Name'])
    el['Percentage'] = await this.getElementByFieldLabel('Percentage', '/following::input[1]')
    await this.typeover(el['Percentage'], data['Percentage'])
    el['Society'] = await this.getElementByFieldLabel('Society', '/following::select')
    await el['Society'].select(data['Society'])
    return Promise.resolve(true)
  }

  async enterSong (data) {
    const el = {}
    el['Song Title'] = await this.getElementByFieldLabel('Song Title:', '/following::input[1]')
    await this.typeover(el['Song Title'], data['Song Title'])
    return Promise.resolve(true)
  }

  async searchAndSelectSong (data) {
    // el['Contains Search'] = await this.waitForButton('Contains Search')
    // el['Song Title'] = (await el['Contains Search'].$x('../input'))[0]
    // await this.typeover(el['Song Title'], data['Song Title'])
    // const [x] = await Promise.all([this.waitForSelector('.dataCell > a'), el['Contains Search'].click()])
    // await x.click()
  }
}

// Cue Sheet Entry page
class CueSheetPage extends FixedClassicPage {
  constructor (options = {}) {
    super(options)
  }

  async openView () {
    const info = { objectPrefix: '500' }
    const url = `${process.env.sf_instanceUrl}/${info.objectPrefix}`
    console.warn(`opening ${url}`)
    const { page } = this
    await page.setDefaultNavigationTimeout(30000)
    return page.goto(url)
  }

  async getNthCaseLink (n = '1') {
    const selector = `.listBody .x-grid3-row-table:nth-of-type(${n}) >tbody>tr>td:nth-of-type(4) a`
    const { page } = this
    const elPromise = page.waitForSelector(selector)
    return elPromise
  }

  async openById (sfid) {
    const url = `${process.env.sf_instanceUrl}/${sfid}`
    console.warn(`opening ${url}`)
    const { page } = this
    await page.setDefaultNavigationTimeout(30000)
    return page.goto(url)
  }

  async edit () {
    return this.clickButtonAndWait('Edit')
  }

  async import () {
    await this.clickButton('Import CueSheet')
    return Promise.resolve(this.page)
  }

  async clickAndWaitForNewTab (element) {
    const [popup] = await Promise.all([
      new Promise(resolve => this.page.once('targetcreated', target => resolve(target.page()))),
      element.click()
    ])
    return Promise.resolve(popup)
  }

  async verify () {
    const { page } = this
    const buttonVerifyAll = await page.waitForSelector('button#cmdVerifySong')
    page.on('popup', () => console.info('👉New page is opened'))
    page.on('targetcreated', () => console.info('👉New targetcreated'))
    const verifyPage = this.clickAndWaitForPopup(buttonVerifyAll)
    return Promise.resolve(verifyPage)
  }

  async enterImportSeq (form, data) {
    const el = {}
    el['Import Source'] = await this.getElementByFieldLabel('Import Source', '/following::select', form)
    await el['Import Source'].select(data['Import Source'])
    return Promise.resolve(form)
  }

  async chooseFile (form, data) {
    await this.waitForButton('Import')
    const el = await page.waitForXPath('//label[starts-with(normalize-space(text()),"Filename")]')
    const fileChooser = await this.clickAndWaitFileChooser(el)
    await fileChooser.accept([data.Filename]) // put file name in [] to pass an array of length 1
    return Promise.resolve(fileChooser)
  }

  async importFile (form, data) {
    const { page } = this
    const el = {}
    el['Import Source'] = await page.waitForXPath('//select[@title="Import Source"]')
    await el['Import Source'].select(data['Import Source'])
    const labelChooser = 'Filename' // actually 'Filename\u00a0\u00a0\u00a0 \u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0'
    const labelImportButton = 'Import'
    // this page has an non-standard input INSIDE a label with &nbsp, so we use xpath rather than .getElementByFieldLabel
    el[labelChooser] = await page.waitForXPath(`//label[starts-with(normalize-space(text()),'${labelChooser}')]/input`)
    await this.chooseFiles(el[labelChooser], data[labelChooser])
    return this.clickButtonAndWait(labelImportButton)
  }

  async importCue () {
    await Promise.all([
      this.clickButton('Import'),
      this.waitForNavigation({ waitUntil: 'networkidle0' })
    ])
  }

  async setComment (text) {
    const el = await this.waitForElementByFieldLabel('Comment', '/following::textarea')
    return el.type(text)
  }

  async addSequence () {
    await this.clickButton('Add Song')
    await this.page.waitForSelector('#spinner', { hidden: false })
    await this.page.waitForSelector('#spinner', { hidden: true })
    const sequenceEditFormXPath = '//div[contains(@class,"ui-accordion")]/following::div[@class="editPage"][last()]'
    return this.page.waitForXPath(sequenceEditFormXPath)
  }

  async enterSequence (form, data) {
    const el = {}
    el.Occurrence = await this.getElementByFieldLabel('Occurrence', '/following::input[1]', form)
    await this.typeover(el.Occurrence, data.Occurrence)
    el.Comment = await this.getElementByFieldLabel('Comment', '/following::textarea[1]', form)
    await this.typeover(el.Comment, data.Comment)
    el.Duration = await this.getElementByFieldLabel('Duration', '/following::input', form, 2)
    await this.typeover(el.Duration[0], data.Duration[0])
    await this.typeover(el.Duration[1], data.Duration[1])
    el['Cue Usage'] = await this.getElementByFieldLabel('Cue Usage', '/following::select', form)
    await el['Cue Usage'].select(data['Cue Usage'])
  }

  async openCPAEntry (form, fieldLabel) {
    const elAdd = await this.getElementByFieldLabel(fieldLabel, '/following::a[1]', form)
    const popupPage = await this.clickAndWaitForPopup(elAdd)
    const opts = this.getOptions()
    opts.page = popupPage
    const cpaEntry = await new CPAEntryPage(opts)
    return Promise.resolve(cpaEntry)
  }

  async clickAddNewSong (form) {
    return this.openCPAEntry(form, 'Song Title')
  }

  async clickAddNewComposer (form) {
    return this.openCPAEntry(form, 'Composers')
  }

  async clickAddNewPublisher (form) {
    return this.openCPAEntry(form, 'Publishers')
  }

  async enterComposer (cpaEntry, composerData) {
    await cpaEntry.gotoAddNewTab()
    await cpaEntry.enterComposer(composerData)
    await cpaEntry.clickButton('Add New Composer') // 'Add Composer' in QA
    return Promise.resolve(cpaEntry)
  }

  async enterPublisher (cpaEntry, publisherData) {
    await cpaEntry.gotoAddNewTab()
    await cpaEntry.enterPublisher(publisherData)
    await cpaEntry.clickButton('Add New Publisher')
    return Promise.resolve(cpaEntry)
  }

  async enterSong (cpaEntry, songData) {
    await cpaEntry.gotoAddNewTab()
    await cpaEntry.enterSong(songData)
    await cpaEntry.clickButton('Add as New Song')
    return Promise.resolve(cpaEntry)
  }

  async newCueSheet () {
    await this.clickButton('New Cue Sheet')
    return Promise.resolve(this.page)
  }

  async save () {
    // multiple save buttons on CueSheetEdit, so we need to be specific, not just "clickButton"
    const sequenceForm = await page.waitForXPath('(//div[@class="editPage"])[last()]')
    const elSave = await sequenceForm.$('input.btn[value="Save"]')
    await elSave.click()
    await this.page.waitForSelector('#spinner', { hidden: false })
    await this.page.waitForSelector('#spinner', { hidden: true })
    return await page.waitForXPath('(//div[@class="editPage"])[last()]')
  }

  // TODO: addSongViaSearch (form, data) {}
  // TODO: addComposerViaSearch (form, data) {}
  // TODO: addPublisherViaSearch (form, data) {}
}

module.exports = CueSheetPage

/* REPL USAGE EXAMPLE  node --experimental-repl-await
require('dotenv').config(); const PageManagers = require('./pages');
const { credentials } = require('./.env.js');const useCredential = credentials.defaultUser;
const pptrOptions={ launchOptions: { headless: false, sloMo: 200, defaultViewport: { width: 1588, height: 2244 } } };
process.env.sf_instanceUrl='https://tvmusic--qa.my.salesforce.com' // Jake only
let session = await new PageManagers['MF-CueSheet'](pptrOptions); await session.init(); await session.loginAs(useCredential);
let {browser,page} = session
await session.openView()
let el = await session.getNthCaseLink(1)
await el.click()
await session.edit()
await session.setComment('This is my comment\rThis is line two of my comment')
let form = await session.addSong()
let sequenceData = {
  Occurrence: '2',
  Duration: ['0', '10'],
  Comment: 'Comment here',
  'Cue Usage': 'Background Vocal (BV)',
  Composer: {'First Name': 'John', 'Last Name': 'Test', Society: 'BMI', Percentage: '100' }
}
await session.enterSequence(form, sequenceData)
// Work on Popup Add composers here
let popup = await session.addComposer(form, sequenceData.Composer)
// let popup = await session.clickAndWaitForPopup(el)
// https://pptr.dev/#?product=Puppeteer&version=v4.0.0&show=api-event-popup
// USE THE FOLLOWING TO DEMO 'enterSequence' one line at a time
let form = await page.waitForXPath('(//div[@class='editPage'])[last()]')
let data = {
  Occurrence: '2',
  Duration: ['0', '10'],
  Comment: 'Comment here',
  'Cue Usage': 'Backgound Vocal (BV)'
}
let el = {}
el.Occurrence = await session.getElementByFieldLabel('Occurrence', '/following::input[1]', form)
await session.typeover(el.Occurrence, data.Occurrence)
el.Comment = await session.getElementByFieldLabel('Comment', '/following::textarea[1]', form)
await session.typeover(el.Comment, data.Comment)
el.Duration = await session.getElementByFieldLabel('Duration', '/following::input', form, 2)
await session.typeover(el.Duration[0], data.Duration[0])
await session.typeover(el.Duration[1], data.Duration[1])
el['Cue Usage'] = await session.getElementByFieldLabel('Cue Usage', '/following::select', form)
await el['Cue Usage'].select(data['Cue Usage'])
// end EnterSequence Demo
const caseId = '5004M00000aZERXQA4';
await session.openById(caseId);
*/
/* NOTES FOR DEALING WITH IFRAME INSIDE LIGHTNING
force-aloha-page -> 'fap'
const fapIFrame = await document.querySelector('force-aloha-page').shadowRoot.firstElementChild
const btnEditSelector = '#Block1\\:TheForm\\:cueMain\\:j_id41\\:EditSheetButton';
document.querySelector()
*/
