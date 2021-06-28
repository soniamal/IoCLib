
const samplePageObject = require('./samplePageObject')


//logs us into salesforce
class LoginPage extends samplePageObject {
  constructor (options = {}) {
    super(options)
    this.switchToClassic = options.switchToClassic || false
  }

  async login () {
    var defaultCredentials = {
      sf_username: process.env.sf_username,
      sf_password: process.env.sf_password,
    }
    return this.loginAs(defaultCredentials)
  }

  async loginAs (credentials) {
  
    const page = this.page
    page.setDefaultNavigationTimeout(30000)
    await page.goto(process.env.sf_loginUrl)
    await page.type('#username', credentials.sf_username)
    await page.type('#password', credentials.sf_password)
    await page.click('#Login') // .findByCssSelector('#Login')
    console.log('credentials submitted')
    await page.waitForNavigation()
    // TODO: throw a specific error for "verification page reached - configure Setup-Network Access" using //input[@value='Verify']
    // assert that user is logged in via XPath
    console.log('evaluating result')
    await page.waitForXPath("//a[contains(@href,'/secur/logout.jsp')]") // the LINK is available in either experience
    if (this.switchToClassic) {
      await page.evaluate(WAITFORAURASCRIPT)
      await page.waitForXPath("//a[text()='Logout' and @title='Logout']") // Classic wording (Lightning is "Log Out")
      console.log('logged in to classic')
    } else {
      // await page.waitForXPath("//input[@title='Search Salesforce']")
      await page.waitForSelector('#oneHeader')
    }


  }
  
}
module.exports = LoginPage
