const SalesforcePage = require('./LoginPage')
//const Constants = require('../constants/apar-pay-requests-page')
class MusicReader extends SalesforcePage {
  constructor (options = {}) {
    super(options)
  }

  async MFcuesheettab (pageInfo = { url: '/lightning/o/Case/list?filterName=Recent'}) {
    const url = `${process.env.sf_instanceUrl}/${pageInfo.url}`
    console.warn(`opening ${url}`)
    const { page } = this
    await page.setDefaultNavigationTimeout(20000)
    await page.goto(url)
    await (ms => new Promise(resolve => setTimeout(resolve, ms)))(5000) // let the page settle -- should actually detect "settled"
    return page.waitForSelector('.slds-page-header--object-home')
  }

}

module.exports = MusicReader
