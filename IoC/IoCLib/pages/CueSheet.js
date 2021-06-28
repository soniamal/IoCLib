
//CueSheet Entry Page 
class CueSheetPage extends SalesforcePage {
  constructor (options = {}) {
    super(options)
  }

  //Cue sheet page functionality
  //to be built out as progress 
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
    const el = page.waitForSelector(selector)
    return el
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

  async addSong () {
    await this.clickButton('Add Song')
    await this.page.waitForNavigation()
    
  }

  async save () {
    await this.clickButton('Save')
    return Promise.resolve(this.page)
  }


}


class CPAEntryPage extends SalesforcePage {
  //for composer producer data entry 
}

module.exports = CueSheetPage

