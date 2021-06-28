const PageObject = require('./pages/PageObject.js')
class ExamplePage extends PageObject {
  constructor (options = {}) {
    super(options)
  }
}
async function main () {
  console.log('in')
  const examplePageObject = new ExamplePage({ launchOptions: { headless: false, defaultViewport: { width: 1588, height: 2244 } } })
  await examplePageObject.init()
  await examplePageObject.open('https://developer.salesforce.com/developer-centers/')
  await examplePageObject.screenshot()
  await examplePageObject.close()
  console.log('out')
}
main()
